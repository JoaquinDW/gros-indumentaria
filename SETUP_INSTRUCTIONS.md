# Instrucciones de Configuración - Gros Indumentaria

## ⚠️ IMPORTANTE: Scripts SQL Requeridos

Para que el sistema de administración funcione correctamente, debes ejecutar los siguientes scripts SQL en tu base de datos Supabase.

---

## 📋 Script 1: Políticas RLS para Productos

**Archivo**: `scripts/06_update_products_rls.sql`

**Por qué es necesario**: Este script crea las políticas de seguridad que permiten a los usuarios autenticados (admins) crear, editar y eliminar productos.

**Cómo ejecutarlo**:
1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor** en el menú lateral
3. Copia y pega el contenido de `scripts/06_update_products_rls.sql`
4. Haz clic en **Run**

**Contenido del script**:
```sql
-- RLS Policy - authenticated users (admins) can view ALL products (including inactive)
CREATE POLICY "Authenticated users can view all products" ON products
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can insert products
CREATE POLICY "Authenticated users can insert products" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can update products
CREATE POLICY "Authenticated users can update products" ON products
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policy - authenticated users (admins) can delete products
CREATE POLICY "Authenticated users can delete products" ON products
  FOR DELETE USING (auth.role() = 'authenticated');
```

**Qué hace**:
- ✅ Permite a usuarios autenticados ver TODOS los productos (activos e inactivos)
- ✅ Permite a usuarios autenticados crear productos
- ✅ Permite a usuarios autenticados actualizar productos
- ✅ Permite a usuarios autenticados eliminar productos
- ✅ El público sin autenticar solo puede ver productos activos

---

## 📋 Script 2: Bucket de Almacenamiento para Imágenes

**Archivo**: `scripts/07_create_storage_bucket.sql`

**Por qué es necesario**: Este script crea el bucket de almacenamiento en Supabase Storage para subir imágenes con drag & drop.

**Cómo ejecutarlo**:
1. Ve a tu proyecto en Supabase Dashboard
2. Ve a **SQL Editor** en el menú lateral
3. Copia y pega el contenido de `scripts/07_create_storage_bucket.sql`
4. Haz clic en **Run**

**Contenido del script**:
```sql
-- Create storage bucket for product and carousel images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-images',
  'product-images',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage (ver archivo completo)
```

**Qué hace**:
- ✅ Crea bucket público `product-images`
- ✅ Establece límite de 5MB por imagen
- ✅ Solo permite imágenes (JPEG, PNG, WebP, GIF)
- ✅ El público puede ver las imágenes
- ✅ Solo admins autenticados pueden subir/eliminar imágenes

---

## 📋 Script 3 (Opcional): Políticas RLS para Categorías

**Archivo**: `scripts/05_create_categories_table.sql`

**Estado**: Ya debería estar ejecutado si las categorías funcionan correctamente.

Si las categorías NO funcionan (error al crear/editar), ejecuta este script también.

---

## 🚀 Orden de Ejecución Recomendado

1. **Primero**: `06_update_products_rls.sql` (CRÍTICO - sin esto no puedes crear productos)
2. **Segundo**: `07_create_storage_bucket.sql` (necesario para subir imágenes)
3. **Opcional**: `05_create_categories_table.sql` (solo si hay problemas con categorías)

---

## ✅ Verificación

Después de ejecutar los scripts, verifica que todo funcione:

### Verificar Políticas de Productos:
1. Ve a **Table Editor** → `products`
2. Haz clic en el ícono de escudo (políticas RLS)
3. Deberías ver 5 políticas:
   - ✅ "Products are viewable by everyone" (SELECT, público)
   - ✅ "Authenticated users can view all products" (SELECT, autenticado)
   - ✅ "Authenticated users can insert products" (INSERT, autenticado)
   - ✅ "Authenticated users can update products" (UPDATE, autenticado)
   - ✅ "Authenticated users can delete products" (DELETE, autenticado)

### Verificar Bucket de Storage:
1. Ve a **Storage** en el menú lateral
2. Deberías ver el bucket `product-images`
3. Haz clic en él
4. Deberías poder ver las políticas de acceso

---

## 🐛 Solución de Problemas

### Error: "new row violates row-level security policy for table products"
**Causa**: No ejecutaste `06_update_products_rls.sql`
**Solución**: Ejecuta el script en SQL Editor

### Error al subir imagen: "bucket not found"
**Causa**: No ejecutaste `07_create_storage_bucket.sql`
**Solución**: Ejecuta el script en SQL Editor

### Error: "policy already exists"
**Causa**: Ya ejecutaste el script anteriormente
**Solución**: Ignora el error, la política ya existe

### No puedo crear categorías
**Causa**: Faltan políticas RLS para categorías
**Solución**: Ejecuta `05_create_categories_table.sql`

---

## 📞 Después de Ejecutar los Scripts

Una vez ejecutados los scripts, deberías poder:

1. ✅ Crear productos desde el panel admin
2. ✅ Editar productos existentes
3. ✅ Eliminar productos
4. ✅ Activar/desactivar productos
5. ✅ Subir imágenes con drag & drop
6. ✅ Ver todos los productos en el admin (activos e inactivos)
7. ✅ El público solo ve productos activos en el frontend

---

## 🔒 Seguridad

Las políticas RLS garantizan que:
- El público **NO** puede crear, editar o eliminar productos
- El público **SOLO** puede ver productos activos
- Los administradores autenticados pueden hacer todas las operaciones
- Las imágenes son públicamente accesibles pero solo admins pueden subirlas

---

**¿Todo configurado?** ¡Perfecto! Ahora puedes empezar a agregar productos desde `/admin`
