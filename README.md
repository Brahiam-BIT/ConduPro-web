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

## Estructura

```
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
5. **Fase 5 — Panel del administrador**
6. **Fase 6 — Polish, responsive, PWA, accesibilidad**
