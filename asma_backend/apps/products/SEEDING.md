# Product Categories Seeding

This guide explains how to seed the product categories into your database.

## Available Commands

### Basic Seeding (Add Missing Categories)

```bash
# From project root
python asma_backend/manage.py seed_categories

# Or from asma_backend directory
python manage.py seed_categories
```

This will:
- Check if each category already exists
- Create only the missing categories
- Skip categories that already exist
- Display progress with color-coded output

### Clear and Reseed (Replace All Categories)

```bash
python asma_backend/manage.py seed_categories --clear
```

⚠️ **Warning**: This will:
1. **DELETE all existing categories** from the database
2. Delete all products associated with those categories (due to CASCADE)
3. Seed fresh categories

**Use this only if you want a complete reset.**

## Default Categories Seeded

### Fragrance Types
- Eau de Parfum
- Eau de Toilette
- Eau de Cologne
- Fragrance Oil

### Fragrance Families
- Fruity
- Floral
- Oriental
- Fresh
- Woody
- Spicy
- Citrus
- Aromatic
- Amber
- Vanilla
- Musk

### Demographics
- Unisex Fragrances
- Men's Fragrances
- Women's Fragrances
- Unisex (general)

### Seasons
- Spring
- Summer
- Fall
- Winter

## How It Works

1. **Idempotent**: Running the command multiple times is safe—it only creates new categories
2. **Atomic**: Uses database transactions to ensure consistency
3. **Informative**: Shows which categories were created and which were skipped
4. **Flexible**: Supports `--clear` flag for resetting

## Customizing Categories

To change the default categories:

1. Edit `/asma_backend/apps/products/management/commands/seed_categories.py`
2. Modify the `categories_data` list in the `handle` method
3. Run the seeding command again

## Example Usage Flow

```bash
# First time: Seed fresh categories
python asma_backend/manage.py seed_categories

# Output:
# ✓ Created category: Eau de Parfum
# ✓ Created category: Eau de Toilette
# ...
# ✓ Seeding complete! Created: 23, Skipped: 0
```

```bash
# Running again: No changes (all exist)
python asma_backend/manage.py seed_categories

# Output:
# ✗ Skipped (already exists): Eau de Parfum
# ✗ Skipped (already exists): Eau de Toilette
# ...
# ✓ Seeding complete! Created: 0, Skipped: 23
```

## Troubleshooting

### Command not found
Make sure Django apps are properly configured in `config/settings/base.py`:
```python
INSTALLED_APPS = [
    ...
    'apps.products',
]
```

### Database errors
Ensure migrations are applied:
```bash
python asma_backend/manage.py migrate
```

### Issues with categories not appearing
1. Check that categories were actually created: `python asma_backend/manage.py dbshell`
2. Query: `SELECT * FROM products_category;`
3. If empty, rerun the seed command without `--clear` flag

## Integration with Development Workflow

Add seeding to your development setup:

```bash
# After migrations
python asma_backend/manage.py migrate

# Then seed categories
python asma_backend/manage.py seed_categories

# Now you can add products via admin or API
```

## API Usage

Once categories are seeded, they're available via:

**Frontend API Call:**
```typescript
GET /products/categories/
// Returns all categories
```

**Admin Product Form:**
- The category dropdown automatically populates with seeded categories
- Users must select from available categories when creating/editing products
