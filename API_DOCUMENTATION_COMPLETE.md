# API Documentation - Sistema Completo

## Base URL
```
http://localhost:3000/api
```

## Autenticación
Todas las peticiones que requieren autenticación deben incluir el token en el header:
```
Authorization: Bearer <token>
```

---

## 1. Autenticación y Usuarios

### 1.1 Registro de Cliente
```http
POST /api/auth/register
```
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@ejemplo.com",
  "password": "contraseña123",
  "phone": "+529614795475",
  "location": {
    "alias": "Mi Casa - Avenida La Salle entre primera y segunda",
    "googleMapsUrl": "https://maps.app.goo.gl/9qhiAJQxLjaqDYxZA"
  },
  "role": "client"
}
```

### 1.2 Registro de Administrador (con Tienda)
```http
POST /api/auth/register
```
```json
{
  "name": "María García",
  "email": "maria.garcia@ejemplo.com",
  "password": "contraseña123",
  "phone": "+529614795475",
  "location": {
    "alias": "Mi Tienda - Centro Comercial Plaza",
    "googleMapsUrl": "https://maps.app.goo.gl/9qhiAJQxLjaqDYxZA"
  },
  "role": "admin",
  "store": {
    "name": "Tienda Tecnología Pro",
    "responsibleName": "María García",
    "phone": "+529614795475",
    "categories": ["tecnologia", "hogar"],
    "description": "La mejor tienda de tecnología en la ciudad",
    "images": ["https://ejemplo.com/tienda1.jpg"],
    "location": {
      "alias": "Tienda Tecnología Pro - Centro Comercial",
      "googleMapsUrl": "https://maps.app.goo.gl/9qhiAJQxLjaqDYxZA"
    },
    "schedule": [
      {
        "day": "Lunes",
        "openTime": "09:00",
        "closeTime": "18:00",
        "isOpen": true
      }
      // ... resto de días
    ]
  }
}
```

### 1.3 Login
```http
POST /api/auth/login
```
```json
{
  "email": "usuario@ejemplo.com",
  "password": "contraseña123"
}
```

---

## 2. Gestión de Tiendas

### 2.1 Listar Tiendas
```http
GET /api/stores?page=1&limit=10&categories=tecnologia&search=nombre
```

### 2.2 Obtener Tienda Específica
```http
GET /api/stores/:storeId
```

### 2.3 Actualizar Tienda (Admin/Dueño)
```http
PUT /api/stores/:storeId
Authorization: Bearer <token>
```

---

## 3. Gestión de Productos

### 3.1 Listar Productos de una Tienda
```http
GET /api/stores/:storeId/products?page=1&limit=10&category=tecnologia&search=nombre
```

### 3.2 Crear Producto
```http
POST /api/stores/:storeId/products
Authorization: Bearer <token>
```
```json
{
  "name": "iPhone 13 Pro",
  "description": "Smartphone Apple con chip A15 Bionic",
  "price": 19999.99,
  "stock": 50,
  "category": "tecnologia",
  "images": [
    "https://ejemplo.com/iphone1.jpg",
    "https://ejemplo.com/iphone2.jpg"
  ]
}
```

### 3.3 Actualizar Producto
```http
PUT /api/stores/:storeId/products/:productId
Authorization: Bearer <token>
```

### 3.4 Cambiar Estado del Producto
```http
PUT /api/stores/:storeId/products/:productId/toggle-status
Authorization: Bearer <token>
```

### 3.5 Eliminar Producto
```http
DELETE /api/stores/:storeId/products/:productId
Authorization: Bearer <token>
```

---

## 4. Sistema de Carrito

### 4.1 Obtener Carrito
```http
GET /api/cart?storeId=store_id
Headers: X-Session-ID: session_id
```

### 4.2 Agregar Producto al Carrito
```http
POST /api/cart/add
Headers: X-Session-ID: session_id
```
```json
{
  "productId": "product_id",
  "quantity": 2,
  "note": "Con empaque especial",
  "storeId": "store_id"
}
```

### 4.3 Actualizar Producto en Carrito
```http
PUT /api/cart/update
Headers: X-Session-ID: session_id
```
```json
{
  "productId": "product_id",
  "quantity": 3,
  "note": "Nueva nota",
  "storeId": "store_id"
}
```

### 4.4 Remover Producto del Carrito
```http
DELETE /api/cart/remove
Headers: X-Session-ID: session_id
```
```json
{
  "productId": "product_id",
  "storeId": "store_id"
}
```

### 4.5 Limpiar Carrito
```http
DELETE /api/cart/clear
Headers: X-Session-ID: session_id
```
```json
{
  "storeId": "store_id"
}
```

---

## 5. Sistema de Órdenes

### 5.1 Crear Orden
```http
POST /api/orders/create
```
```json
{
  "customer": {
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "phone": "+52 55 1234 5678",
    "shippingAddress": "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX"
  },
  "items": [
    {
      "productId": "product_id",
      "name": "iPhone 13 Pro",
      "quantity": 2,
      "price": 19999.99,
      "note": "Con empaque especial"
    }
  ],
  "payment": {
    "method": "efectivo",
    "details": "Pago en efectivo al momento de la entrega"
  },
  "totals": {
    "subtotal": 39999.98,
    "shipping": 99.99,
    "total": 40099.97
  },
  "storeId": "store_id"
}
```

### 5.2 Listar Órdenes (Admin)
```http
GET /api/orders/admin/orders?status=pendiente&date=2024-02-20&page=1&limit=10
Authorization: Bearer <token>
```

### 5.3 Obtener Orden Específica (Admin)
```http
GET /api/orders/admin/orders/:orderId
Authorization: Bearer <token>
```

### 5.4 Actualizar Estado de Orden (Admin)
```http
PUT /api/orders/admin/orders/:orderId/status
Authorization: Bearer <token>
```
```json
{
  "status": "en_proceso",
  "notes": "Orden en preparación"
}
```

### 5.5 Estadísticas del Panel (Admin)
```http
GET /api/orders/admin/stats
Authorization: Bearer <token>
```

---

## 6. Categorías Disponibles

```javascript
const categories = [
  "tecnologia",
  "moda", 
  "juguetes",
  "comida",
  "hogar",
  "jardin",
  "mascotas",
  "deportes",
  "belleza",
  "libros",
  "musica",
  "arte",
  "automotriz",
  "ferreteria"
];
```

---

## 7. Estados de Órdenes

- `pendiente`: Orden recién creada
- `en_proceso`: Orden confirmada, en preparación
- `completado`: Orden entregada al cliente
- `cancelado`: Orden cancelada

---

## 8. Métodos de Pago

- `efectivo`: Pago en efectivo al momento de la entrega
- `transferencia`: Transferencia bancaria
- `tarjeta`: Tarjeta de crédito/débito

---

## 9. Ejemplos de Uso en JavaScript

### 9.1 Gestión del Carrito
```javascript
// Configurar sessionId
const sessionId = 'user-session-' + Date.now();

