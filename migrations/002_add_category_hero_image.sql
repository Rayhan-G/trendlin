-- P:\Projects\trendlin\src\db\migrations\002_add_category_hero_image.sql

-- Add hero_image column to categories table
ALTER TABLE categories ADD COLUMN hero_image TEXT;

-- Update existing categories with default hero images (optional)
UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=400&fit=crop'
WHERE slug = 'health-wellness';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=400&fit=crop'
WHERE slug = 'food-dining';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1603199506016-b9a594b9a5a8?w=1200&h=400&fit=crop'
WHERE slug = 'entertainment';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1486728297118-82a07bc48a0a?w=1200&h=400&fit=crop'
WHERE slug = 'lifestyle';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&h=400&fit=crop'
WHERE slug = 'technology';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=400&fit=crop'
WHERE slug = 'shopping';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1200&h=400&fit=crop'
WHERE slug = 'real-estate';

UPDATE categories 
SET hero_image = 'https://images.unsplash.com/photo-1543286386-2e659306cd6c?w=1200&h=400&fit=crop'
WHERE slug = 'finance';