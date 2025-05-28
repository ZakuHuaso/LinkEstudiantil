import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login";
import Register from "../pages/Registro";

import Home from "../pages/Home";
import EnviarRequerimiento from "../pages/EnviarRequerimiento";
import ActividadDetalle from "../pages/ActividadDetalle";
import Actividades from "../pages/Actividades";
import MisInscripciones from "../pages/MisInscripciones";
import Notificaciones from "../pages/Notificaciones";

import ConsejeroLayout from "../components/ConsejeroLayout";
import RequerimientosRecibidos from "../pages/RequerimientosRecibidos";
import PerfilConsejero from "../pages/PerfilConsejero";

const ConsejeroDashboard = () => <div className="p-6"><h1>Bienvenido Consejero!</h1><p>Este es el dashboard principal.</p></div>;
const CrearPropuesta = () => <div className="p-6"><h1>Crear Nueva Propuesta</h1><p>Aquí podrás crear nuevas propuestas.</p></div>;
const MisPropuestas = () => <div className="p-6"><h1>Mis Propuestas</h1><p>Aquí verás tus propuestas creadas.</p></div>;
const Estadisticas = () => <div className="p-6"><h1>Estadísticas</h1><p>Gráficos y métricas sobre requerimientos y propuestas.</p></div>;



export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas o de estudiante */}
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/requerimiento" element={<EnviarRequerimiento />} />
        <Route path="/actividad/:id" element={<ActividadDetalle />} />
        <Route path="/eventos" element={<Actividades />} />
        <Route path="/mis-eventos" element={<MisInscripciones />} />
        <Route path="/notificaciones" element={<Notificaciones />} />

        {/* Rutas del consejero*/}
        <Route path="/consejero" element={<Navigate to="/consejero/dashboard" replace />} />
        
        
        <Route element={<ConsejeroLayout />}>
          <Route path="/consejero/dashboard" element={<ConsejeroDashboard />} />
          <Route path="/consejero/requerimientos" element={<RequerimientosRecibidos />} />
          <Route path="/consejero/crear-propuesta" element={<CrearPropuesta />} />
          <Route path="/consejero/mis-propuestas" element={<MisPropuestas />} />
          <Route path="/consejero/estadisticas" element={<Estadisticas />} />
          <Route path="/consejero/perfil" element={<PerfilConsejero />} />
        </Route>

        <Route path="*" element={<p className="text-center text-red-500 mt-20 text-xl">404: Página no encontrada</p>} />
      </Routes>
    </BrowserRouter>
  );
}