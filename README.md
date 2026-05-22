# ConduPro Web

Frontend de **ConduPro**, plataforma de gestión para escuelas de conducción.
Construido con React 18 + TypeScript + Vite + Tailwind CSS y un design system
propio (sin librerías de componentes externas).

## Stack

- **React 18** + **TypeScript 5** (strict mode)
- **Vite 5**
- **Tailwind CSS 3** con design system personalizado
- **React Router 6** (`createBrowserRouter` + lazy loading)
- **TanStack Query 5** para fetch + cache
- **React Hook Form 7** + **Zod**
- **Axios** con interceptores JWT + refresh silencioso
- **date-fns**, **Lucide React**, **Recharts**
- **Zustand** para estado UI local
- **vite-plugin-pwa** para PWA / service worker

## Identidad visual

- **Primario**: violet eléctrico (`#7C3AED`, escala 50–950).
- **Acento**: amber cálido para CTAs secundarios y highlights.
- **Fondos**: off-white cálido (`#FAFAF9`) en claro / near-black con tinte violeta (`#0B0A14`) en oscuro.
- **Tipografía**: Plus Jakarta Sans (Google Fonts).
- **Radios**: `sm 4 / md 8 / lg 16 / xl 24 / full`.
- **Sombras**: tintadas con el color primario.

## Scripts

```bash
npm run dev         # arranca el dev server (http://localhost:5173)
npm run build       # typecheck + build de producción
npm run preview     # sirve dist/ localmente
npm run lint        # ESLint
npm run typecheck   # tsc -b --noEmit
```

## Variables de entorno

Copia `.env.example` a `.env.local` y ajusta:

```env
VITE_API_URL=http://localhost:3000
```

En producción, GitHub Actions compila con `VITE_API_URL=http://18.223.229.175` (ver [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## Despliegue (S3 + GitHub Actions)

Hosting estático HTTP en **S3 Static Website** (sin CloudFront), desplegado automáticamente en cada push a `main`.

### Requisitos

- Cuenta AWS con permisos para S3 e IAM
- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.5
- [AWS CLI](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) configurado (`aws configure`)

### 1. Provisionar infraestructura (una vez)

```bash
cd infra/terraform
cp terraform.tfvars.example terraform.tfvars
# Edita terraform.tfvars si cambias región o repositorio GitHub
terraform init
terraform apply
```

Anota los outputs:

| Output Terraform | Uso en GitHub |
|------------------|---------------|
| `github_actions_role_arn` | Secret `AWS_ROLE_ARN` |
| `bucket_name` | Variable `S3_BUCKET` |
| `aws_region` | Variable `AWS_REGION` |
| `website_endpoint` | URL pública del frontend |

### 2. Configurar GitHub

En el repositorio: **Settings → Secrets and variables → Actions**

| Nombre | Tipo | Valor |
|--------|------|-------|
| `AWS_ROLE_ARN` | Secret | output `github_actions_role_arn` |
| `AWS_REGION` | Variable | ej. `us-east-1` |
| `S3_BUCKET` | Variable | output `bucket_name` |

### 3. CORS en el backend

El frontend en S3 llama al API en `http://18.223.229.175`. El navegador enviará el origen del sitio web, por ejemplo:

`http://condupro-web-xxxxxxxx.s3-website-us-east-1.amazonaws.com`

En el NestJS de ese servidor, permite ese origen en CORS (métodos `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS` y los headers que use Axios, incluido `Authorization`). Sin esto, login y peticiones autenticadas fallarán aunque el deploy sea correcto.

Usa la URL exacta del output `website_endpoint` (sin barra final).

### 4. Publicar

Haz push o merge a `main`. El workflow [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) ejecuta `npm run build` y sube `dist/` al bucket.

### 5. Verificar

1. Abre `website_endpoint` del output de Terraform.
2. Prueba login contra el API de producción.
3. Navega directamente a una ruta (ej. `/login`) para confirmar el fallback SPA (`index.html` como error document).

### Notas

- Sitio y API usan **HTTP** (sin mixed content).
- El bucket es de lectura pública; la escritura solo la tiene el rol IAM de GitHub Actions (OIDC).
- Si `terraform apply` falla porque el proveedor OIDC de GitHub ya existe en la cuenta, importa el recurso existente o elimina el duplicado según tu caso.

## Estructura

```
infra/
  terraform/    S3 static website + IAM OIDC para GitHub Actions
.github/
  workflows/    CI/CD (deploy en push a main)
src/
  api/          Funciones de fetch tipadas (un archivo por dominio)
  components/
    ui/         Design system (Button, Input, Modal, Table, ...)
    layout/     Sidebar, Navbar, PageHeader, Logo, ThemeToggle
    shared/     Componentes de negocio reutilizables
  constants/    Roles, rutas
  hooks/        useAuth, useDebounce, useLocalStorage, useMediaQuery
  lib/          axios, queryClient
  pages/        Páginas (auth, student, instructor, admin)
  providers/    AppProviders + Query / Theme / Toast / Auth
  router/       createBrowserRouter + ProtectedRoute + RoleRoute
  store/        Estado UI (Zustand)
  types/        Tipos compartidos
  utils/        cn, formatters, formatDate
```

## Storybook manual

En desarrollo está disponible en [`/dev/components`](http://localhost:5173/dev/components).
Renderiza todos los componentes del design system con sus variantes y estados
en una sola pantalla.

## Fases del desarrollo

1. **Fase 1 — Scaffold + Design system** ✅
2. **Fase 2 — Autenticación** ✅
3. **Fase 3 — Vistas del estudiante** ✅
4. **Fase 4 — Vistas del instructor** ✅
5. **Fase 5 — Panel del administrador** ✅
6. **Fase 6 — Polish, responsive, PWA, accesibilidad** ✅
