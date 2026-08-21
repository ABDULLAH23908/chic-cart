CREATE TABLE public.reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  author text NOT NULL,
  rating smallint NOT NULL DEFAULT 5,
  body text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT 'General',
  photo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT ON public.reviews TO anon;
GRANT SELECT, INSERT ON public.reviews TO authenticated;
GRANT ALL ON public.reviews TO service_role;

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can submit a review" ON public.reviews FOR INSERT WITH CHECK (
  char_length(author) BETWEEN 1 AND 60
  AND char_length(body) <= 1000
  AND rating BETWEEN 1 AND 5
  AND tag IN ('Jackets','General')
);
CREATE POLICY "Admins can update reviews" ON public.reviews FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));
CREATE POLICY "Admins can delete reviews" ON public.reviews FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM public.user_roles r WHERE r.user_id = auth.uid() AND r.role = 'admin'));