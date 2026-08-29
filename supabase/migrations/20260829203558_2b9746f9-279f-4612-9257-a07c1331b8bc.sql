DROP POLICY IF EXISTS "Anyone can submit a review" ON public.reviews;
CREATE POLICY "Anyone can submit a review" ON public.reviews
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    char_length(author) BETWEEN 1 AND 60
    AND char_length(body) <= 1000
    AND rating BETWEEN 1 AND 5
    AND tag IN ('General', 'Nike', 'Adidas')
  );