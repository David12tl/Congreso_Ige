CREATE TABLE IF NOT EXISTS public.chat_en_vivo (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_usuario text NOT NULL,
  matricula text NULL,
  mensaje text NOT NULL,
  es_destacada boolean NOT NULL DEFAULT false,
  visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT chat_en_vivo_mensaje_length_check
    CHECK (char_length(trim(mensaje)) BETWEEN 1 AND 400)
);

CREATE INDEX IF NOT EXISTS idx_chat_en_vivo_created_at
  ON public.chat_en_vivo (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_chat_en_vivo_es_destacada
  ON public.chat_en_vivo (es_destacada);

ALTER TABLE public.chat_en_vivo ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE public.chat_en_vivo FROM anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.chat_en_vivo TO authenticated;

DROP POLICY IF EXISTS chat_en_vivo_select_visible_or_moderator ON public.chat_en_vivo;
CREATE POLICY chat_en_vivo_select_visible_or_moderator
  ON public.chat_en_vivo
  FOR SELECT
  TO authenticated
  USING (
    visible = true
    OR EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND id_rol IN (1, 2)
    )
  );

DROP POLICY IF EXISTS chat_en_vivo_insert_own_messages ON public.chat_en_vivo;
CREATE POLICY chat_en_vivo_insert_own_messages
  ON public.chat_en_vivo
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

DROP POLICY IF EXISTS chat_en_vivo_update_moderators ON public.chat_en_vivo;
CREATE POLICY chat_en_vivo_update_moderators
  ON public.chat_en_vivo
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND id_rol IN (1, 2)
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND id_rol IN (1, 2)
    )
  );

DROP POLICY IF EXISTS chat_en_vivo_delete_moderators ON public.chat_en_vivo;
CREATE POLICY chat_en_vivo_delete_moderators
  ON public.chat_en_vivo
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.profiles
      WHERE id = (SELECT auth.uid())
        AND id_rol IN (1, 2)
    )
  );

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'chat_en_vivo'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_en_vivo;
  END IF;
END;
$$;
