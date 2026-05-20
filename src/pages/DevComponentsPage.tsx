import { useState, type ReactNode } from 'react';
import { Calendar, Mail, Search, Sparkles, Trash2 } from 'lucide-react';
import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  DatePicker,
  Input,
  Modal,
  Select,
  Skeleton,
  SkeletonText,
  Spinner,
  Stepper,
  Tabs,
  Toggle,
  Table,
} from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ThemeToggle } from '@/components/layout/ThemeToggle';
import { Logo } from '@/components/layout/Logo';
import { useToast } from '@/providers/ToastProvider';
import type { TableColumn } from '@/components/ui/Table';

interface DemoRow {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

const PRIMARY_SHADES: { shade: number; className: string }[] = [
  { shade: 50, className: 'bg-primary-50' },
  { shade: 100, className: 'bg-primary-100' },
  { shade: 200, className: 'bg-primary-200' },
  { shade: 300, className: 'bg-primary-300' },
  { shade: 400, className: 'bg-primary-400' },
  { shade: 500, className: 'bg-primary-500' },
  { shade: 600, className: 'bg-primary-600' },
  { shade: 700, className: 'bg-primary-700' },
  { shade: 800, className: 'bg-primary-800' },
  { shade: 900, className: 'bg-primary-900' },
  { shade: 950, className: 'bg-primary-950' },
];

const DEMO_ROWS: DemoRow[] = [
  { id: '1', name: 'Ana López', email: 'ana@condupro.io', role: 'Estudiante', status: 'active' },
  { id: '2', name: 'Pedro Pérez', email: 'pedro@condupro.io', role: 'Instructor', status: 'active' },
  { id: '3', name: 'Carla Ramírez', email: 'carla@condupro.io', role: 'Admin', status: 'inactive' },
];

const DEMO_COLUMNS: TableColumn<DemoRow>[] = [
  {
    key: 'name',
    header: 'Nombre',
    sortable: true,
    sortAccessor: (r) => r.name,
    cell: (r) => (
      <div className="flex items-center gap-2">
        <Avatar name={r.name} size="sm" />
        <span className="font-medium text-surface-800 dark:text-surface-100">{r.name}</span>
      </div>
    ),
  },
  {
    key: 'email',
    header: 'Email',
    cell: (r) => <span className="text-surface-600 dark:text-surface-400">{r.email}</span>,
  },
  {
    key: 'role',
    header: 'Rol',
    cell: (r) => <Badge variant="primary">{r.role}</Badge>,
  },
  {
    key: 'status',
    header: 'Estado',
    cell: (r) =>
      r.status === 'active' ? (
        <Badge variant="success" dot>
          Activo
        </Badge>
      ) : (
        <Badge variant="neutral" dot>
          Inactivo
        </Badge>
      ),
    align: 'right',
  },
];

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <div>
        <h2 className="text-heading-md text-surface-900 dark:text-surface-50">{title}</h2>
        {description ? (
          <p className="mt-0.5 text-body-sm text-surface-500 dark:text-surface-400">{description}</p>
        ) : null}
      </div>
      <Card variant="elevated">
        <div className="flex flex-col gap-6">{children}</div>
      </Card>
    </section>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p className="w-32 shrink-0 text-caption font-semibold uppercase tracking-wide text-surface-500 dark:text-surface-400">
        {label}
      </p>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  );
}

