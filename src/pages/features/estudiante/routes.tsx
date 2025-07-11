// src/features/estudiante/routes.tsx

import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import EnviarRequerimiento from "./pages/EnviarRequerimiento";
import ActividadDetalle from "./pages/ActividadDetalle";
import Actividades from "./pages/Actividades";
import Fondos from "./pages/Fondos";
import MisInscripciones from "./pages/MisInscripciones";
import Notificaciones from "../../Notificaciones";
import PerfilConsejeroAlumno from "../../../components/PerfilConsejeroAlumno";
export function EstudianteRoutes() {
  return (
    <Routes>
      <Route path="/home" element={<Home />} />
      <Route path="/requerimiento" element={<EnviarRequerimiento />} />
      <Route path="/actividad/:id" element={<ActividadDetalle />} />
      <Route path="/fondos" element={<Fondos />} />
      <Route path="/actividades" element={<Actividades />} />
      <Route path="/mis-inscripciones" element={<MisInscripciones />} />
      <Route path="/notificaciones" element={<Notificaciones/>} />
      <Route path="/ver-consejeros" element={<PerfilConsejeroAlumno/>} />
    </Routes>
  );
}
