
UPDATE storage.buckets SET public = false WHERE id = 'professor-photos';

DROP POLICY IF EXISTS "Anyone can view professor photos" ON storage.objects;

CREATE POLICY "Authenticated users can view professor photos"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'professor-photos');
