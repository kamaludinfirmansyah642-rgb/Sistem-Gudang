-- 002_add_warehouse_fields.sql
ALTER TABLE items ADD COLUMN sku TEXT;
ALTER TABLE items ADD COLUMN quantity INTEGER DEFAULT 0;
ALTER TABLE items ADD COLUMN location TEXT;
