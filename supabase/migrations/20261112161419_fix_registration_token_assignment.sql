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
       and tc.utilizado_por = p_buyer_id
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
    token_code, event_id, zone_id, creado_por, utilizado_por,
    status, utilizado_el, total_abonado, estado_pago
  )
  values (
    btrim(p_token_code), p_event_id, p_zone_id, auth.uid(), p_buyer_id,
    'usado', now(), p_monto, v_payment_status
  );

  return jsonb_build_object(
    'ticket_id', v_ticket_id,
    'purchase_id', v_purchase_id,
    'token_code', btrim(p_token_code),
    'unidad_academica_id', v_unidad_academica_id
  );
end;
$$;
