import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "../pages/login"
import Register from "../pages/register"
export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/estudiante" element={<div>Home Estudiante</div>} />
        <Route path="/consejero" element={<div>Dashboard Consejero</div>} />
        <Route path="/coordinador" element={<div>Panel Coordinador</div>} />
      </Routes>
    </BrowserRouter>
  )
}
