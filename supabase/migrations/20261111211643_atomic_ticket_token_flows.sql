create or replace function public.registrar_venta_ticket_token(
  p_ticket_id uuid,
  p_buyer_id uuid,
  p_event_id uuid,
  p_zone_id uuid,
  p_unidad_academica_id integer,
  p_ticket_type text,
  p_ticket_data jsonb,
  p_token_code text,
  p_total numeric,
  p_monto numeric,
  p_paid boolean
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role integer;
  v_buyer_email text;
  v_profile_email text;
  v_profile_unidad_academica_id integer;
  v_unidad_academica_id integer;
  v_purchase_id uuid := gen_random_uuid();
  v_ticket_id uuid := coalesce(p_ticket_id, gen_random_uuid());
  v_existing_purchase_id uuid;
  v_payment_status text := case when p_paid then 'completado' else 'faltante' end;
  v_token_status text := case when p_paid then 'usado' else 'disponible' end;
  v_purchase_status text := case when p_paid then 'completed' else 'pending' end;
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada.';
  end if;

  select p.id_rol
    into v_role
    from public.profiles p
   where p.id = auth.uid();

  if v_role is null or v_role not in (1, 2) then
    raise exception 'No tienes permisos para registrar una venta.';
  end if;

  if p_buyer_id is null or p_event_id is null or p_zone_id is null
     or nullif(btrim(p_token_code), '') is null
     or p_total is null or p_total <= 0
     or p_monto is null or p_monto <= 0 or p_monto > p_total
     or p_paid is null or (p_paid and p_monto <> p_total)
     or p_ticket_type is null or p_ticket_type not in ('alumno', 'empresa') then
    raise exception 'Los datos obligatorios de la venta son inválidos.';
  end if;

  if p_event_id <> '6b077c0c-ca75-483c-87d4-1211118936d2'::uuid then
    raise exception 'El evento de la venta no es el evento activo.';
  end if;

  if not exists (
    select 1 from public.events e where e.id = p_event_id
  ) or not exists (
    select 1 from public.zones z
     where z.id = p_zone_id and z.event_id = p_event_id
  ) then
    raise exception 'El evento o la zona no están disponibles.';
  end if;

  select p.unidad_academica_id, p.email
    into v_profile_unidad_academica_id, v_profile_email
    from public.profiles p
   where p.id = p_buyer_id;

  if not found then
    raise exception 'No existe el perfil del comprador.';
  end if;

  v_unidad_academica_id := coalesce(
    p_unidad_academica_id,
    v_profile_unidad_academica_id,
    case
      when lower(coalesce(v_profile_email, p_ticket_data->>'email', '')) like '%@zongolica.tecnm.mx' then 8
      else null
    end
  );

  if v_unidad_academica_id is null then
    raise exception 'El comprador debe tener una Unidad Académica asignada.';
  end if;

  if v_profile_unidad_academica_id is null and v_unidad_academica_id = 8 then
    update public.profiles
       set unidad_academica_id = 8
     where id = p_buyer_id;
  end if;

  if exists (
    select 1
      from public.tokens_canje tc
     where tc.event_id = p_event_id
       and (tc.creado_por = p_buyer_id or tc.utilizado_por = p_buyer_id)
  ) then
    raise exception 'El comprador ya tiene un token para este evento.';
  end if;

  if p_ticket_id is not null then
    select t.purchase_id
      into v_existing_purchase_id
      from public.tickets t
     where t.id = p_ticket_id
       and t.buyer_id = p_buyer_id
     for update;

    if not found then
      raise exception 'No se encontró el pre-registro del comprador.';
    end if;
    if v_existing_purchase_id is not null then
      raise exception 'El boleto ya tiene una compra asociada; liquídala desde el flujo de apartados.';
    end if;
  end if;

  v_buyer_email := coalesce(nullif(btrim(p_ticket_data->>'email'), ''), v_profile_email);
  if v_buyer_email is null then
    raise exception 'El correo del comprador es obligatorio.';
  end if;

  insert into public.purchases (id, total, amount_paid, status)
  values (v_purchase_id, p_total, p_monto, v_purchase_status);

  if p_ticket_id is not null then
    update public.tickets
       set buyer_id = p_buyer_id,
           event_id = p_event_id,
           zone_id = p_zone_id,
           unidad_academica_id = v_unidad_academica_id,
           purchase_id = v_purchase_id,
           type = p_ticket_type,
           nombre = coalesce(nullif(p_ticket_data->>'nombre', ''), nombre),
           email = v_buyer_email,
           matricula = coalesce(nullif(p_ticket_data->>'matricula', ''), matricula),
           carrera = coalesce(nullif(p_ticket_data->>'carrera', ''), carrera),
           semestre = coalesce(nullif(p_ticket_data->>'semestre', ''), semestre),
           telefono = coalesce(nullif(p_ticket_data->>'telefono', ''), telefono),
           modalidad = case
             when p_ticket_type = 'alumno' and lower(coalesce(p_ticket_data->>'modalidad', '')) = 'mixto' then 'mixto'
             when p_ticket_type = 'alumno' then 'escolarizado'
             else null
           end,
           asiento_zona = coalesce(nullif(p_ticket_data->>'asiento_zona', ''), asiento_zona),
           asiento_bloque = coalesce(nullif(p_ticket_data->>'asiento_bloque', ''), asiento_bloque),
           asiento_fila = coalesce(nullif(p_ticket_data->>'asiento_fila', ''), asiento_fila),
           asiento_numero = coalesce(nullif(p_ticket_data->>'asiento_numero', '')::integer, asiento_numero),
           estatus_pago = case when p_paid then 'pagado' else 'apartado' end,
           purchased_at = case when p_paid then now() else null end
     where id = p_ticket_id and buyer_id = p_buyer_id;

    if not found then
      raise exception 'No se encontró el pre-registro del comprador.';
    end if;
  else
    insert into public.tickets (
      id, buyer_id, event_id, zone_id, unidad_academica_id, purchase_id,
      type, nombre, email, matricula, carrera, semestre, telefono, modalidad,
      asiento_zona, asiento_bloque, asiento_fila, asiento_numero,
      estatus_pago, purchased_at
    )
    values (
      v_ticket_id, p_buyer_id, p_event_id, p_zone_id, v_unidad_academica_id, v_purchase_id,
      p_ticket_type, nullif(p_ticket_data->>'nombre', ''), v_buyer_email,
      nullif(p_ticket_data->>'matricula', ''), nullif(p_ticket_data->>'carrera', ''),
      nullif(p_ticket_data->>'semestre', ''), nullif(p_ticket_data->>'telefono', ''),
      case
        when p_ticket_type = 'alumno' and lower(coalesce(p_ticket_data->>'modalidad', '')) = 'mixto' then 'mixto'
        when p_ticket_type = 'alumno' then 'escolarizado'
        else null
      end,
      nullif(p_ticket_data->>'asiento_zona', ''), nullif(p_ticket_data->>'asiento_bloque', ''),
      nullif(p_ticket_data->>'asiento_fila', ''),
      nullif(p_ticket_data->>'asiento_numero', '')::integer,
      case when p_paid then 'pagado' else 'apartado' end,
      case when p_paid then now() else null end
    );
  end if;

  insert into public.tokens_canje (
    token_code, creado_por, utilizado_por, event_id, zone_id, status,
    estado_pago, total_abonado, utilizado_el
  )
  values (
    btrim(p_token_code), p_buyer_id,
    case when p_paid then p_buyer_id else null end,
    p_event_id, p_zone_id, v_token_status,
    v_payment_status, p_monto,
    case when p_paid then now() else null end
  );

  return jsonb_build_object(
    'ticket_id', v_ticket_id,
    'purchase_id', v_purchase_id,
    'token_code', btrim(p_token_code),
    'unidad_academica_id', v_unidad_academica_id
  );
end;
$$;

create or replace function public.liquidar_ticket_y_token(
  p_ticket_id uuid,
  p_buyer_id uuid,
  p_event_id uuid,
  p_unidad_academica_id integer,
  p_monto numeric,
  p_token_code text
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_role integer;
  v_profile_email text;
  v_profile_unidad_academica_id integer;
  v_unidad_academica_id integer;
  v_ticket public.tickets%rowtype;
  v_token public.tokens_canje%rowtype;
  v_purchase_id uuid;
  v_total numeric;
  v_amount_paid numeric;
  v_new_amount_paid numeric;
  v_token_code text;
begin
  if auth.uid() is null then
    raise exception 'Se requiere una sesión autenticada.';
  end if;

  select p.id_rol
    into v_role
    from public.profiles p
   where p.id = auth.uid();

  if v_role is null or v_role not in (1, 2) then
    raise exception 'No tienes permisos para liquidar este boleto.';
  end if;

  if p_monto is null or p_monto <= 0 or p_event_id is null or p_buyer_id is null or p_ticket_id is null then
    raise exception 'Los datos del pago son inválidos.';
  end if;

  if p_event_id <> '6b077c0c-ca75-483c-87d4-1211118936d2'::uuid then
    raise exception 'El evento de la compra no es el evento activo.';
  end if;

  select t.*
    into v_ticket
    from public.tickets t
   where t.id = p_ticket_id
     and t.buyer_id = p_buyer_id
   for update;

  if not found or v_ticket.purchase_id is null or v_ticket.zone_id is null then
    raise exception 'No se encontró una compra pendiente para este boleto.';
  end if;

  if not exists (
    select 1 from public.zones z
     where z.id = v_ticket.zone_id and z.event_id = p_event_id
  ) then
    raise exception 'La zona del boleto no corresponde al evento.';
  end if;

  select p.unidad_academica_id, p.email
    into v_profile_unidad_academica_id, v_profile_email
    from public.profiles p
   where p.id = p_buyer_id;

  v_unidad_academica_id := coalesce(
    p_unidad_academica_id,
    v_profile_unidad_academica_id,
    case when lower(coalesce(v_profile_email, '')) like '%@zongolica.tecnm.mx' then 8 else null end
  );

  if v_unidad_academica_id is null then
    raise exception 'El comprador debe tener una Unidad Académica asignada.';
  end if;

  if v_profile_unidad_academica_id is null and v_unidad_academica_id = 8 then
    update public.profiles
       set unidad_academica_id = 8
     where id = p_buyer_id;
  end if;

  select p.total, p.amount_paid
    into v_total, v_amount_paid
    from public.purchases p
   where p.id = v_ticket.purchase_id
   for update;

  if not found then
    raise exception 'No se encontró el registro de compra del boleto.';
  end if;

  if v_total is null or v_total <= 0 then
    raise exception 'El total de la compra no es válido.';
  end if;

  v_new_amount_paid := coalesce(v_amount_paid, 0) + p_monto;
  if v_new_amount_paid < v_total then
    raise exception 'El monto recibido no cubre el saldo pendiente.';
  end if;
  if v_new_amount_paid > v_total then
    raise exception 'El monto recibido excede el total de la compra.';
  end if;

  update public.purchases
     set amount_paid = v_new_amount_paid,
         status = 'completed'
   where id = v_ticket.purchase_id;

  update public.tickets
     set event_id = p_event_id,
         unidad_academica_id = v_unidad_academica_id,
         estatus_pago = 'pagado',
         purchased_at = now()
   where id = v_ticket.id;

  select tc.*
    into v_token
    from public.tokens_canje tc
   where tc.event_id = p_event_id
     and tc.zone_id = v_ticket.zone_id
     and (
       tc.creado_por = p_buyer_id
       or tc.utilizado_por = p_buyer_id
       or abs(extract(epoch from (
         tc.created_at - (
           select p.created_at
             from public.purchases p
            where p.id = v_ticket.purchase_id
         )
       ))) < 5
     )
   order by tc.created_at desc nulls last
   limit 1
   for update;

  if found then
    v_token_code := v_token.token_code;
    update public.tokens_canje
       set creado_por = p_buyer_id,
           utilizado_por = p_buyer_id,
           status = 'usado',
           estado_pago = 'completado',
           total_abonado = v_new_amount_paid,
           utilizado_el = coalesce(utilizado_el, now())
     where id = v_token.id;
  else
    v_token_code := coalesce(
      nullif(btrim(p_token_code), ''),
      public.generar_codigo_tarjeta_play()::text
    );
    if nullif(btrim(v_token_code), '') is null then
      raise exception 'No se pudo generar el código del token.';
    end if;

    insert into public.tokens_canje (
      token_code, creado_por, utilizado_por, event_id, zone_id, status,
      estado_pago, total_abonado, utilizado_el
    )
    values (
      v_token_code, p_buyer_id, p_buyer_id, p_event_id, v_ticket.zone_id,
      'usado', 'completado', v_new_amount_paid, now()
    );
  end if;

  return jsonb_build_object(
    'ticket_id', v_ticket.id,
    'purchase_id', v_ticket.purchase_id,
    'token_code', v_token_code,
    'total_abonado', v_new_amount_paid,
    'unidad_academica_id', v_unidad_academica_id
  );
end;
$$;

create or replace function public.canjear_token_y_ticket(
  p_token_code text,
  p_buyer_id uuid,
  p_event_id uuid,
  p_unidad_academica_id integer
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_profile_email text;
  v_profile_unidad_academica_id integer;
  v_unidad_academica_id integer;
  v_token public.tokens_canje%rowtype;
  v_ticket public.tickets%rowtype;
begin
  if p_token_code is null or p_event_id is null then
    raise exception 'El token o el evento no son válidos.';
  end if;

  if auth.uid() is null or auth.uid() <> p_buyer_id then
    raise exception 'La sesión no corresponde al comprador.';
  end if;

  if p_event_id <> '6b077c0c-ca75-483c-87d4-1211118936d2'::uuid then
    raise exception 'El evento del token no es el evento activo.';
  end if;

  select p.unidad_academica_id, p.email
    into v_profile_unidad_academica_id, v_profile_email
    from public.profiles p
   where p.id = p_buyer_id
   for update;

  if not found then
    raise exception 'No existe el perfil del comprador.';
  end if;

  v_unidad_academica_id := coalesce(
    p_unidad_academica_id,
    v_profile_unidad_academica_id,
    case when lower(coalesce(v_profile_email, auth.jwt()->>'email', '')) like '%@zongolica.tecnm.mx' then 8 else null end
  );

  if v_unidad_academica_id is null then
    raise exception 'Selecciona una Unidad Académica antes de canjear el token.';
  end if;

  if v_profile_unidad_academica_id is null and v_unidad_academica_id = 8 then
    update public.profiles
       set unidad_academica_id = 8
     where id = p_buyer_id;
  end if;

  select tc.*
    into v_token
    from public.tokens_canje tc
   where tc.token_code = btrim(p_token_code)
     and tc.event_id = p_event_id
   for update;

  if not found then
    raise exception 'Token inválido o no existe.';
  end if;

  if v_token.status <> 'disponible'
     and not (v_token.status = 'usado' and v_token.utilizado_por = p_buyer_id) then
    raise exception 'El token ya fue canjeado.';
  end if;

  select t.*
    into v_ticket
    from public.tickets t
   where t.buyer_id = p_buyer_id
     and (t.event_id = v_token.event_id or t.event_id is null)
     and t.type <> 'docente'
   order by t.purchased_at desc nulls last
   limit 1
   for update;

  if not found then
    select t.*
      into v_ticket
      from public.tickets t
     where t.buyer_id = v_token.creado_por
       and t.event_id = v_token.event_id
       and t.type = 'docente'
     limit 1
     for update;
  end if;

  if not found then
    raise exception 'No se encontró un ticket asociado a este usuario y evento.';
  end if;

  if v_ticket.type <> 'docente' and v_token.estado_pago <> 'completado' then
    raise exception 'El token no tiene un pago completado.';
  end if;

  update public.tickets
     set buyer_id = p_buyer_id,
         event_id = v_token.event_id,
         unidad_academica_id = v_unidad_academica_id,
         zone_id = case when v_ticket.type = 'docente' then v_ticket.zone_id else v_token.zone_id end,
         estatus_pago = case when v_ticket.type = 'docente' then 'organizador' else 'pagado' end,
         purchased_at = now()
   where id = v_ticket.id
   returning * into v_ticket;

  update public.tokens_canje
     set creado_por = p_buyer_id,
         status = 'usado',
         utilizado_por = p_buyer_id,
         utilizado_el = coalesce(utilizado_el, now())
   where id = v_token.id;

  return jsonb_build_object(
    'ticket_id', v_ticket.id,
    'nombre', v_ticket.nombre,
    'email', v_ticket.email,
    'matricula', v_ticket.matricula,
    'carrera', v_ticket.carrera,
    'semestre', v_ticket.semestre,
    'telefono', v_ticket.telefono,
    'unidad_academica_id', v_ticket.unidad_academica_id,
    'asiento_zona', v_ticket.asiento_zona,
    'asiento_bloque', v_ticket.asiento_bloque,
    'asiento_fila', v_ticket.asiento_fila,
    'asiento_numero', v_ticket.asiento_numero,
    'departamento', v_ticket.departamento,
    'type', v_ticket.type
  );
end;
$$;

revoke execute on function public.registrar_venta_ticket_token(uuid, uuid, uuid, uuid, integer, text, jsonb, text, numeric, numeric, boolean) from public, anon;
revoke execute on function public.liquidar_ticket_y_token(uuid, uuid, uuid, integer, numeric, text) from public, anon;
revoke execute on function public.canjear_token_y_ticket(text, uuid, uuid, integer) from public, anon;
grant execute on function public.registrar_venta_ticket_token(uuid, uuid, uuid, uuid, integer, text, jsonb, text, numeric, numeric, boolean) to authenticated;
grant execute on function public.liquidar_ticket_y_token(uuid, uuid, uuid, integer, numeric, text) to authenticated;
grant execute on function public.canjear_token_y_ticket(text, uuid, uuid, integer) to authenticated;