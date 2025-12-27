# Instrucciones de Migración - Telas con Precios

## Cambios Realizados

Se han implementado los siguientes cambios en el sistema:

1. **Eliminación de colores**: La funcionalidad de colores ha sido completamente eliminada del sistema
2. **Telas con precios**: Ahora cada tipo de tela tiene su propio precio asociado
3. **Precio dinámico**: El precio del producto cambia según el tipo de tela seleccionado

## Pasos para Aplicar la Migración

### 1. Ejecutar el Script SQL

Debes ejecutar el script de migración en tu base de datos de Supabase:

**Archivo**: `scripts/10_update_fabrics_with_prices.sql`

**Opciones para ejecutar**:

#### Opción A: Desde el Dashboard de Supabase
1. Ve a tu proyecto en Supabase Dashboard
2. Navega a "SQL Editor"
3. Copia y pega el contenido del archivo `scripts/10_update_fabrics_with_prices.sql`
4. Ejecuta el script

#### Opción B: Usando psql (si tienes acceso directo)
```bash
psql -h [tu-host] -U postgres -d postgres -f scripts/10_update_fabrics_with_prices.sql
```

### 2. Verificar la Migración

Después de ejecutar el script, verifica que:

1. La columna `colors` fue eliminada de la tabla `products`
2. La columna `fabrics` ahora es de tipo JSONB y acepta objetos
3. Los productos existentes tienen `fabrics = {}` por defecto

### 3. Actualizar Productos Existentes

Después de la migración, deberás actualizar tus productos existentes para asignar precios a cada tipo de tela:

1. Ve a `http://localhost:3000/admin?tab=products`
2. Edita cada producto
3. Agrega los tipos de tela con sus respectivos precios usando el nuevo formulario
4. Guarda los cambios

## Estructura de Datos de Telas

Las telas ahora se almacenan como un objeto JSON con el siguiente formato:

```json
{
  "Algodón": 2500,
  "Poliéster": 3000,
  "Lycra": 3500
}
```

Donde la clave es el nombre de la tela y el valor es el precio.

## Ejemplo de Uso en el Admin

1. Al crear/editar un producto, verás una nueva sección "Tipos de Tela y Precios"
2. Ingresa el nombre de la tela (ej: "Algodón") y su precio (ej: 2500)
3. Haz clic en "+ Agregar Tipo de Tela" para agregar más opciones
4. Puedes eliminar telas usando el botón "✕"
5. Los cambios se guardan automáticamente cuando pierdes el foco del campo

## Cambios en el Carrito

Los productos en el carrito ahora:
- Ya NO muestran color (se eliminó esta opción)
- Muestran el precio específico de la tela seleccionada
- El precio total se calcula con el precio de la tela elegida

## Notas Importantes

- **IMPORTANTE**: Ejecuta el script de migración ANTES de usar la nueva versión del código
- Los productos sin telas configuradas usarán el precio base del producto
- La selección de tela es obligatoria solo si el producto tiene telas configuradas
