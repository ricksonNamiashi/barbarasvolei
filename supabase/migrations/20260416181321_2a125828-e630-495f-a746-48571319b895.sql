-- Substitui os horários de aula pelos da Filial Vila Nova
DELETE FROM public.schedules;

INSERT INTO public.schedules (category, day, time, location, coach) VALUES
  ('Turma 1', 'Segunda', '19:00 - 20:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 2', 'Segunda', '20:00 - 21:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 3', 'Segunda', '21:00 - 22:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 1', 'Quarta',  '19:00 - 20:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 2', 'Quarta',  '20:00 - 21:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 3', 'Quarta',  '21:00 - 22:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 1', 'Sexta',   '18:00 - 19:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Turma 2', 'Sexta',   '19:00 - 20:00', 'Escola Santa Bárbara - Vila Nova', NULL),
  ('Adulto',  'Sexta',   '20:00 - 22:00', 'Escola Santa Bárbara - Vila Nova', NULL);