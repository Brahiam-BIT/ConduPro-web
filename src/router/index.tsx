import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { Spinner } from '@/components/ui/Spinner';
import { ProtectedRoute } from './ProtectedRoute';
import { GuestRoute } from './GuestRoute';
import { RoleRoute } from './RoleRoute';
import { ROLES } from '@/constants/roles';
import { ROUTES } from '@/constants/routes';
import { AppShell } from '@/components/layout/AppShell';

const LandingPage = lazy(() => import('@/pages/landing/LandingPage'));
const LoginPage = lazy(() => import('@/pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage'));

const StudentDashboard = lazy(() => import('@/pages/student/StudentDashboard'));
const StudentSchedules = lazy(() => import('@/pages/student/StudentSchedules'));
const BookClass = lazy(() => import('@/pages/student/BookClass'));
const BookClassTheory = lazy(() => import('@/pages/student/BookClassTheory'));
const BookClassPractice = lazy(() => import('@/pages/student/BookClassPractice'));
const StudentLicenses = lazy(() => import('@/pages/student/StudentLicenses'));
const StudentStudyMaterials = lazy(() => import('@/pages/student/StudentStudyMaterials'));

const InstructorDashboard = lazy(() => import('@/pages/instructor/InstructorDashboard'));
const InstructorSchedules = lazy(() => import('@/pages/instructor/InstructorSchedules'));
const InstructorAvailability = lazy(() => import('@/pages/instructor/InstructorAvailability'));
const InstructorTheoryMaterials = lazy(() => import('@/pages/instructor/InstructorTheoryMaterials'));

const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const AdminUsers = lazy(() => import('@/pages/admin/AdminUsers'));
const AdminSchedules = lazy(() => import('@/pages/admin/AdminSchedules'));
const AdminVehicles = lazy(() => import('@/pages/admin/AdminVehicles'));
const AdminCourses = lazy(() => import('@/pages/admin/AdminCourses'));
const AdminReports = lazy(() => import('@/pages/admin/AdminReports'));

const NotFoundPage = lazy(() => import('@/pages/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('@/pages/UnauthorizedPage'));
const DevComponentsPage = lazy(() => import('@/pages/DevComponentsPage'));

function PageFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center text-primary-600">
      <Spinner size="lg" />
    </div>
  );
}

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageFallback />}>{children}</Suspense>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Lazy>
        <LandingPage />
      </Lazy>
    ),
  },
  {
    path: ROUTES.LOGIN,
    element: (
      <GuestRoute>
        <Lazy>
          <LoginPage />
        </Lazy>
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.REGISTER,
    element: (
      <GuestRoute>
        <Lazy>
          <RegisterPage />
        </Lazy>
      </GuestRoute>
    ),
  },
  {
    path: ROUTES.UNAUTHORIZED,
    element: (
      <Lazy>
        <UnauthorizedPage />
      </Lazy>
    ),
  },
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [
      {
        path: ROUTES.STUDENT.ROOT,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Navigate to={ROUTES.STUDENT.DASHBOARD} replace />
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.DASHBOARD,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <StudentDashboard />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.SCHEDULES,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <StudentSchedules />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.LICENSES,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <StudentLicenses />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.MATERIALS,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <StudentStudyMaterials />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.THEORY_CLASSES,
        element: <Navigate to={ROUTES.STUDENT.BOOK_THEORY} replace />,
      },
      {
        path: ROUTES.STUDENT.BOOK,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <BookClass />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.BOOK_THEORY,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <BookClassTheory />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.STUDENT.BOOK_PRACTICE,
        element: (
          <RoleRoute allow={[ROLES.STUDENT]}>
            <Lazy>
              <BookClassPractice />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.INSTRUCTOR.ROOT,
        element: (
          <RoleRoute allow={[ROLES.INSTRUCTOR]}>
            <Navigate to={ROUTES.INSTRUCTOR.DASHBOARD} replace />
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.INSTRUCTOR.DASHBOARD,
        element: (
          <RoleRoute allow={[ROLES.INSTRUCTOR]}>
            <Lazy>
              <InstructorDashboard />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.INSTRUCTOR.SCHEDULES,
        element: (
          <RoleRoute allow={[ROLES.INSTRUCTOR]}>
            <Lazy>
              <InstructorSchedules />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.INSTRUCTOR.AVAILABILITY,
        element: (
          <RoleRoute allow={[ROLES.INSTRUCTOR]}>
            <Lazy>
              <InstructorAvailability />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.INSTRUCTOR.MATERIALS,
        element: (
          <RoleRoute allow={[ROLES.INSTRUCTOR]}>
            <Lazy>
              <InstructorTheoryMaterials />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.ROOT,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.DASHBOARD,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Lazy>
              <AdminDashboard />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.USERS,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Lazy>
              <AdminUsers />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.SCHEDULES,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Lazy>
              <AdminSchedules />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.VEHICLES,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Lazy>
              <AdminVehicles />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.COURSES,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Lazy>
              <AdminCourses />
            </Lazy>
          </RoleRoute>
        ),
      },
      {
        path: ROUTES.ADMIN.REPORTS,
        element: (
          <RoleRoute allow={[ROLES.ADMIN]}>
            <Lazy>
              <AdminReports />
            </Lazy>
          </RoleRoute>
        ),
      },
    ],
  },
  // Storybook manual — only mounted in dev mode.
  ...(import.meta.env.DEV
    ? [
        {
          path: ROUTES.DEV.COMPONENTS,
          element: (
            <Lazy>
              <DevComponentsPage />
            </Lazy>
          ),
        },
      ]
    : []),
  {
    path: '*',
    element: (
      <Lazy>
        <NotFoundPage />
      </Lazy>
    ),
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
