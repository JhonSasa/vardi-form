# 📦 App – Sasa Consultoría (2025)

Aplicación para **actualización de datos – Grupo Vardi**, desarrollada por **Sasa Consultoría**.

---

## 🚀 Ejecución con Docker

1. **Clonar el repositorio**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_PROYECTO>
   ```
2. **Construir la imagen**
   ```bash
   docker compose build --no-cache
   ```
3. **Levantar el contenedor**
   ```bash
   docker compose up -d
   ```

---

## 🔄 Cambio de puerto

Si necesitas exponer la aplicación en otro puerto del host:

1. Abrir el archivo `docker-compose.yml`.
2. Editar la sección `ports`.

   **Ejemplo:** cambiar
   ```yaml
   ports:
     - "3000:3000"
   ```
   por
   ```yaml
   ports:
     - "3007:3000"
   ```

   En este caso, la aplicación se abrirá en:
   ```
   http://localhost:3007
   ```

---

## ⚙️ Variables de entorno

El archivo `.env` contiene la configuración de la aplicación.


> **Importante:**
> - Las variables que empiecen con `NEXT_PUBLIC_` estarán disponibles en el frontend.
> - Mantén en privado el archivo `.env`, no lo subas al repositorio.

---

## 📄 Licencia

© 2025 Sasa Consultoría. Todos los derechos reservados.
