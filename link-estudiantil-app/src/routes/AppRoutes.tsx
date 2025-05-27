import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/Registro"

import Home from "../pages/Home"
import EnviarRequerimiento from "../pages/EnviarRequerimiento"
import ActividadDetalle from "../pages/ActividadDetalle"
import Actividades from "../pages/Actividades"
import MisInscripciones from "../pages/MisInscripciones"
import RequerimientosRecibidos from "../pages/RequerimientosRecibidos"
import Notificaciones from "../pages/Notificaciones"



export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/requerimiento" element={<EnviarRequerimiento />} />
        <Route path="/actividad/:id" element={<ActividadDetalle />} />
        <Route path="/eventos" element={<Actividades />} />
        <Route path="/mis-eventos" element={<MisInscripciones />} />
        <Route path="/requerimientos-recibidos" element={<RequerimientosRecibidos />} />
        <Route path="/notificaciones" element={<Notificaciones />} />
        
      </Routes>
    </BrowserRouter>
  )
}
