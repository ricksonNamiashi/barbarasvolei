
CREATE TABLE public.professors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  role text NOT NULL DEFAULT 'Treinador',
  formation text,
  experience text,
  bio text,
  initials text NOT NULL,
  categories text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view professors" ON public.professors
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage professors" ON public.professors
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Seed initial data
INSERT INTO public.professors (name, role, formation, experience, categories, bio, initials) VALUES
('Ricardo Silva', 'Head Coach', 'Ed. Física - UFRJ', '15 anos de experiência', ARRAY['Sub-11', 'Sub-13'], 'Ex-jogador profissional com passagens pelo Flamengo e seleção brasileira juvenil. Especialista em formação de base.', 'RS'),
('Carla Mendes', 'Treinadora', 'Ed. Física - USP', '10 anos de experiência', ARRAY['Sub-15', 'Sub-17'], 'Formada pela USP com especialização em treinamento esportivo. Medalhista nos Jogos Universitários.', 'CM'),
('André Costa', 'Treinador', 'Ed. Física - UFMG', '8 anos de experiência', ARRAY['Sub-13', 'Adulto'], 'Especialista em vôlei de praia com experiência em competições nacionais. Certificado pela CBV.', 'AC');