// Agregar al carrito
const addToCart = async (productId, quantity, storeId) => {
  try {
    const response = await fetch('http://localhost:3000/api/cart/add', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': sessionId
      },
      body: JSON.stringify({
        productId,
        quantity,
        storeId
      })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Obtener carrito
const getCart = async (storeId) => {
  try {
    const response = await fetch(`http://localhost:3000/api/cart?storeId=${storeId}`, {
      headers: {
        'X-Session-ID': sessionId
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

### 9.2 Crear Orden
```javascript
const createOrder = async (orderData) => {
  try {
    const response = await fetch('http://localhost:3000/api/orders/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Ejemplo de uso
const orderData = {
  customer: {
    name: "Juan Pérez",
    email: "juan@email.com",
    phone: "+52 55 1234 5678",
    shippingAddress: "Av. Insurgentes Sur 1234, Col. Del Valle, CDMX"
  },
  items: [
    {
      productId: "product_id",
      name: "iPhone 13 Pro",
      quantity: 1,
      price: 19999.99,
      note: "Con empaque especial"
    }
  ],
  payment: {
    method: "efectivo",
    details: "Pago en efectivo al momento de la entrega"
  },
  totals: {
    subtotal: 19999.99,
    shipping: 99.99,
    total: 20099.98
  },
  storeId: "store_id"
};

createOrder(orderData);
```

### 9.3 Panel Administrativo
```javascript
// Obtener estadísticas
const getStats = async () => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch('http://localhost:3000/api/orders/admin/stats', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};

// Actualizar estado de orden
const updateOrderStatus = async (orderId, status) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:3000/api/orders/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ status })
    });

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error:', error);
  }
};
```

---

## 10. Flujo Completo de Compra

### 10.1 Cliente
1. **Navegar productos**: `GET /api/stores/:storeId/products`
2. **Agregar al carrito**: `POST /api/cart/add`
3. **Ver carrito**: `GET /api/cart?storeId=store_id`
4. **Actualizar carrito**: `PUT /api/cart/update`
5. **Crear orden**: `POST /api/orders/create`

### 10.2 Admin
1. **Ver estadísticas**: `GET /api/orders/admin/stats`
2. **Listar órdenes**: `GET /api/orders/admin/orders`
3. **Ver orden específica**: `GET /api/orders/admin/orders/:id`
4. **Actualizar estado**: `PUT /api/orders/admin/orders/:id/status`

---

## 11. Códigos de Error

### 400 - Bad Request
```json
{
  "success": false,
  "error": "Mensaje de error específico"
}
```

### 401 - Unauthorized
```json
{
  "success": false,
  "error": "Credenciales inválidas"
}
```

### 404 - Not Found
```json
{
  "success": false,
  "error": "Recurso no encontrado"
}
```

### 500 - Internal Server Error
```json
{
  "success": false,
  "error": "Error interno del servidor"
}
```

---

## 12. Notas Importantes

1. **Session ID**: Usar header `X-Session-ID` para identificar sesiones de carrito
2. **Formato de Teléfono**: Siempre usar formato internacional (+529614795475)
3. **URLs de Google Maps**: Deben comenzar con https://maps.app.goo.gl/ o https://goo.gl/maps/
4. **Categorías**: Usar exactamente las categorías en minúsculas y sin acentos
5. **Horarios**: Formato 24h (HH:mm) y todos los días de la semana son requeridos
6. **Token**: Guardar en localStorage y enviar en header Authorization
7. **Validaciones**: El frontend debe validar los campos antes de enviar
8. **Manejo de Errores**: Siempre manejar los errores de la API
9. **Paginación**: Usar los parámetros page y limit para listas grandes
10. **Stock**: Verificar stock antes de agregar al carrito y crear órdenes 