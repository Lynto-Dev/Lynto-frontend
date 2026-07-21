# 🔌 GUÍA DE INTEGRACIÓN BACKEND ↔ FRONTEND

Esta guía detalla los endpoints disponibles en el backend de **Lynto** (Google Apps Script) para ser consumidos por el Frontend.

**Base URL (Production/Sandbox):**  
`https://script.google.com/macros/s/[SCRIPT_ID]/exec`  
*(Reemplazar `[SCRIPT_ID]` por la ID de la Web App desplegada en Apps Script).*

---

## 1. ⚙️ Endpoint: Carga Dinámica de Configuración (GET)

Se utiliza al cargar la página de inicio para inyectar textos, imágenes, stock y la tabla nutricional.

*   **Método:** `GET`
*   **Query Params:** `action=get_config`
*   **Ejemplo de Petición:**  
    `GET https://script.google.com/macros/s/[SCRIPT_ID]/exec?action=get_config`

### 📥 Ejemplo de Respuesta (JSON)
```json
{
  "success": true,
  "config": {
    "HOME_TITULO": "Lynto - El Suplemento del Futuro",
    "HOME_SUBTITULO": "La preventa exclusiva ya está disponible. Stock limitado.",
    "PRODUCTO_IMAGEN": "https://images.unsplash.com/photo-1584017911766-d451b3d0e843",
    "DISCLAIMER_LEGAL": "Este producto no reemplaza una alimentación balanceada...",
    "PRECIO_PREVENTA": 24990,
    "STOCK_DISPONIBLE": 100,
    "PRODUCTO_NOMBRE": "Lynto Suplemento Preventa",
    "PRODUCTO_DESCRIPCION": "Suplemento alimenticio premium diseñado para potenciar tu bienestar y vitalidad."
  },
  "nutricion": [
    {
      "componente": "Vitamina C",
      "cantidad": "500 mg",
      "ddr": "550%"
    },
    {
      "componente": "Zinc",
      "cantidad": "15 mg",
      "ddr": "136%"
    }
  ]
}
```

---

## 2. 🛒 Endpoint: Intención de Compra / Checkout (POST)

Inicia el proceso de checkout y retorna la URL de pago para redirigir al cliente a Flow.cl.

*   **Método:** `POST`
*   **Headers:** `Content-Type: text/plain` *(GAS bloquea solicitudes con Content-Type: application/json por temas de CORS prepending. Usar text/plain enviando un JSON stringificado).*
*   **Body (JSON Stringified):**
```json
{
  "nombre": "Esteban Osses",
  "rut": "19123456-K",
  "email": "esteban@correo.cl",
  "direccion": "Av. Apoquindo 3000, Las Condes",
  "cantidad": 2,
  "cupon": "PREVENTA20",
  "region": "Región Metropolitana"
}
```
*(Los campos `cupon` y `region` son opcionales según la decisión final de despacho/descuento).*

### 📥 Ejemplo de Respuesta (JSON - Compra Exitosa)
```json
{
  "status": 200,
  "success": true,
  "data": {
    "url": "https://sandbox.flow.cl/app/pay?token=XYZ...",
    "token": "XYZ...",
    "idPedido": "LYN-kxg18k5b-C9AB",
    "montoTotal": 43484,
    "descuento": 9996,
    "costoEnvio": 3500
  },
  "message": "Orden de compra pendiente creada con éxito."
}
```

### 📥 Ejemplo de Respuesta (JSON - Error en Validación)
```json
{
  "status": 400,
  "success": false,
  "data": null,
  "message": "Stock insuficiente. Unidades disponibles: 1"
}
```

---

## ⚠️ Consideraciones Críticas para el Frontend

1.  **CORS Handling:** Google Apps Script redirige automáticamente las peticiones POST. Utiliza `fetch` normal. Si experimentas problemas de CORS en el POST, asegúrate de enviar el body como `JSON.stringify(payload)` y el Header `Content-Type: text/plain`.
2.  **Prevención de Doble Envío:** Al hacer click en el botón de pago, se debe mostrar un spinner de carga (`#loading-overlay`) y bloquear inmediatamente el botón de envío para evitar peticiones duplicadas y duplicidad de cargos.
3.  **Validación de RUT:** El RUT se valida en servidor, pero se recomienda formatearlo en vivo y verificar el dígito verificador en cliente para mejorar la experiencia de usuario.
