/*
  # Add WhatsApp Setting and Blog View Count

  1. Changes
    - Inserts whatsapp_number into site_settings (contact category)
    - Allows admins to manage the WhatsApp number from the CMS
    - Adds view_count column to blog_posts for article view tracking

  2. Notes
    - The whatsapp_number setting replaces hardcoded phone numbers in Checkout and OrdersManager
    - view_count defaults to 0 and increments on each article visit
*/

INSERT INTO site_settings (category, setting_key, setting_value, setting_type, label_ar, label_en, order_index)
VALUES 
  ('contact', 'whatsapp_number', '218920910096', 'text', 'رقم واتساب للطلبات', 'Orders WhatsApp Number', 15);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'blog_posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE blog_posts ADD COLUMN view_count integer DEFAULT 0;
  END IF;
END $$;
