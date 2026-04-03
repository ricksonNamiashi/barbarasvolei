ALTER TABLE public.professors ADD COLUMN display_order integer NOT NULL DEFAULT 0;

-- Set initial order based on created_at
WITH ordered AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) - 1 AS rn
  FROM public.professors
)
UPDATE public.professors SET display_order = ordered.rn FROM ordered WHERE professors.id = ordered.id;