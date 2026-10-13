-- ==============================================================================
-- Migración / Actualización: Vista SQL vista_tokens_detalles
-- Objetivo: Mostrar siempre el nombre, correo y matrícula del alumno asignado
--           o comprador, tanto para tokens 'disponibles' como 'usados'.
-- ==============================================================================

CREATE OR REPLACE VIEW vista_tokens_detalles AS
SELECT 
    tc.id,
    tc.token_code,
    tc.status,
    tc.estado_pago,
    tc.total_abonado,
    tc.created_at,
    tc.utilizado_el,
    -- Nombre resuelto mediante lógica de fallback prioritaria:
    -- 1. Si el token ya fue canjeado (status = 'usado'), priorizar los datos del alumno que canjeó
    -- 2. Si el token está 'disponible', usar los datos del ticket/compra del alumno que apartó o pagó
    -- 3. Si fue creado para un docente o usuario asignado (creado_por = buyer_id)
    -- 4. 'Sin asignar' como respaldo final
    COALESCE(
        p_canje_ticket.nombre,
        t_compra.nombre,
        p_creador_ticket.nombre,
        'Sin asignar'
    ) AS cliente_nombre,
    -- Correo resuelto con la misma jerarquía:
    COALESCE(
        p_canje.email,
        p_canje_ticket.email,
        t_compra.email,
        p_creador.email
    ) AS cliente_correo,
    -- Matrícula estudiantil:
    COALESCE(
        p_canje_ticket.matricula,
        t_compra.matricula,
        p_creador_ticket.matricula
    ) AS matricula
FROM tokens_canje tc
-- Perfil y ticket del usuario que consumió el token
LEFT JOIN profiles p_canje ON tc.utilizado_por = p_canje.id
LEFT JOIN tickets p_canje_ticket ON tc.utilizado_por = p_canje_ticket.buyer_id
-- Ticket vinculado a la compra/apartado del alumno (ventana temporal del registro)
LEFT JOIN LATERAL (
    SELECT t.nombre, t.email, t.matricula
    FROM purchases p
    JOIN tickets t ON t.purchase_id = p.id
    WHERE ABS(EXTRACT(EPOCH FROM (p.created_at - tc.created_at))) < 5
    ORDER BY ABS(EXTRACT(EPOCH FROM (p.created_at - tc.created_at))) ASC
    LIMIT 1
) t_compra ON true
-- Perfil y ticket del creador (ej. tokens de docentes asignados por creado_por)
LEFT JOIN profiles p_creador ON tc.creado_por = p_creador.id
LEFT JOIN tickets p_creador_ticket ON tc.creado_por = p_creador_ticket.buyer_id;

