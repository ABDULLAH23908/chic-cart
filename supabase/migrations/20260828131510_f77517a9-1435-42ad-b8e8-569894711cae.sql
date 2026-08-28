ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS trending boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS best_seller boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS new_arrival boolean NOT NULL DEFAULT false;