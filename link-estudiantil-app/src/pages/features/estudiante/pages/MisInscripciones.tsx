import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"
import Navbar from "../../../../components/Navbar"
import StudentNav from "../components/NavbarEstudiante"
import Footer from "../../../../components/Footer"

export default function MisInscripciones() {
  const [actividades, setActividades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const fetchInscripciones = async () => {
    const { data: userData } = await supabase.auth.getUser()
    const userId = userData.user?.id
    if (!userId) return

    const { data, error } = await supabase
      .from("Inscripciones")
      .select(`
        id,
        actividad:actividad_id(
          id,
          titulo,
          descripcion,
          fecha,
          hora,
          lugar
        )
      `)
      .eq("alumno_id", userId)


      if (!error && data) {
        const actividadesMapeadas = data.map((i) => ({
          inscripcionId: i.id,
          ...i.actividad,
        }))
        setActividades(actividadesMapeadas)
      } else if (error) {
        console.error("Error al cargar inscripciones:", error)
      }
      setLoading(false)
    }

    fetchInscripciones()
  }, [])

  const handleDesinscribir = async (inscripcionId: string) => {
  if (!confirm("¿Seguro que quieres desinscribirte?")) return

  const { error } = await supabase
    .from("Inscripciones")
    .delete()
    .eq("id", inscripcionId)

  if (error) {
    console.error("Error desinscribiendo:", error)
    return
  }

  // filtramos por inscripcionId, no por a.id
  setActividades((prev) =>
    prev.filter((actividad) => actividad.inscripcionId !== inscripcionId)
  )
}

  return (
    <>
      <Navbar />
      <StudentNav />

      <div className="min-h-screen bg-gray-100 p-6">
        <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">
          Mis Inscripciones
        </h1>

        {loading ? (
          <p className="text-center text-gray-500">Cargando...</p>
        ) : actividades.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {actividades.map((a) => (
    <div
      key={a.inscripcionId}
      className="bg-white rounded-lg shadow hover:shadow-lg transition flex flex-col justify-between border border-gray-200"
    >
      <div className="p-5">
        <h2 className="text-xl font-semibold text-blue-800 mb-2 line-clamp-2">
          {a.titulo}
        </h2>

        <p className="text-sm text-gray-700 mb-3 line-clamp-3">
          {a.descripcion}
        </p>

        <div className="space-y-1 text-sm text-gray-600">
          <p>
            📅 Fecha:{" "}
            {new Date(a.fecha).toLocaleDateString("es-CL", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
          <p>🕒 Hora: {a.hora}</p>
          <p>📍 Lugar: {a.lugar}</p>
        </div>
      </div>

      <div className="p-5 border-t flex items-center justify-between">
        <button
          onClick={() => handleDesinscribir(a.inscripcionId)}
          className="text-sm bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
        >
          Desinscribirme
        </button>
      </div>
    </div>
  ))}
</div>
        ) : (
          <p className="text-center text-gray-500">
            No estás inscrito en ninguna actividad.
          </p>
        )}
      </div>

      <Footer />
    </>
  )
}
