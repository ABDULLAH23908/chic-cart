ALTER TABLE public.products ADD COLUMN IF NOT EXISTS sold_at timestamp with time zone;

CREATE OR REPLACE FUNCTION public.products_sync_sold_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.in_stock = false AND NEW.sold_at IS NULL THEN
    NEW.sold_at = now();
  ELSIF NEW.in_stock = true THEN
    NEW.sold_at = NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS products_sync_sold_at ON public.products;
CREATE TRIGGER products_sync_sold_at
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.products_sync_sold_at();

UPDATE public.products SET sold_at = now() WHERE in_stock = false AND sold_at IS NULL;