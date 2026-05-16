import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { MenuManagement } from './pages/MenuManagement';
import { Order } from './pages/Order';
import { Report } from './pages/Report';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { History } from './pages/History';
import { PublicMenu } from './pages/PublicMenu';
import { PromoManagement } from './pages/PromoManagement';
import { Stock } from './pages/Stock';
import { Margins } from './pages/Margins';

export const router = createBrowserRouter([
  {
    path: '/menu/:tenantId',
    element: <PublicMenu />,
  },
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,       element: <Login /> },
      { path: 'login',     element: <Login /> },
      { path: 'register',  element: <Register /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'menu',      element: <MenuManagement /> },
      { path: 'order',     element: <Order /> },
      { path: 'reports',   element: <Report /> },
      { path: 'settings',  element: <Settings /> },
      { path: 'history',   element: <History /> },
      { path: 'promos',    element: <PromoManagement /> },
      { path: 'stock',     element: <Stock /> },
      { path: 'margins',   element: <Margins /> },
      { path: '*',         element: <NotFound /> },
    ],
  },
]);
