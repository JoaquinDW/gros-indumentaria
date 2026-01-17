# Aplicar Migraciones de Campos de Personalización

## Instrucciones

Para aplicar las migraciones de los campos de personalización (nombre y número), sigue estos pasos:

### Opción 1: Usando Supabase Dashboard (Recomendado)

1. Ve a tu proyecto de Supabase: https://app.supabase.com/project/uuwvdduupnrleagnweux/sql
2. Copia y pega el contenido de `16_add_product_custom_fields.sql` en el editor SQL
3. Haz clic en "Run" para ejecutar la migración
4. Luego copia y pega el contenido de `17_add_order_items_personalization.sql`
5. Haz clic en "Run" nuevamente

### Opción 2: Usando psql (Línea de comandos)

```bash
# Desde el directorio raíz del proyecto
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -f scripts/16_add_product_custom_fields.sql
psql "postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres" -f scripts/17_add_order_items_personalization.sql
```

## Archivos de Migración

### 16_add_product_custom_fields.sql
Agrega los campos `name_field_enabled` y `number_field_enabled` a la tabla `products`.

### 17_add_order_items_personalization.sql
Agrega los campos `personalization_name` y `personalization_number` a la tabla `order_items`.

## Verificación

Para verificar que las migraciones se aplicaron correctamente, ejecuta:

```sql
-- Verificar columnas en products
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'products'
  AND column_name IN ('name_field_enabled', 'number_field_enabled');

-- Verificar columnas en order_items
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'order_items'
  AND column_name IN ('personalization_name', 'personalization_number');
```

Deberías ver 4 filas en total (2 por cada tabla).
