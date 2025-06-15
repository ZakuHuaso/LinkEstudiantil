// src/feature/consejero/routes.tsx

import { Route, Routes, Navigate } from "react-router-dom";

import ConsejeroLayout from "./layout/ConsejeroLayout";
import RequerimientosRecibidos from "./pages/RequerimientosRecibidos";
import PerfilConsejero from "./pages/PerfilConsejero";
import ConsejeroDashboard from "./pages/ConsejeroDashboard";
import CrearPropuesta from "./pages/CrearPropuesta";
import MisPropuestas from "./pages/MisPropuestas";
import Actividades from "./pages/Actividades";
import ChatInboxConsejero from "./pages/ChatInboxConsejero";
import ChatPropuestaConsejero from "./pages/ChatPropuestaConsejero";
export function ConsejeroRoutes() {
    return (
        <Routes>
        <Route path="/" element={<ConsejeroLayout />}>
            <Route index element={<ConsejeroDashboard />} />
            <Route path="requerimientos-recibidos" element={<RequerimientosRecibidos />} />
            <Route path="crear-propuesta" element={<CrearPropuesta />} />
            <Route path="mis-propuestas" element={<MisPropuestas />} />
            <Route path="actividades" element={<Actividades />} />
            <Route path="perfil" element={<PerfilConsejero />} />
            <Route path="historial-chats" element={<ChatInboxConsejero />} />
            <Route path="chats/:id" element={<ChatPropuestaConsejero />} />
            <Route path="chats" element={<ChatPropuestaConsejero />} />
        </Route>
        <Route path="*" element={<Navigate to="/consejero" replace />} />
        </Routes>
    );
}
