import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"

export default function Home() {
  const [actividades, setActividades] = useState<any[]>([])
  const [showMenu, setShowMenu] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate("/")
  }

  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase
        .from("Actividades")
        .select("*")
        .eq("estado", "aprobada")
        .eq("publicar_en_home", true)
        .order("fecha", { ascending: true })
        .limit(3)

      if (!error) setActividades(data)
    }

    fetchActividades()
  }, [])

  return (
    <div className="bg-white min-h-screen font-sans">
      {/* Navbar */}
      <Navbar />

      {/* Hero principal */}
      <header className="relative bg-cover bg-center h-[500px]" style={{ backgroundImage: `url('/banner.jpg')` }}>
        <div className="bg-black/60 w-full h-full flex items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Conecta con tu Carrera</h1>
            <p className="text-lg md:text-xl mb-6">Descubre actividades, talleres y oportunidades para participar en DUOC UC.</p>
            <button onClick={() => navigate("/eventos")} className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded text-white font-semibold">
              Ver Actividades
            </button>
          </div>
        </div>
      </header>

      {/* Accesos Rápidos */}
      <section className="py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        {[
          { titulo: "Actividades", desc: "Participa en eventos aprobados", icon: "🌟", link: "/eventos" },
          { titulo: "Fondos", desc: "Conoce las iniciativas apoyadas", icon: "💰", link: "/fondos" },
          { titulo: "Propuestas", desc: "Envía tus ideas a tu consejero", icon: "📝", link: "/requerimiento" },
          { titulo: "Inscripciones", desc: "Gestiona tus actividades inscritas", icon: "✅", link: "/mis-eventos" },
        ].map((item, i) => (
          <div key={i} onClick={() => navigate(item.link)} className="bg-blue-100 hover:bg-blue-200 p-6 rounded-lg shadow cursor-pointer">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="text-lg font-bold mb-1">{item.titulo}</h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Actividades Destacadas */}
      <section className="py-10 px-6">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">Actividades Destacadas</h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actividades.length > 0 ? (
            actividades.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/actividad/${a.id}`)}
                className="bg-white shadow-md rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition"
              >
                <h3 className="text-lg font-semibold text-blue-800 mb-1">{a.titulo}</h3>
                <p className="text-sm text-gray-600 mb-2">{a.descripcion}</p>
                <p className="text-sm text-gray-500">Fecha: {a.fecha}</p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">No hay actividades publicadas aún.</p>
          )}
        </div>
      </section>
    </div>
  )
}
