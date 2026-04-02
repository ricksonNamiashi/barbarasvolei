
-- Add photo_url column
ALTER TABLE public.professors ADD COLUMN photo_url text;

-- Create storage bucket
INSERT INTO storage.buckets (id, name, public) VALUES ('professor-photos', 'professor-photos', true);

-- Storage policies
CREATE POLICY "Anyone can view professor photos" ON storage.objects
  FOR SELECT USING (bucket_id = 'professor-photos');

CREATE POLICY "Admins can upload professor photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'professor-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update professor photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'professor-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete professor photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'professor-photos' AND public.has_role(auth.uid(), 'admin'::public.app_role));
