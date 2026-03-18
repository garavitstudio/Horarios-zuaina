# Zuaina Horarios

Aplicación web de gestión de hojas de horario laboral para la **Asociación Sociocultural La Vida es Zuaina**.

## ¿Qué hace esta aplicación?

- **Añadir trabajadores** con su horario semanal (continuo o partido)
- **Generar automáticamente** las 12 hojas de horario mensuales en PDF para cualquier año
- **Descargar** los PDFs en un único fichero ZIP listo para imprimir
- **Administrar** trabajadores y festivos desde una interfaz sencilla

## Tecnologías

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Prisma** + **PostgreSQL**
- **NextAuth v5** (autenticación)
- **pdf-lib** (generación de PDFs)
- **JSZip** (empaquetado ZIP)

---

## Desarrollo local

### 1. Clona el repositorio

```bash
git clone https://github.com/tu-usuario/zuaina-horarios.git
cd zuaina-horarios
```

### 2. Instala las dependencias

```bash
npm install
```

### 3. Configura las variables de entorno

Copia el fichero `.env.example` como `.env.local`:

```bash
cp .env.example .env.local
```

Rellena las variables:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/zuaina_horarios"
AUTH_USERNAME="zuaina"
AUTH_PASSWORD="Horarioszuaina"
NEXTAUTH_SECRET="cambia-esto-por-una-cadena-aleatoria-larga"
NEXTAUTH_URL="http://localhost:3000"
```

> Genera un secreto seguro con: `openssl rand -base64 32`

### 4. Configura la base de datos

```bash
# Crear las tablas
npx prisma migrate dev --name init

# Cargar datos de ejemplo (festivos Lanzarote, 2 trabajadores)
npm run db:seed
```

### 5. Arranca el servidor de desarrollo

```bash
npm run dev
```

La app estará disponible en: http://localhost:3000

---

## Credenciales de acceso

| Campo | Valor |
|-------|-------|
| Usuario | `Zuaina` (sin distinción de mayúsculas) |
| Contraseña | `Horarioszuaina` (SÍ distingue mayúsculas) |

---

## Variables de entorno

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | Cadena de conexión PostgreSQL | `postgresql://...` |
| `AUTH_USERNAME` | Usuario de acceso | `zuaina` |
| `AUTH_PASSWORD` | Contraseña de acceso | `Horarioszuaina` |
| `NEXTAUTH_SECRET` | Secreto para JWT (mín. 32 caracteres) | `openssl rand -base64 32` |
| `NEXTAUTH_URL` | URL pública de la app | `https://lavidaeszuaina.es/app_horarios` |

---

## Despliegue en Vercel

### Paso 1: Sube el proyecto a GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Paso 2: Base de datos PostgreSQL

Necesitas una base de datos PostgreSQL accesible desde Vercel. Opciones recomendadas:

- **[Neon](https://neon.tech)** — capa gratuita generosa, fácil de configurar
- **[Supabase](https://supabase.com)** — capa gratuita, interfaz amigable
- **[Railway](https://railway.app)** — sencillo, pago por uso
- **Vercel Postgres** — integración nativa con Vercel

Copia la cadena de conexión (`DATABASE_URL`) cuando la crees.

### Paso 3: Conecta con Vercel

1. Ve a [vercel.com](https://vercel.com) → **Add New Project**
2. Selecciona tu repositorio de GitHub
3. En **Environment Variables**, añade:

```
DATABASE_URL=postgresql://...
AUTH_USERNAME=zuaina
AUTH_PASSWORD=Horarioszuaina
NEXTAUTH_SECRET=<genera_uno_con_openssl>
NEXTAUTH_URL=https://lavidaeszuaina.es/app_horarios
```

4. Pulsa **Deploy**

### Paso 4: Ejecutar migraciones en producción

Después del primer despliegue, ejecuta las migraciones desde tu máquina local apuntando a la base de datos de producción:

```bash
DATABASE_URL="postgresql://..." npx prisma migrate deploy
```

Y el seed inicial (opcional, pero recomendado):

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

### Paso 5: Configurar el dominio personalizado

Para que la app funcione bajo **lavidaeszuaina.es/app_horarios**:

1. En el panel de Vercel, ve a **Settings → Domains**
2. Añade `lavidaeszuaina.es`
3. En el proveedor de DNS del dominio, añade los registros que Vercel indique

> **Nota técnica**: La app usa `basePath: "/app_horarios"` en `next.config.ts`.
> Si prefieres usar un subdominio (`app.lavidaeszuaina.es`), elimina esa línea del config y cambia `NEXTAUTH_URL` al subdominio correspondiente. Los subdominios son más sencillos de configurar y evitan posibles conflictos si la web principal ya usa ese dominio.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/    # Handler de NextAuth
│   │   ├── workers/               # CRUD trabajadores
│   │   ├── holidays/              # CRUD festivos
│   │   └── generate/             # Generación ZIP+PDFs
│   ├── login/                     # Página de acceso
│   ├── trabajadores/nuevo/        # Formulario nuevo trabajador
│   ├── horarios/                  # Módulo sacar horarios
│   ├── administrar/
│   │   ├── trabajadores/          # Listado + edición
│   │   └── festivos/              # CRUD festivos
│   ├── layout.tsx
│   └── page.tsx                   # Dashboard principal
├── lib/
│   ├── auth.ts                    # Config NextAuth
│   ├── prisma.ts                  # Cliente Prisma
│   ├── schedule.ts                # Lógica de negocio horarios
│   └── pdf/
│       ├── generateContinuousPdf.ts
│       └── generateSplitPdf.ts
├── middleware.ts                   # Protección de rutas
└── types/index.ts                 # Tipos compartidos
prisma/
├── schema.prisma                  # Modelo de datos
└── seed.ts                        # Datos iniciales
```

---

## Comandos útiles

```bash
npm run dev           # Servidor de desarrollo
npm run build         # Build de producción
npm run db:seed       # Cargar datos de ejemplo
npm run db:studio     # Abrir Prisma Studio (GUI BD)
npm run db:migrate    # Ejecutar migraciones pendientes
```

---

## Notas de la lógica de negocio

- Los **festivos** se aplican automáticamente al generar los PDFs
- Si un festivo cae en un día laborable del trabajador, aparece en **azul** en el PDF
- El formato de horas en los PDFs es `5,00 h` (estilo español)
- Los trabajadores tipo **CONTINUO** → plantilla PDF sin segundo turno
- Los trabajadores tipo **PARTIDO** → plantilla PDF con turno mañana y tarde

---

## Supuestos documentados

- El trabajador mantiene el mismo horario durante todo el año (editable desde Administrar si cambia)
- No se implementa historial de generaciones (no requerido)
- No hay sistema de múltiples usuarios ni roles (un único acceso compartido)
- Los festivos se configuran por año de forma independiente
