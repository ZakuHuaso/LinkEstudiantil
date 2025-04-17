import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/Login"
import Register from "../pages/register"
import Estudiante from "../pages/Estudiante"
import Consejero from "../pages/Consejero"
import Coordinador from "../pages/Coordinador"
import Home from "../pages/Home"
import EnviarRequerimiento from "../pages/EnviarRequerimiento"
import ProtectedRoute from "../components/ProtectedRoute"

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/requerimiento" element={<EnviarRequerimiento />} />

        <Route
          path="/estudiante"
          element={
            <ProtectedRoute allowedRoles={["estudiante"]}>
              <Estudiante />
            </ProtectedRoute>
          }
        />
        <Route
          path="/consejero"
          element={
            <ProtectedRoute allowedRoles={["consejero"]}>
              <Consejero />
            </ProtectedRoute>
          }
        />
        <Route
          path="/coordinador"
          element={
            <ProtectedRoute allowedRoles={["coordinador"]}>
              <Coordinador />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  )
}
