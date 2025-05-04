import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

export default function EnviarRequerimiento() {
  const [tipo, setTipo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)
  const [consejero, setConsejero] = useState<any>(null)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    const obtenerConsejero = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
  
      if (!user) return setError("No has iniciado sesión")
  
      // Buscar la carrera del alumno
      const { data: alumno, error: alumnoError } = await supabase
        .from("alumnos")
        .select("carrera")
        .eq("id", user.id)
        .single()
  
      if (!alumno || alumnoError) {
        setError("No se encontró tu perfil.")
        return
      }
  
      console.log("✅ Carrera del alumno:", alumno.carrera)
  
      // Buscar el consejero de esa carrera (insensible a mayúsculas)
      const { data: consejeros, error: consejeroError } = await supabase
        .from("consejeros")
        .select("id, nombre, carrera")
        .ilike("carrera", alumno.carrera)
        .limit(1)
  
      console.log("🔍 Resultado consejeros:", consejeros)
      console.log("❗ Error al buscar consejero:", consejeroError)
  
      if (!consejeros || consejeros.length === 0) {
        setError("No se encontró un consejero para tu carrera.")
        return
      }
  
      setConsejero(consejeros[0])
    }
  
    obtenerConsejero()
  }, [])
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user || !consejero) return

    let imagenUrl = null

    if (imagen) {
      const fileName = `${user.id}-${Date.now()}`
      const { data, error } = await supabase.storage
        .from("imagenes")
        .upload(`requerimientos/${fileName}`, imagen)

      if (error) return setError("Error al subir imagen")

      const { data: publicUrl } = supabase.storage
        .from("imagenes")
        .getPublicUrl(`requerimientos/${fileName}`)

      imagenUrl = publicUrl.publicUrl
    }

    const { error: insertError } = await supabase.from("requerimientos").insert([
      {
        alumno_id: user.id,
        tipo,
        descripcion,
        imagen_url: imagenUrl,
        consejero_id: consejero.id,
        fecha_envio: new Date().toISOString() 
      },
    ])

    if (insertError) return setError("Error al enviar requerimiento")

    setSuccess("Requerimiento enviado con éxito")
    setTipo("")
    setDescripcion("")
    setImagen(null)
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Enviar Requerimiento o Idea</h2>

      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

      {consejero && (
        <p className="text-sm mb-4 text-gray-700">
          El requerimiento será enviado al consejero: <strong>{consejero.nombre}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2 text-sm font-medium">Tipo de requerimiento</label>
        <select
          className="w-full mb-4 p-2 border rounded"
          value={tipo}
          onChange={(e) => setTipo(e.target.value)}
          required
        >
          <option value="">Selecciona</option>
          <option value="Actividad">Actividad</option>
          <option value="Sugerencia">Sugerencia</option>
          <option value="Otro">Otro</option>
        </select>

        <label className="block mb-2 text-sm font-medium">Descripción</label>
        <textarea
          className="w-full mb-4 p-2 border rounded"
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        <label className="block mb-2 text-sm font-medium">Adjuntar imagen (opcional)</label>
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={(e) => setImagen(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Enviar Requerimiento
        </button>
      </form>
    </div>
  )
}