export default function DevComponentsPage() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState('overview');
  const [date, setDate] = useState<Date | null>(null);
  const [toggleOn, setToggleOn] = useState(true);

  return (
    <div className="min-h-screen bg-surface-100 px-4 py-8 dark:bg-surface-950 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-10">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Logo size={36} />
            <div>
              <p className="text-caption font-semibold uppercase tracking-wide text-primary-600 dark:text-primary-300">
                Storybook manual
              </p>
              <h1 className="text-display-sm text-surface-900 dark:text-surface-50">Design system</h1>
            </div>
          </div>
          <ThemeToggle />
        </header>

        <PageHeader
          title="Componentes UI"
          subtitle="Todas las variantes del design system de ConduPro en una sola pantalla."
          actions={
            <>
              <Button variant="outline" iconLeft={<Sparkles className="h-4 w-4" />}>
                Inspirar
              </Button>
              <Button variant="primary" onClick={() => toast.success('Listo', 'Se aplicaron los cambios.')}>
                Probar toast
              </Button>
            </>
          }
        />

        {/* ---------------- BUTTONS ---------------- */}
        <Section title="Buttons" description="Variantes, tamaños y estados.">
          <Row label="Variants">
            <Button variant="primary">Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="danger" iconLeft={<Trash2 className="h-4 w-4" />}>
              Danger
            </Button>
          </Row>
          <Row label="Sizes">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
          </Row>
          <Row label="States">
            <Button isLoading>Cargando</Button>
            <Button disabled>Disabled</Button>
            <Button iconLeft={<Mail className="h-4 w-4" />}>Con ícono</Button>
            <Button fullWidth variant="secondary">
              Full width
            </Button>
          </Row>
        </Section>

        {/* ---------------- INPUTS ---------------- */}
        <Section title="Inputs & Selects" description="Estados default, error y success.">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Input label="Email" placeholder="tu@correo.com" iconLeft={<Mail className="h-4 w-4" />} />
            <Input label="Buscar" placeholder="Buscar..." iconLeft={<Search className="h-4 w-4" />} state="success" helperText="Todo bien" />
            <Input
              label="Contraseña"
              type="password"
              placeholder="••••••"
              errorMessage="La contraseña es muy corta"
            />
            <Input label="Disabled" placeholder="No editable" disabled />
            <Select
              label="Rol"
              options={[
                { value: 'student', label: 'Estudiante' },
                { value: 'instructor', label: 'Instructor' },
                { value: 'admin', label: 'Administrador' },
              ]}
              defaultValue="student"
            />
            <Select
              label="Con error"
              placeholder="Selecciona..."
              options={[
                { value: '1', label: 'Opción 1' },
                { value: '2', label: 'Opción 2' },
              ]}
              errorMessage="Selecciona una opción"
            />
          </div>
        </Section>

        {/* ---------------- CARDS ---------------- */}
        <Section title="Cards" description="default · elevated · glass">
          <div className="grid gap-4 sm:grid-cols-3">
            <Card variant="default">
              <CardHeader>
                <div>
                  <CardTitle>Default</CardTitle>
                  <CardDescription>Borde sutil sin sombra.</CardDescription>
                </div>
              </CardHeader>
              <p className="text-body-sm text-surface-600 dark:text-surface-400">
                Contenido genérico de la tarjeta.
              </p>
              <CardFooter>
                <Button variant="ghost" size="sm">
                  Acción
                </Button>
                <Button size="sm">Aceptar</Button>
              </CardFooter>
            </Card>
            <Card variant="elevated">
              <CardHeader>
                <div>
                  <CardTitle>Elevated</CardTitle>
                  <CardDescription>Con sombra tintada en violet.</CardDescription>
                </div>
              </CardHeader>
              <p className="text-body-sm text-surface-600 dark:text-surface-400">
                Ideal para módulos destacados.
              </p>
            </Card>
            <Card variant="glass" className="bg-gradient-brand-soft">
              <CardHeader>
                <div>
                  <CardTitle>Glass</CardTitle>
                  <CardDescription>Con backdrop-blur.</CardDescription>
                </div>
              </CardHeader>
              <p className="text-body-sm text-surface-600 dark:text-surface-400">
                Funciona bien sobre fondos con color.
              </p>
            </Card>
          </div>
        </Section>

        {/* ---------------- BADGES ---------------- */}
        <Section title="Badges" description="Estados semánticos y tamaños.">
          <Row label="Variants">
            <Badge variant="primary">Primary</Badge>
            <Badge variant="success" dot>
              Success
            </Badge>
            <Badge variant="warning" dot>
              Warning
            </Badge>
            <Badge variant="error" dot>
              Error
            </Badge>
            <Badge variant="info" dot>
              Info
            </Badge>
            <Badge variant="neutral">Neutral</Badge>
          </Row>
          <Row label="Sizes">
            <Badge variant="primary" size="sm">
              Small
            </Badge>
            <Badge variant="primary" size="md">
              Medium
            </Badge>
          </Row>
        </Section>

        {/* ---------------- AVATARS ---------------- */}
        <Section title="Avatars" description="Iniciales con color derivado del nombre cuando no hay foto.">
          <Row label="Sizes">
            <Avatar name="Ana López" size="xs" />
            <Avatar name="Pedro Pérez" size="sm" />
            <Avatar name="Carla Ramírez" size="md" />
            <Avatar name="Diego Torres" size="lg" />
            <Avatar name="Sofía Mejía" size="xl" />
          </Row>
        </Section>

        {/* ---------------- TOGGLE ---------------- */}
        <Section title="Toggle" description="Switch accesible para campos booleanos.">
          <Row label="Switch">
            <Toggle
              label="Recibir notificaciones"
              description="Te enviaremos un email cuando confirmes tu clase."
              checked={toggleOn}
              onChange={(e) => setToggleOn(e.target.checked)}
            />
            <Toggle size="sm" label="Compacto" defaultChecked />
            <Toggle label="Disabled" disabled />
          </Row>
        </Section>

        {/* ---------------- TABS ---------------- */}
        <Section title="Tabs" description="Indicador animado deslizante.">
          <Row label="Underline">
            <Tabs
              value={tab}
              onValueChange={setTab}
              items={[
                { value: 'overview', label: 'Resumen' },
                { value: 'history', label: 'Historial' },
                { value: 'settings', label: 'Ajustes' },
              ]}
            />
          </Row>
          <Row label="Pill">
            <Tabs
              variant="pill"
              defaultValue="day"
              items={[
                { value: 'day', label: 'Día' },
                { value: 'week', label: 'Semana' },
                { value: 'month', label: 'Mes' },
              ]}
            />
          </Row>
        </Section>

        {/* ---------------- STEPPER ---------------- */}
        <Section title="Stepper" description="Pasos numerados con estado.">
          <Stepper
            currentStep={1}
            steps={[
              { id: '1', title: 'Tipo de clase', description: 'Teórica o práctica' },
              { id: '2', title: 'Fecha y horario', description: 'Cuándo quieres tomarla' },
              { id: '3', title: 'Confirmación', description: 'Revisa y acepta' },
            ]}
          />
        </Section>

        {/* ---------------- DATEPICKER ---------------- */}
        <Section title="DatePicker" description="Calendario propio sin librerías externas.">
          <div className="max-w-xs">
            <DatePicker label="Fecha preferida" value={date} onChange={setDate} helperText="Solo días futuros." minDate={new Date()} />
          </div>
        </Section>

        {/* ---------------- MODAL ---------------- */}
        <Section title="Modal" description="Overlay con blur, animación scale+fade y bottom-sheet en mobile.">
          <Row label="Acciones">
            <Button onClick={() => setModalOpen(true)}>Abrir modal</Button>
          </Row>
          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="¿Confirmar agendamiento?"
            description="Revisa los detalles antes de confirmar."
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    toast.success('Confirmado', 'Tu clase fue agendada.');
                  }}
                >
                  Confirmar
                </Button>
              </>
            }
          >
            <ul className="space-y-2 text-body-sm text-surface-700 dark:text-surface-200">
              <li>
                <strong>Tipo:</strong> Práctica
              </li>
              <li>
                <strong>Instructor:</strong> Pedro Pérez
              </li>
              <li>
                <strong>Fecha:</strong> 21 de mayo, 10:00 a.m.
              </li>
            </ul>
          </Modal>
        </Section>

        {/* ---------------- TOAST ---------------- */}
        <Section title="Toasts" description="Sistema propio con barra de progreso (auto-dismiss 4s).">
          <Row label="Disparar">
            <Button variant="primary" onClick={() => toast.success('Hecho', 'Tu acción fue completada.')}>
              Success
            </Button>
            <Button variant="danger" onClick={() => toast.error('Algo falló', 'Intenta de nuevo.')}>
              Error
            </Button>
            <Button variant="outline" onClick={() => toast.warning('Atención', 'Revisa tus datos.')}>
              Warning
            </Button>
            <Button variant="secondary" onClick={() => toast.info('Nuevo', 'Hay clases disponibles cerca.')}>
              Info
            </Button>
          </Row>
        </Section>

        {/* ---------------- LOADERS ---------------- */}
        <Section title="Loaders" description="Spinner y skeletons con shimmer.">
          <Row label="Spinner">
            <Spinner size="xs" />
            <Spinner size="sm" />
            <Spinner size="md" />
            <Spinner size="lg" />
          </Row>
          <Row label="Skeleton">
            <div className="flex w-full max-w-md flex-col gap-2">
              <Skeleton className="h-8 w-1/3" />
              <SkeletonText lines={3} />
            </div>
          </Row>
        </Section>

        {/* ---------------- TABLE ---------------- */}
        <Section title="Table" description="Sortable + skeleton + empty + cards en mobile.">
          <Table
            columns={DEMO_COLUMNS}
            data={DEMO_ROWS}
            rowKey={(r) => r.id}
            onRowClick={() => toast.info('Fila clickeada')}
          />
          <p className="text-caption text-surface-500 dark:text-surface-400">
            En pantallas &lt; 768px cada fila colapsa a una card stack.
          </p>
        </Section>

        {/* ---------------- TYPOGRAPHY ---------------- */}
        <Section title="Tipografía" description="Plus Jakarta Sans · escala completa">
          <div className="space-y-1">
            <p className="text-display-2xl">Display 2xl</p>
            <p className="text-display-xl">Display xl</p>
            <p className="text-display-lg">Display lg</p>
            <p className="text-display-md">Display md</p>
            <p className="text-display-sm">Display sm</p>
            <p className="text-heading-lg">Heading lg</p>
            <p className="text-heading-md">Heading md</p>
            <p className="text-heading-sm">Heading sm</p>
            <p className="text-body-lg">Body large — el rápido zorro marrón.</p>
            <p className="text-body-md">Body medium — el rápido zorro marrón.</p>
            <p className="text-body-sm">Body small — el rápido zorro marrón.</p>
            <p className="text-label">Label</p>
            <p className="text-caption">Caption</p>
          </div>
        </Section>

        {/* ---------------- COLORS ---------------- */}
        <Section title="Paleta" description="Primario, acento y semánticos.">
          <Row label="Primary">
            {PRIMARY_SHADES.map(({ shade, className }) => (
              <div key={shade} className="flex flex-col items-center gap-1">
                <span className={`h-8 w-8 rounded-md ring-1 ring-black/5 ${className}`} />
                <span className="text-caption text-surface-500 dark:text-surface-400">{shade}</span>
              </div>
            ))}
          </Row>
          <Row label="Semantic">
            <span className="h-8 w-8 rounded-md bg-success-500" title="success" />
            <span className="h-8 w-8 rounded-md bg-warning-500" title="warning" />
            <span className="h-8 w-8 rounded-md bg-error-500" title="error" />
            <span className="h-8 w-8 rounded-md bg-info-500" title="info" />
            <span className="h-8 w-8 rounded-md bg-accent-500" title="accent" />
          </Row>
        </Section>

        <Card variant="glass">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-primary-600" />
            <p className="text-body-sm text-surface-700 dark:text-surface-200">
              Este storybook está disponible solo en desarrollo en{' '}
              <code className="rounded bg-surface-200/70 px-1 py-0.5 text-caption dark:bg-surface-800">/dev/components</code>.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
