-- Create a new storage bucket for avatars
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to view avatars (public read)
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Policy to allow authenticated users to upload their own avatar
-- Note: 'storage.objects' RLS is a bit tricky with paths. 
-- We'll assume the path user/<user_id>/filename structure for security if needed, 
-- but for now, we'll allow authenticated users to insert into the bucket.
-- A stricter policy would be: (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1])
CREATE POLICY "Authenticated users can upload avatars"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
  );

-- Policy to allow users to update their own avatars
CREATE POLICY "Users can update their own avatars"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );

-- Policy to allow users to delete their own avatars
CREATE POLICY "Users can delete their own avatars"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.role() = 'authenticated'
    AND owner = auth.uid()
  );
