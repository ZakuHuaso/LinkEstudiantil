// src/feature/consejero/routes.tsx

import { Route, Routes, Navigate } from "react-router-dom";

import ConsejeroLayout from "./layout/ConsejeroLayout";
import RequerimientosRecibidos from "./pages/RequerimientosRecibidos";
import PerfilConsejero from "./pages/PerfilConsejero";
import ConsejeroDashboard from "./pages/ConsejeroDashboard";

const CrearPropuesta = () => (
  <div className="p-6">
    <h1>Crear Nueva Propuesta</h1>
    <p>Aquí podrás crear nuevas propuestas.</p>
  </div>
);

const MisPropuestas = () => (
  <div className="p-6">
    <h1>Mis Propuestas</h1>
    <p>Aquí verás tus propuestas creadas.</p>
  </div>
);

const Estadisticas = () => (
  <div className="p-6">
    <h1>Estadísticas</h1>
    <p>Gráficos y métricas sobre requerimientos y propuestas.</p>
  </div>
);

export function ConsejeroRoutes() {
    return (
        <Routes>
        <Route path="/" element={<ConsejeroLayout />}>
            <Route index element={<ConsejeroDashboard />} />
            <Route path="requerimientos-recibidos" element={<RequerimientosRecibidos />} />
            <Route path="crear-propuesta" element={<CrearPropuesta />} />
            <Route path="mis-propuestas" element={<MisPropuestas />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="perfil" element={<PerfilConsejero />} />
            
        </Route>
        <Route path="*" element={<Navigate to="/consejero" replace />} />
        </Routes>
    );
}
