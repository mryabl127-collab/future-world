CREATE TABLE public.community_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  author text NOT NULL CHECK (char_length(author) BETWEEN 1 AND 40),
  client_id text NOT NULL CHECK (char_length(client_id) BETWEEN 8 AND 64),
  content text NOT NULL CHECK (char_length(btrim(content)) BETWEEN 1 AND 1000),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.community_messages TO anon, authenticated;
GRANT ALL ON public.community_messages TO service_role;
ALTER TABLE public.community_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read group chat" ON public.community_messages FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Anyone can post to group chat" ON public.community_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE INDEX community_messages_created_idx ON public.community_messages (created_at DESC);
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_messages;