# Seguimiento de Pagos — Contrato de Mutuo

App para registrar los pagos de la cuota de la casa, sincronizada entre todos los dispositivos (no usa localStorage, usa una base de datos en Vercel).

## Que incluye
- `public/index.html` — la app (misma interfaz que ya tenías, pero ahora guarda los datos en el servidor).
- `api/data.js` — funcion serverless que lee y escribe los pagos en Vercel KV.
- `public/manifest.json` + iconos — para poder "instalar" la app en el celular (icono en el escritorio, sin barra de navegador).

## Paso 1 — Subir el proyecto a GitHub
1. Anda a https://github.com/new y crea un repositorio (puede ser privado).
2. Subi esta carpeta completa (podes arrastrar los archivos desde la web de GitHub, opcion "uploading an existing file", o usar git desde la terminal).

## Paso 2 — Importar en Vercel
1. Entra a https://vercel.com y crea una cuenta (podes usar tu cuenta de GitHub para entrar mas rapido).
2. Click en "Add New" → "Project" → elegi el repositorio que subiste.
3. Dejá la configuracion por defecto (no hace falta framework, Vercel detecta los archivos solo) y click en "Deploy".

## Paso 3 — Crear la base de datos (Vercel eliminó "Vercel KV", ahora es vía Marketplace)
1. Andá a https://vercel.com/dashboard/stores (o desde el ícono de tu cuenta arriba a la izquierda → puede aparecer como "Storage" a nivel de cuenta, no dentro del proyecto).
2. Click en "Create Database".
3. Buscá **"Upstash"** y elegí la opción de **Redis**.
4. Cuando te pregunte a qué proyecto conectarla, elegí tu proyecto (`faustino-2176` o como se llame).
5. Esto crea automaticamente las variables de entorno `KV_REST_API_URL` y `KV_REST_API_TOKEN` (o `UPSTASH_REDIS_REST_URL`/`UPSTASH_REDIS_REST_TOKEN`) en tu proyecto — el codigo de `api/data.js` ya sabe usar cualquiera de los dos nombres.

## Paso 3b — Crear el almacenamiento de fotos (Vercel Blob, para los comprobantes)
1. En el mismo lugar (https://vercel.com/dashboard/stores → Create Database).
2. Esta vez elegí **"Blob"** (es un producto propio de Vercel, no del Marketplace — no hace falta buscar Upstash para este).
3. Conectala a tu mismo proyecto.
4. Esto agrega automaticamente la variable `BLOB_READ_WRITE_TOKEN` — no hace falta que hagas nada mas con ella.

## Paso 4 — Configurar el PIN compartido
1. En el proyecto, anda a "Settings" → "Environment Variables".
2. Agrega una variable llamada `APP_PIN` con el PIN que quieras usar (ej: `240816`). Este es el PIN que vos y quien mas use la app van a ingresar para registrar o borrar pagos.
3. Guarda y volve a "Deployments" → en el ultimo deploy, click en los tres puntos → "Redeploy" (para que tome la variable nueva).

## Paso 5 — Usarla
- Tu URL va a quedar algo como `https://mutuo-pagos.vercel.app`.
- Entra desde cualquier dispositivo, los datos son los mismos en todos.
- En el celular: abrí la URL en Chrome o Safari y elegi "Agregar a pantalla de inicio" (Safari) o el menu de instalar app (Chrome) — va a quedar como un icono mas, sin barra de navegador.

## Notas importantes
- Se puede exportar toda la informacion a un archivo Excel (.xlsx) desde el boton "Exportar a Excel" (en la seccion de Copia de seguridad). Incluye 3 hojas: Resumen, Pagos (con el link al comprobante de cada uno) y Plan de cuotas completo. Es un respaldo extra ademas del backup en JSON, pensado para guardar o revisar fuera de la app.
- Se puede adjuntar una foto del comprobante a cada pago (opcional, hasta 3.5MB, tambien acepta PDF). Se guarda en Vercel Blob y queda linkeada con un icono de camara en la tabla de historial. El limite de 3.5MB es por como funcionan las funciones serverless de Vercel en el plan gratuito (Hobby), no por el codigo en si.
- El proyecto no depende de ningun paquete de npm (no hace falta "npm install") — todo el codigo del servidor usa `fetch` directo contra las APIs de Upstash y Vercel Blob. Esto es importante porque al desplegar arrastrando la carpeta ("Vercel Drop") a veces no se ejecuta la instalacion de dependencias.
- Cualquiera que tenga el link puede **ver** los datos (leer no pide PIN). Para **agregar, borrar o resetear** pagos si hace falta el PIN que configuraste en el paso 4.
- Si queres que ni siquiera se pueda ver sin autenticarse, Vercel tiene "Password Protection" a nivel de sitio completo en los planes Pro — avisame si eso te interesa y lo agregamos.
- El navegador tambien guarda una copia local de respaldo (por si te quedas sin señal), pero la fuente de verdad es siempre el servidor.
 
