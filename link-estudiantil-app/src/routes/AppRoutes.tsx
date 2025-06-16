// src/routes/AppRoutes.tsx

import { BrowserRouter, Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Register from "../pages/Registro";

import { EstudianteRoutes } from "../pages/features/estudiante/routes";
import { ConsejeroRoutes } from "../pages/features/consejero/routes";
import { CoordinadorRoutes } from "../pages/features/coordinador/routes";

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />

        {/* Rutas estudiante */}
        <Route path="/*" element={<EstudianteRoutes />} />

        {/* Rutas consejero */}
        <Route path="/consejero/*" element={<ConsejeroRoutes />} />

        {/* Rutas coordinador */}
        <Route path="/coordinador/*" element={<CoordinadorRoutes />} />

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
