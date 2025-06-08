import { Route, Routes, Navigate } from "react-router-dom";

import CoordinadorLayout from "../../../components/CoordinadorLayout";
import CoordinadorDashboard from "./pages/CoordinadorDashboard";
import PerfilCoordinador from "./pages/PerfilCoordinador";

const Actividades = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Actividades</h1>
    <p>Gestión de actividades organizadas por la comunidad.</p>
  </div>
);

const Talleres = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Talleres</h1>
    <p>Administración de talleres educativos o prácticos.</p>
  </div>
);

const Eventos = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold">Eventos</h1>
    <p>Organización y seguimiento de eventos institucionales.</p>
  </div>
);

const RevisarPropuestas = () => (
  <div className="p-6">
    <h1>Revisión de Propuestas</h1>
    <p>Visualización y validación de propuestas enviadas por consejeros.</p>
  </div>
);

const Asistencia = () => (
  <div className="p-6">
    <h1>Asistencia</h1>
    <p>Control de asistencia a eventos y talleres.</p>
  </div>
);

const FondosConcursables = () => (
  <div className="p-6">
    <h1>Fondos Concursables</h1>
    <p>Gestión de fondos y postulaciones.</p>
  </div>
);

const Estadisticas = () => (
  <div className="p-6">
    <h1>Estadísticas</h1>
    <p>Visualización de KPIs, métricas y análisis del sistema.</p>
  </div>
);

export function CoordinadorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CoordinadorLayout />}>
        <Route index element={<CoordinadorDashboard />} />
        <Route path="actividades" element={<Actividades />} />
        <Route path="talleres" element={<Talleres />} />
        <Route path="eventos" element={<Eventos />} />
        <Route path="revisar-propuestas" element={<RevisarPropuestas />} />
        <Route path="asistencia" element={<Asistencia />} />
        <Route path="fondos-concursables" element={<FondosConcursables />} />
        <Route path="estadisticas" element={<Estadisticas />} />
        <Route path="perfil" element={<PerfilCoordinador />} />
      </Route>
      <Route path="*" element={<Navigate to="/coordinador" replace />} />
    </Routes>
  );
}
