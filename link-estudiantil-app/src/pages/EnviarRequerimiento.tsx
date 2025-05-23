import { useState, useEffect } from "react"
import { supabase } from "../lib/supabaseClient"

export default function EnviarRequerimiento() {
  const [tipo, setTipo] = useState("")
  const [descripcion, setDescripcion] = useState("")
  const [imagen, setImagen] = useState<File | null>(null)

  const [consejero, setConsejero] = useState<{ id: string; nombre: string } | null>(null)
  const [error, setError] = useState<string>("")
  const [success, setSuccess] = useState<string>("")

  useEffect(() => {
    const obtenerConsejero = async () => {
      // 1) Obtener usuario
      const { data: authData, error: authError } = await supabase.auth.getUser()
      if (authError || !authData.user) {
        setError("No has iniciado sesión.")
        return
      }
      const userId = authData.user.id

      // 2) Leer carrera_id del alumno
      const { data: alumno, error: alumnoError } = await supabase
        .from("alumnos")
        .select("carrera_id")
        .eq("id", userId)
        .single()

      if (alumnoError || !alumno) {
        console.error("Error al traer alumno:", alumnoError)
        setError("No se encontró tu perfil de alumno.")
        return
      }
      const carreraId = alumno.carrera_id

      // 3) (Opcional) Leer nombre de la carrera si quieres mostrarlo
      // const { data: carrera, error: carreraError } = await supabase
      //   .from("carreras")
      //   .select("nombre")
      //   .eq("id", carreraId)
      //   .single()

      // 4) Buscar consejero filtrando por carreras_id
      const { data: consejeros, error: consejeroError } = await supabase
        .from("consejeros")
        .select("id, nombre")
        .eq("carrera_id", carreraId)
        .limit(1)

      if (consejeroError) {
        console.error("Error al traer consejero:", consejeroError)
        setError("Error buscando consejero.")
        return
      }
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

    const { data: authData, error: authError } = await supabase.auth.getUser()
    if (authError || !authData.user) {
      setError("No has iniciado sesión.")
      return
    }
    if (!consejero) {
      setError("Aún no hay consejero asignado.")
      return
    }

    // 5) Subir imagen
    let imagenUrl: string | null = null
    if (imagen) {
      const fileName = `${authData.user.id}-${Date.now()}`
      const { error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(`requerimientos/${fileName}`, imagen)
      if (uploadError) {
        console.error("Error uploading image:", uploadError)
        setError("Error al subir la imagen.")
        return
      }
      const { data: urlData } = supabase.storage
        .from("imagenes")
        .getPublicUrl(`requerimientos/${fileName}`)
      imagenUrl = urlData.publicUrl
    }

    // 6) Insertar requerimiento apuntando al consejero correcto
    const { error: insertError } = await supabase
      .from("requerimientos")
      .insert([
        {
          alumno_id: authData.user.id,
          tipo,
          descripcion,
          imagen_url: imagenUrl,
          consejero_id: consejero.id,
          fecha_envio: new Date().toISOString(),
        },
      ])

    if (insertError) {
      console.error("Error insertando requerimiento:", insertError)
      setError("Error al enviar el requerimiento.")
    } else {
      setSuccess("Requerimiento enviado con éxito.")
      setTipo("")
      setDescripcion("")
      setImagen(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Enviar Requerimiento o Idea</h2>

      {error && <p className="text-red-600 mb-4">{error}</p>}
      {success && <p className="text-green-600 mb-4">{success}</p>}

      {consejero && (
        <p className="mb-4">
          Tu requerimiento irá a: <strong>{consejero.nombre}</strong>
        </p>
      )}

      <form onSubmit={handleSubmit}>
        <label className="block mb-2">Tipo</label>
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

        <label className="block mb-2">Descripción</label>
        <textarea
          className="w-full mb-4 p-2 border rounded"
          rows={4}
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          required
        />

        <label className="block mb-2">Imagen (opcional)</label>
        <input
          type="file"
          accept="image/*"
          className="mb-4"
          onChange={(e) => setImagen(e.target.files?.[0] || null)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Enviar Requerimiento
        </button>
      </form>
    </div>
  )
}