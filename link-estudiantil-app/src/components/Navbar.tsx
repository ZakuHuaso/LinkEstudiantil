import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function Navbar() {
  const [rol, setRol] = useState<string | null>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [notificaciones, setNotificaciones] = useState<number>(0)
  const navigate = useNavigate()

  useEffect(() => {
    const fetchRol = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const tablas = [
        { nombre: "alumnos", rol: "estudiante" },
        { nombre: "consejeros", rol: "consejero" },
        { nombre: "coordinadores", rol: "coordinador" },
      ]

      for (const t of tablas) {
        const { data } = await supabase
          .from(t.nombre)
          .select("id")
          .eq("id", user.id)
          .single()
        if (data) {
          setRol(t.rol)
          break
        }
      }
    }
    fetchRol()
  }, [])

  useEffect(() => {
    const fetchNotificaciones = async () => {
      const userId = (await supabase.auth.getUser()).data.user?.id
      if (!userId) return
      const { data, error } = await supabase
        .from("notificaciones")
        .select("id")
        .eq("receptor_id", userId)
        .eq("leido", false)
      if (!error && data) setNotificaciones(data.length)
    }
    fetchNotificaciones()
  }, [rol])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  const botones = {
    estudiante: [
      { label: "Inicio", path: "/home" },
      { label: `Notificaciones (${notificaciones})`, path: "/notificaciones" },
    ],
    consejero: [
      { label: "Inicio", path: "/consejero" },
      { label: "Requerimientos Recibidos", path: "/requerimientos-recibidos" },
      { label: "Crear Propuesta", path: "/crear-propuesta" },
      { label: "Mis Propuestas", path: "/mis-propuestas" },
      { label: `Notificaciones (${notificaciones})`, path: "/notificaciones" },
    ],
    coordinador: [
      { label: "Inicio", path: "/coordinador" },
      { label: "Ver Propuestas", path: "/ver-propuestas" },
      { label: "Aprobar Propuestas", path: "/aprobar-propuestas" },
      { label: "Crear Actividad", path: "/crear-actividad" },
      { label: "Consejeros y Actividades", path: "/listar-consejeros" },
      { label: `Notificaciones (${notificaciones})`, path: "/notificaciones" },
    ],
  }

  return (
    <nav className="bg-blue-900 text-white py-4 px-6 flex justify-between items-center">
      <h1 className="text-lg font-semibold">Link Estudiantil DUOC UC</h1>
      <div className="flex items-center gap-4 relative">
        {rol && botones[rol as keyof typeof botones].map((btn, i) => (
          <button
            key={i}
            onClick={() => navigate(btn.path)}
            className="hover:underline"
          >
            {btn.label}
          </button>
        ))}

        {/* Menú desplegable */}
        <img
          src="/avatar.png"
          alt="Avatar"
          className="w-8 h-8 rounded-full cursor-pointer"
          onClick={() => setShowMenu(!showMenu)}
        />
        {showMenu && (
          <div className="absolute right-0 top-12 w-48 bg-white border rounded shadow text-black z-50">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={() => navigate("/perfil")}
            >
              Perfil
            </button>
            <hr />
            <button
              className="w-full px-4 py-2 text-left text-red-600 hover:bg-red-100"
              onClick={handleLogout}
            >
              Cerrar Sesión
            </button>
          </div>
        )}
      </div>
    </nav>
  )
}
