import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

export default function Actividades() {
  const [actividades, setActividades] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase
        .from("Actividades") // usa minúscula
        .select("*")
        .eq("estado", "aprobada")
        .order("fecha", { ascending: true })

      if (!error) setActividades(data || [])
      setLoading(false)
    }

    fetchActividades()
  }, [])

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-blue-900 text-center mb-6">Todas las Actividades</h1>

      {loading ? (
        <p className="text-center text-gray-500">Cargando actividades...</p>
      ) : actividades.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actividades.map((a) => (
            <div key={a.id} className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition">
              <h2 className="text-xl font-semibold text-blue-800">{a.titulo}</h2>
              <p className="text-sm text-gray-700 my-2">{a.descripcion}</p>
              <p className="text-sm text-gray-500">Fecha: {a.fecha}</p>
              {/* Aquí podrías poner un botón para ver detalle o inscribirse */}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No hay actividades disponibles por ahora.</p>
      )}
    </div>
  )
}
