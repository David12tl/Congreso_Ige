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
  if p_token_code is null or p_buyer_id is null or p_event_id is null then
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

  select tc.*
    into v_token
    from public.tokens_canje tc
   where tc.token_code = btrim(p_token_code)
     and tc.event_id = p_event_id
   for update;

  if not found then
    raise exception 'Token inválido o no existe.';
  end if;

  if v_token.status = 'usado' then
    if v_token.utilizado_por is distinct from p_buyer_id then
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
      raise exception 'No se encontró el ticket ya asignado a este token.';
    end if;

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
  end if;

  if v_token.status is distinct from 'disponible' then
    raise exception 'El token ya fue canjeado.';
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

revoke execute on function public.canjear_token_y_ticket(text, uuid, uuid, integer) from public, anon;
grant execute on function public.canjear_token_y_ticket(text, uuid, uuid, integer) to authenticated;