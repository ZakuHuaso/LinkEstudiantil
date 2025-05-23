import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

type Actividad = {
  id: string
  titulo: string
  descripcion: string
  fecha: string
  hora: string
  lugar: string
  imagen_url: string | null  // ruta firmada o null
}

export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase
        .from("Actividades")
        .select("id, titulo, descripcion, fecha, hora, lugar, imagen_url")
        .eq("estado", "aprobada")
        .order("fecha", { ascending: true })

      if (error || !data) {
        console.error("Error fetching actividades:", error)
        setLoading(false)
        return
      }

      // Generar Signed URLs (solo path dentro del bucket)
      const conSignedUrls = await Promise.all(
        data.map(async (act) => {
          if (!act.imagen_url) return { ...act, imagen_url: null }

          const afterBucket = act.imagen_url
            .split("/object/sign/actividades/")[1]
          const pathInBucket = afterBucket.split("?")[0]

          try {
            const { data: signedData, error: signErr } = await supabase
              .storage
              .from("actividades")
              .createSignedUrl(pathInBucket, 300)
            if (signErr) throw signErr
            return { ...act, imagen_url: signedData.signedUrl }
          } catch {
            console.error("No pude firmar URL:", act.imagen_url)
            return { ...act, imagen_url: null }
          }
        })
      )

      setActividades(conSignedUrls)
      setLoading(false)
    }

    fetchActividades()
  }, [])

  if (loading) return <p>Cargando actividades…</p>
  if (actividades.length === 0) return <p>No hay actividades.</p>

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 p-6">
      {actividades.map((a) => (
        <Link 
          key={a.id}
          to={`/actividad/${a.id}`}
          className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
        >
          {a.imagen_url ? (
            <img
              src={a.imagen_url}
              alt={a.titulo}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500">Sin imagen</span>
            </div>
          )}
          <div className="p-4">
            <h2 className="text-xl font-semibold text-blue-800">{a.titulo}</h2>
            <p className="text-gray-700 my-2 line-clamp-3">{a.descripcion}</p>
            <p className="text-sm text-gray-500">
              {a.fecha} • {a.hora}
            </p>
            <p className="text-sm text-gray-500">{a.lugar}</p>
            <span className="mt-3 inline-block text-blue-600 hover:underline">
              Ver detalle →
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
