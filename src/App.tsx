import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { UIProvider } from './context/UIContext';
import AppShell from './components/layout/AppShell';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { Toaster } from 'react-hot-toast';

// Auth routes
import LoginPage from './pages/Auth/LoginPage';
import RegisterPage from './pages/Auth/RegisterPage';
import ForgotPasswordPage from './pages/Auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/Auth/ResetPasswordPage';

// Code-split app routes
const DashboardPage = lazy(() => import('./pages/Dashboard/DashboardPage'));
const SalesPage = lazy(() => import('./pages/Sales/SalesPage'));
const InventoryPage = lazy(() => import('./pages/Inventory/InventoryPage'));
const PayrollPage = lazy(() => import('./pages/Payroll/PayrollPage'));
const ExpensesPage = lazy(() => import('./pages/Expenses/ExpensesPage'));
const CustomersPage = lazy(() => import('./pages/Customers/CustomersPage'));
const SuppliersPage = lazy(() => import('./pages/Suppliers/SuppliersPage'));
const SettingsPage = lazy(() => import('./pages/Settings/SettingsPage'));

// A simple fallback for lazy loaded components
const SuspenseFallback = () => (
  <div className="flex h-full items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
  </div>
);

const router = createBrowserRouter([
  // Public Auth Routes
  { path: '/login', element: <LoginPage /> },
  { path: '/register', element: <RegisterPage /> },
  { path: '/forgot-password', element: <ForgotPasswordPage /> },
  { path: '/reset-password/:token', element: <ResetPasswordPage /> },
  
  // Protected Routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppShell />,
        children: [
          { path: '/', element: <Suspense fallback={<SuspenseFallback />}><DashboardPage /></Suspense> },
          { path: '/sales', element: <Suspense fallback={<SuspenseFallback />}><SalesPage /></Suspense> },
          { path: '/inventory', element: <Suspense fallback={<SuspenseFallback />}><InventoryPage /></Suspense> },
          { path: '/payroll', element: <Suspense fallback={<SuspenseFallback />}><PayrollPage /></Suspense> },
          { path: '/expenses', element: <Suspense fallback={<SuspenseFallback />}><ExpensesPage /></Suspense> },
          { path: '/customers', element: <Suspense fallback={<SuspenseFallback />}><CustomersPage /></Suspense> },
          { path: '/suppliers', element: <Suspense fallback={<SuspenseFallback />}><SuppliersPage /></Suspense> },
          { path: '/settings', element: <Suspense fallback={<SuspenseFallback />}><SettingsPage /></Suspense> },
        ],
      }
    ],
  },
]);

export default function App() {
  return (
    <AuthProvider>
      <UIProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <RouterProvider router={router} />
      </UIProvider>
    </AuthProvider>
  );
}
