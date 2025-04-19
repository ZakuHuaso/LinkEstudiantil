import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function ActividadDetalle() {
  const { id } = useParams()
  const [actividad, setActividad] = useState<any>(null)
  const [inscrito, setInscrito] = useState(false)
  const [cargando, setCargando] = useState(true)
  const [usuarioId, setUsuarioId] = useState("")

  useEffect(() => {
    const obtenerDatos = async () => {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData.user?.id
      setUsuarioId(userId)

      // Obtener actividad
      const { data, error } = await supabase
        .from("Actividades")
        .select("*")
        .eq("id", id)
        .single()

      if (!error) setActividad(data)

      // Verificar si ya está inscrito
      const { data: yaInscrito } = await supabase
        .from("Inscripciones")
        .select("id")
        .eq("alumno_id", userId)
        .eq("actividad_id", id)

      setInscrito(yaInscrito && yaInscrito.length > 0)
      setCargando(false)
    }

    obtenerDatos()
  }, [id])

  const handleInscripcion = async () => {
    const { error } = await supabase.from("Inscripciones").insert([
      {
        alumno_id: usuarioId,
        actividad_id: id,
      },
    ])

    if (!error) {
      setInscrito(true)
      alert("✅ Te has inscrito correctamente.")
    } else {
      alert("❌ Ocurrió un error al inscribirte.")
    }
  }

  if (cargando) return <p className="text-center mt-10">Cargando actividad...</p>

  if (!actividad) return <p className="text-center mt-10 text-red-500">Actividad no encontrada</p>

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-4 text-blue-900">{actividad.titulo}</h1>
      <p className="mb-3 text-gray-700">{actividad.descripcion}</p>
      <p className="mb-1">📅 Fecha: {actividad.fecha}</p>
      <p className="mb-1">🕒 Hora: {actividad.hora}</p>
      <p className="mb-4">📍 Lugar: {actividad.lugar}</p>

      {inscrito ? (
        <p className="text-green-600 font-semibold">Ya estás inscrito en esta actividad 🎉</p>
      ) : (
        <button
          onClick={handleInscripcion}
          className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800 transition"
        >
          Inscribirme
        </button>
      )}
    </div>
  )
}
