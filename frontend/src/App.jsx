import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';


import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import FilialList from './pages/Filiales/FilialList.jsx';
import FilialForm from './pages/Filiales/FilialForm.jsx';
import FilialDetail from './pages/Filiales/FilialDetail.jsx';
import FilialRenovar from './pages/Filiales/FilialRenovar.jsx';
import IntegranteList from './pages/Integrantes/IntegranteList.jsx';
import IntegranteForm from './pages/Integrantes/IntegranteForm.jsx';
import IntegranteDetail from './pages/Integrantes/IntegranteDetail.jsx';
import AccionList from './pages/Acciones/AccionList.jsx';
import AccionForm from './pages/Acciones/AccionForm.jsx';
import AccionDetail from './pages/Acciones/AccionDetail.jsx';
import EntradasList from './pages/Entradas/EntradasList.jsx';
import EntradasForm from './pages/Entradas/EntradasForm.jsx';
import EntradasApproval from './pages/Entradas/EntradasApproval.jsx';
import ForoHome from './pages/Foro/ForoHome.jsx';
import ForoTemaForm from './pages/Foro/ForoTemaForm.jsx';
import ForoTemaDetail from './pages/Foro/ForoTemaDetail.jsx';
import NotificacionList from './pages/Notificaciones/NotificacionList.jsx';

function App() {

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
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

          <Route path="filiales">
            <Route index element={<FilialList />} />
            <Route path="nueva" element={<FilialForm />} />
            <Route path=":id" element={<FilialDetail />} />
            <Route path=":id/editar" element={<FilialForm />} />
            <Route path=":id/renovar" element={<FilialRenovar />} />
          </Route>

          <Route path="integrantes">
            <Route index element={<IntegranteList />} />
            <Route path="nuevo" element={<IntegranteForm />} />
            <Route path=":id" element={<IntegranteDetail />} />
            <Route path=":id/editar" element={<IntegranteForm />} />
          </Route>

          <Route path="acciones">
            <Route index element={<AccionList />} />
            <Route path="nueva" element={<AccionForm />} />
            <Route path=":id" element={<AccionDetail />} />
            <Route path=":id/editar" element={<AccionForm />} />
          </Route>

          <Route path="entradas">
            <Route index element={<EntradasList />} />
            <Route path="solicitar" element={<EntradasForm />} />
            <Route path="gestionar" element={<EntradasApproval />} />
          </Route>

          <Route path="foro">
            <Route index element={<ForoHome />} />
            <Route path="nuevo" element={<ForoTemaForm />} />
            <Route path="tema/:id" element={<ForoTemaDetail />} />
            <Route path="tema/:id/editar" element={<ForoTemaForm />} />
          </Route>

          <Route path="notificaciones" element={<NotificacionList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;