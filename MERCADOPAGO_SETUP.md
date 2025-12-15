# Configuración de Mercado Pago - Gros Indumentaria

## Instalación Completada ✅

Se ha instalado e implementado el SDK de Mercado Pago Checkout Pro para procesar pagos en línea.

## Configuración Necesaria

### 1. Obtener Credenciales de Mercado Pago

#### Para Testing (Ambiente de Prueba)
1. Ingresa a tu cuenta de Mercado Pago
2. Ve a [Credenciales](https://www.mercadopago.com.ar/developers/panel/credentials)
3. Selecciona "Credenciales de prueba"
4. Copia el **Access Token** que comienza con `TEST-`

#### Para Producción
1. Ve a [Credenciales](https://www.mercadopago.com.ar/developers/panel/credentials)
2. Selecciona "Credenciales de producción"
3. Copia el **Access Token** que comienza con `APP-`
4. **Importante**: Necesitas activar tu cuenta de vendedor para usar credenciales de producción

### 2. Configurar Variables de Entorno

Edita el archivo `.env.local` y reemplaza:

```bash
MERCADOPAGO_ACCESS_TOKEN=YOUR_ACCESS_TOKEN_HERE
```

Por tu token real:

```bash
# Para testing
MERCADOPAGO_ACCESS_TOKEN=TEST-1234567890-123456-abc...

# Para producción (cuando estés listo)
MERCADOPAGO_ACCESS_TOKEN=APP-1234567890-123456-abc...
```

También actualiza la URL base:

```bash
# Para desarrollo local
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Para producción
NEXT_PUBLIC_BASE_URL=https://tu-dominio.com
```

### 3. Cuentas de Prueba (Testing)

Para probar pagos en ambiente de prueba:

1. Ve a [Cuentas de Prueba](https://www.mercadopago.com.ar/developers/panel/test-users)
2. Crea un usuario de prueba comprador
3. Usa esas credenciales para hacer pagos de prueba

#### Tarjetas de Prueba

Puedes usar estas tarjetas de prueba:

| Tarjeta | Número | CVV | Fecha de Vencimiento |
|---------|--------|-----|---------------------|
| Visa | 4509 9535 6623 3704 | 123 | Cualquier fecha futura |
| Mastercard | 5031 7557 3453 0604 | 123 | Cualquier fecha futura |
| American Express | 3711 803032 57522 | 1234 | Cualquier fecha futura |

**Estado de los pagos de prueba:**
- **Aprobado**: Usar cualquiera de las tarjetas anteriores
- **Rechazado**: Usar número `4000 0000 0000 0000`

Más información: [Testing de Mercado Pago](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-integration)

## Arquitectura Implementada

### Archivos Creados/Modificados

1. **API Route de Preferencias** - `app/api/create-preference/route.ts`
   - Crea preferencias de pago en Mercado Pago
   - Configura URLs de retorno
   - Incluye metadata del cliente y pedido

2. **Webhook Handler** - `app/api/webhooks/mercadopago/route.ts`
   - Recibe notificaciones IPN de Mercado Pago
   - Procesa estados de pago
   - Preparado para integrar con base de datos

3. **Páginas de Resultado**:
   - `app/checkout/success/page.tsx` - Pago exitoso
   - `app/checkout/error/page.tsx` - Pago rechazado
   - `app/checkout/pending/page.tsx` - Pago pendiente

### Flujo de Pago

```
1. Usuario completa formulario de checkout
   ↓
2. Click en "Pagar con Mercado Pago"
   ↓
3. POST a /api/create-preference
   ↓
4. Se crea preferencia en MP y devuelve init_point
   ↓
5. Usuario es redirigido al checkout de Mercado Pago
   ↓
6. Usuario completa el pago
   ↓
7. MP redirige según resultado:
   - success → /checkout/success
   - error → /checkout/error
   - pending → /checkout/pending
   ↓
8. MP envía webhook a /api/webhooks/mercadopago
   ↓
9. Webhook procesa la notificación y actualiza estado
```

## Configuración de Webhooks (Producción)

Para recibir notificaciones de pago en producción:

1. Ve a [Webhooks](https://www.mercadopago.com.ar/developers/panel/webhooks)
2. Click en "Crear webhook"
3. Ingresa la URL: `https://tu-dominio.com/api/webhooks/mercadopago`
4. Selecciona eventos: "Payments"
5. Guarda

**Nota**: Para desarrollo local, puedes usar [ngrok](https://ngrok.com/) para exponer tu servidor local.

## Testing Local

1. Configura las credenciales de prueba en `.env.local`
2. Inicia el servidor de desarrollo:
   ```bash
   pnpm dev
   ```
3. Ve a `http://localhost:3000`
4. Agrega productos al carrito
5. Ve al checkout y prueba el flujo de pago

## Características Implementadas

- ✅ Integración completa con Mercado Pago SDK
- ✅ Checkout Pro (usuarios son redirigidos a Mercado Pago)
- ✅ Soporte para todos los métodos de pago de Mercado Pago
- ✅ URLs de retorno configuradas (success, error, pending)
- ✅ Webhook handler para notificaciones IPN
- ✅ Metadata de cliente incluida en el pago
- ✅ Páginas de resultado con información detallada
- ✅ Manejo de errores
- ✅ Limpieza de carrito en pago exitoso

## Próximos Pasos (Opcional)

### 1. Integración con Base de Datos
Actualizar el webhook para guardar pedidos en Supabase:

```typescript
// En app/api/webhooks/mercadopago/route.ts
await supabase.from('orders').insert({
  payment_id: paymentId,
  status: status,
  external_reference: external_reference,
  // ... más campos
})
```

### 2. Envío de Emails
Configurar un servicio de email (Resend, SendGrid, etc.) para:
- Confirmación de pedido al cliente
- Notificación de pedido al vendedor

### 3. Panel de Administración
Crear un dashboard para ver y gestionar pedidos.

### 4. Reembolsos
Implementar funcionalidad de reembolsos desde tu panel de admin.

## Recursos Útiles

- [Documentación de Mercado Pago](https://www.mercadopago.com.ar/developers)
- [Checkout Pro Guide](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/landing)
- [SDK Node.js](https://github.com/mercadopago/sdk-nodejs)
- [Testing Guide](https://www.mercadopago.com.ar/developers/es/docs/checkout-pro/additional-content/test-integration)
- [Webhooks](https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks)

## Soporte

Si tienes problemas con la integración de Mercado Pago:
1. Verifica que el Access Token esté correctamente configurado
2. Revisa los logs en la consola del navegador y del servidor
3. Consulta la [documentación oficial](https://www.mercadopago.com.ar/developers)
4. Contacta al soporte de Mercado Pago
