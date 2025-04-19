import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

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
        .select("id, actividad:actividad_id(*)")
        .eq("alumno_id", userId)

      if (!error && data) {
        const actividadesMapeadas = data.map((i) => i.actividad)
        setActividades(actividadesMapeadas)
      }

      setLoading(false)
    }

    fetchInscripciones()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">Mis Inscripciones</h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando...</p>
      ) : actividades.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actividades.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-blue-800">{a.titulo}</h2>
              <p className="text-sm text-gray-700 my-2">{a.descripcion}</p>
              <p className="text-sm text-gray-500">Fecha: {a.fecha}</p>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No estás inscrito en ninguna actividad.</p>
      )}
    </div>
  )
}
