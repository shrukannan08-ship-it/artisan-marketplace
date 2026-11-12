-- Mitti & Muse: Idempotent Craft Categories Seed
-- Contains ONLY marketplace taxonomy categories; zero fake products, stores, users, or orders.

INSERT INTO public.categories (name, slug, description, icon_name, featured)
VALUES
  ('Ceramics & Pottery', 'ceramics-pottery', 'Wheel-thrown mugs, stoneware bowls, and sculptural tabletop vessels.', 'CupSoda', true),
  ('Handmade Jewelry', 'handmade-jewelry', 'Slow-forged brass, sterling silver, and botanical resin adornments.', 'Gem', true),
  ('Candles & Scents', 'candles-scents', 'Hand-poured beeswax and soy candles blended with botanical essential oils.', 'Flame', true),
  ('DIY & Craft Kits', 'diy-craft-kits', 'Beginner-friendly studio kits with natural fibers, clays, and pigments.', 'Scissors', true),
  ('Textiles & Living', 'textiles-living', 'Hand-loomed throws, block-printed linens, and organic cotton home accents.', 'Sparkles', true),
  ('Paper & Stationery', 'paper-stationery', 'Letterpress cards, deckle-edge journals, and botanical illustration prints.', 'BookOpen', false),
  ('Gifts & Bundles', 'gifts-bundles', 'Thoughtfully curated maker gift sets wrapped in plastic-free keepsakes.', 'Gift', true)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  icon_name = EXCLUDED.icon_name,
  featured = EXCLUDED.featured;
