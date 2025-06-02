import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Registro";

import Home from "../pages/Home";
import EnviarRequerimiento from "../pages/EnviarRequerimiento";
import ActividadDetalle from "../pages/ActividadDetalle";
import Actividades from "../pages/Actividades";
import Fondos from "../pages/Fondos";
import MisInscripciones from "../pages/MisInscripciones";
import Notificaciones from "../pages/Notificaciones";

import { ConsejeroRoutes } from "../pages/features/consejero/routes";

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
        <Route path="/fondos" element={<Fondos />} />
        <Route path="/eventos" element={<Actividades />} />
        <Route path="/mis-eventos" element={<MisInscripciones />} />
        <Route path="/notificaciones" element={<Notificaciones />} />

        {/* Rutas del consejero */}
        {/* Simplemente renderizamos las rutas específicas para consejero */}
        <Route path="/consejero/*" element={<ConsejeroRoutes />} />

        {/* Ruta 404 */}
        <Route
          path="*"
          element={
            <p className="text-center text-red-500 mt-20 text-xl">
              404: Página no encontrada
            </p>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
