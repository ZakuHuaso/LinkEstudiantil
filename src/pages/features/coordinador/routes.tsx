import { Route, Routes, Navigate } from "react-router-dom";

import CoordinadorLayout from "./layout/CoordinadorLayout";
import CoordinadorDashboard from "./pages/CoordinadorDashboard";
import Actividades from "./pages/Actividades";
import RevisarPropuestas from "./pages/RevisarPropuestas";
import HistorialChat from "./pages/HistorialChats";
import Consejeros from "./pages/Consejeros";

import Chat from "./pages/Chat";
export function CoordinadorRoutes() {
  return (
    <Routes>
      <Route path="/" element={<CoordinadorLayout />}>
        <Route index element={<CoordinadorDashboard />} />
        <Route path="actividades" element={<Actividades />} />
        <Route path="consejeros" element={<Consejeros />} />
        <Route path="revisar-propuestas" element={<RevisarPropuestas />} />
        <Route path="Historial-chats" element={<HistorialChat />} />
        <Route path="Chats/:id" element={<Chat />} />
        <Route path="Chats" element={<Chat />} />
      </Route>
      <Route path="*" element={<Navigate to="/coordinador" replace />} />
    </Routes>
  );
}
