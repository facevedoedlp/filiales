import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import FilialesList from './pages/Filiales/FilialesList';
import FilialesMap from './pages/Filiales/FilialesMap';
import FilialDetailPage from './pages/Filiales/FilialDetailPage';
import IntegrantesList from './pages/Integrantes/IntegrantesList';
import IntegranteDetailPage from './pages/Integrantes/IntegranteDetailPage';
import AccionesList from './pages/Acciones/AccionesList';
import AccionNew from './pages/Acciones/AccionNew';
import AccionDetailPage from './pages/Acciones/AccionDetailPage';
import EntradasList from './pages/Entradas/EntradasList';
import EntradaNew from './pages/Entradas/EntradaNew';
import EntradasApproval from './pages/Entradas/EntradasApproval';
import ForoHome from './pages/Foro/ForoHome';
import CategoriaPage from './pages/Foro/CategoriaPage';
import HiloPage from './pages/Foro/HiloPage';
import HiloNew from './pages/Foro/HiloNew';
import Perfil from './pages/Perfil';
import { Layout } from './components/layout/Layout';
import { useAuthStore } from './store/authStore';
import { ROLES } from './utils/constants';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user } = useAuthStore((state) => ({
    isAuthenticated: state.isAuthenticated,
    user: state.user,
  }));

  // console.log('[ProtectedRoute] isAuthenticated:', isAuthenticated, 'requiredRole:', requiredRole, 'userRole:', user?.rol);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.rol !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return children ?? <Outlet />;
};

const LoginRoute = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // console.log('[LoginRoute] isAuthenticated:', isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Login />;
};

const NotFoundRedirect = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const target = isAuthenticated ? '/dashboard' : '/login';

  // console.log('[NotFoundRedirect] isAuthenticated:', isAuthenticated, 'redirectingTo:', target);

  return <Navigate to={target} replace />;
};

const App = () => {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/login" element={<LoginRoute />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="filiales">
              <Route index element={<FilialesList />} />
              <Route path="mapa" element={<FilialesMap />} />
              <Route path=":id" element={<FilialDetailPage />} />
            </Route>
            <Route path="integrantes">
              <Route index element={<IntegrantesList />} />
              <Route path=":id" element={<IntegranteDetailPage />} />
            </Route>
            <Route path="acciones">
              <Route index element={<AccionesList />} />
              <Route
                path="nueva"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <AccionNew />
                  </ProtectedRoute>
                }
              />
              <Route path=":id" element={<AccionDetailPage />} />
            </Route>
            <Route path="entradas">
              <Route index element={<EntradasList />} />
              <Route path="nueva" element={<EntradaNew />} />
              <Route
                path="aprobar"
                element={
                  <ProtectedRoute requiredRole={ROLES.ADMIN}>
                    <EntradasApproval />
                  </ProtectedRoute>
                }
              />
            </Route>
            <Route path="foro">
              <Route index element={<ForoHome />} />
              <Route path="categoria/:slug" element={<CategoriaPage />} />
              <Route path="hilo/:id" element={<HiloPage />} />
              <Route path="nuevo" element={<HiloNew />} />
            </Route>
            <Route path="perfil" element={<Perfil />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
