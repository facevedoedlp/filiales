import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/layout/Layout.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import FilialList from './pages/Filiales/FilialList.jsx';
import FilialDetail from './pages/Filiales/FilialDetail.jsx';
import FilialForm from './pages/Filiales/FilialForm.jsx';
import IntegranteList from './pages/Integrantes/IntegranteList.jsx';
import IntegranteForm from './pages/Integrantes/IntegranteForm.jsx';
import AccionList from './pages/Acciones/AccionList.jsx';
import AccionForm from './pages/Acciones/AccionForm.jsx';
import EntradasList from './pages/Entradas/EntradasList.jsx';
import EntradasForm from './pages/Entradas/EntradasForm.jsx';
import ForoHome from './pages/Foro/ForoHome.jsx';
import ForoTemaDetail from './pages/Foro/ForoTemaDetail.jsx';
import ForoTemaForm from './pages/Foro/ForoTemaForm.jsx';
import useAuth from './hooks/useAuth.js';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="filiales" element={<FilialList />} />
        <Route path="filiales/nueva" element={<FilialForm />} />
        <Route path="filiales/:id" element={<FilialDetail />} />
        <Route path="filiales/:id/editar" element={<FilialForm />} />
        <Route path="integrantes" element={<IntegranteList />} />
        <Route path="integrantes/nuevo" element={<IntegranteForm />} />
        <Route path="acciones" element={<AccionList />} />
        <Route path="acciones/nueva" element={<AccionForm />} />
        <Route path="entradas" element={<EntradasList />} />
        <Route path="entradas/nueva" element={<EntradasForm />} />
        <Route path="foro" element={<ForoHome />} />
        <Route path="foro/nuevo" element={<ForoTemaForm />} />
        <Route path="foro/:id" element={<ForoTemaDetail />} />
      </Route>
    </Routes>
  );
};

export default App;
