# Migración: Múltiples Imágenes para Productos

## Descripción

Esta migración agrega soporte para múltiples imágenes por producto (máximo 5 imágenes).

## Cambios Realizados

### 1. Base de Datos
- Se agregó la columna `images` (JSONB) a la tabla `products`
- Se migran automáticamente las imágenes existentes del campo `image_url` al nuevo campo `images`
- Se mantiene `image_url` para compatibilidad hacia atrás (siempre contiene la primera imagen)
- Se agregó un trigger para validar que no se excedan 5 imágenes
- Se creó un índice GIN para mejorar el rendimiento de consultas

### 2. API
- **POST `/api/products`**: Ahora acepta el campo `images` (array de URLs)
- **PATCH `/api/products/[id]`**: Ahora acepta el campo `images` para actualizar
- Validación automática: máximo 5 imágenes por producto

### 3. Componentes
- **Nuevo**: `MultipleImageUpload` - Permite subir y gestionar hasta 5 imágenes
- **Actualizado**: Formulario de productos en admin para usar `MultipleImageUpload`
- **Actualizado**: Página de detalle de producto para mostrar todas las imágenes

### 4. Frontend
- La página de detalle del producto muestra un carrusel de imágenes
- Las miniaturas permiten seleccionar qué imagen ver
- La primera imagen se marca como "Principal"
- Compatibilidad hacia atrás con productos que solo tienen `image_url`

## Instrucciones de Instalación

### Opción 1: Ejecutar en Supabase Dashboard (Recomendado)

1. Ve a tu proyecto en Supabase: https://app.supabase.com
2. Navega a **SQL Editor** en el menú lateral
3. Crea una nueva query
4. Copia y pega el contenido del archivo `scripts/11_add_product_images.sql`
5. Ejecuta el script (botón "Run" o `Cmd/Ctrl + Enter`)
6. Verifica que la migración se ejecutó correctamente:
   ```sql
   -- Verificar que la columna existe
   SELECT column_name, data_type
   FROM information_schema.columns
   WHERE table_name = 'products' AND column_name = 'images';

   -- Verificar que los datos se migraron
   SELECT id, name, image_url, images
   FROM products
   LIMIT 5;
   ```

### Opción 2: Ejecutar con psql (Línea de comandos)

```bash
# Obtén la connection string de Supabase Dashboard > Project Settings > Database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" -f scripts/11_add_product_images.sql
```

## Verificación Post-Migración

Después de ejecutar la migración, verifica:

1. **Columna creada**:
   ```sql
   \d products
   ```
   Deberías ver la columna `images` de tipo `jsonb`

2. **Datos migrados**:
   ```sql
   SELECT
     id,
     name,
     image_url,
     images,
     jsonb_array_length(images) as num_images
   FROM products;
   ```
   Los productos con `image_url` deberían tener ese valor en `images[0]`

3. **Trigger funcionando**:
   Intenta insertar un producto con más de 5 imágenes (debería fallar):
   ```sql
   -- Esto debería fallar
   INSERT INTO products (name, category, price, images)
   VALUES ('Test', 'Test', 100, '["url1", "url2", "url3", "url4", "url5", "url6"]');
   ```

## Uso en el Admin

1. Ve al panel de administración: `/admin`
2. Crea o edita un producto
3. Verás el nuevo componente "Imágenes del Producto"
4. Puedes:
   - Subir múltiples imágenes (drag & drop o click)
   - Eliminar imágenes individualmente
   - La primera imagen es la principal
   - Máximo 5 imágenes por producto

## Rollback (si es necesario)

Si necesitas revertir los cambios:

```sql
-- Eliminar trigger
DROP TRIGGER IF EXISTS enforce_product_images_limit ON products;
DROP FUNCTION IF EXISTS check_product_images_limit();

-- Eliminar índice
DROP INDEX IF EXISTS idx_products_images;

-- Eliminar columna (CUIDADO: esto borra los datos)
ALTER TABLE products DROP COLUMN IF EXISTS images;
```

**NOTA**: El rollback eliminará todos los datos de imágenes múltiples. Asegúrate de hacer un backup antes.

## Compatibilidad

- ✅ Los productos existentes seguirán funcionando normalmente
- ✅ El campo `image_url` se mantiene y se sincroniza con la primera imagen
- ✅ El frontend muestra correctamente productos con una o múltiples imágenes
- ✅ La API acepta tanto `image_url` como `images` para compatibilidad

## Troubleshooting

### Error: "column images does not exist"
- La migración no se ejecutó correctamente
- Verifica que estás conectado a la base de datos correcta
- Ejecuta el script de migración nuevamente

### Error: "Un producto no puede tener más de 5 imágenes"
- El trigger está funcionando correctamente
- Reduce el número de imágenes a 5 o menos

### Las imágenes no se muestran en el admin
- Verifica que el componente `MultipleImageUpload` esté importado
- Revisa la consola del navegador para errores
- Asegúrate de que el campo `images` esté en el state del producto

## Soporte

Si encuentras algún problema:
1. Revisa los logs de Supabase
2. Verifica la consola del navegador
3. Consulta este README para troubleshooting
