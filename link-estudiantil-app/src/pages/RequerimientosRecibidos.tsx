import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"

type Alumno = {
  id: string
  nombre: string
  correo: string
}

type RequerimientoRaw = {
  id: string
  tipo: string
  descripcion: string
  fecha_envio: string
  imagen_url?: string
  alumno_id: string
  estado: string      // nuevo
  respuesta?: string  // nuevo
}

type Requerimiento = {
  id: string
  tipo: string
  descripcion: string
  fecha_envio: string
  imagen_url?: string
  alumno?: Alumno
  estado: string
  respuesta?: string
}

export default function RequerimientosRecibidos() {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([])
  const [imagenSeleccionada, setImagenSeleccionada] = useState<{ url: string; loading: boolean } | null>(null)

  useEffect(() => {
    const fetchAll = async () => {
      // 1) usuario autenticado
      const { data: authData, error: userErr } = await supabase.auth.getUser()
      if (userErr || !authData.user) return

      // 2) consejero
      const { data: consejero, error: consejeroErr } = await supabase
        .from("consejeros")
        .select("id")
        .eq("correo", authData.user.email)
        .single()
      if (consejeroErr || !consejero) return

      // 3) fetch requerimientos con estado y respuesta
      const { data: reqsRaw, error: reqErr } = await supabase
        .from("requerimientos")
        .select("id, tipo, descripcion, fecha_envio, imagen_url, alumno_id, estado, respuesta")
        .eq("consejero_id", consejero.id)
      if (reqErr || !reqsRaw) {
        console.error("Error fetch requerimientos:", reqErr)
        return
      }

      // 4) extraer IDs únicos de alumno
      const alumnoIds = Array.from(new Set(reqsRaw.map(r => r.alumno_id)))

      // 5) fetch alumnos en batch
      const { data: alumnosData, error: alumErr } = await supabase
        .from("alumnos")
        .select("id, nombre, correo")
        .in("id", alumnoIds)
      if (alumErr || !alumnosData) {
        console.error("Error fetch alumnos:", alumErr)
        return
      }

      // 6) mapear cada requerimiento con su alumno correspondiente
      const alumnosMap = Object.fromEntries(alumnosData.map(a => [a.id, a]))
      const combined: Requerimiento[] = reqsRaw.map(r => ({
        id: r.id,
        tipo: r.tipo,
        descripcion: r.descripcion,
        fecha_envio: r.fecha_envio,
        imagen_url: r.imagen_url,
        alumno: alumnosMap[r.alumno_id],
        estado: r.estado,
        respuesta: r.respuesta
      }))

      setRequerimientos(combined)
    }

    fetchAll()
  }, [])

  const handleVerImagen = async (path: string) => {
    setImagenSeleccionada({ url: "", loading: true })
    try {
      const pathRelativo = path.split("/public/imagenes/")[1] || path
      const { data, error } = await supabase.storage
        .from("imagenes")
        .createSignedUrl(pathRelativo, 3600)
      if (error) throw error
      setImagenSeleccionada({ url: data.signedUrl, loading: false })
    } catch {
      const { data } = supabase.storage
        .from("imagenes")
        .getPublicUrl(path.split("/public/imagenes/")[1] || path)
      setImagenSeleccionada({ url: data.publicUrl, loading: false })
    }
  }

 const handleEstadoChange = async (id: string, nuevoEstado: string) => {
  // 1) Obtén el usuario actual
  const {
    data: { user },
    error: userErr
  } = await supabase.auth.getUser()
  if (userErr || !user) return console.error("No user")

  // 2) Ejecuta el update filtrando por id y por consejero_id
  const { data, error } = await supabase
    .from("requerimientos")
    .update({ estado: nuevoEstado })
    .eq("id", id)
    .eq("consejero_id", user.id)    // <--- Aquí
    .select()                       // para que devuelva data
  
  console.log("Update result:", { data, error })

  if (error) {
    console.error("Error actualizando estado:", error)
    return
  }
  
  // 3) Refresca tu estado local
  setRequerimientos(prev =>
    prev.map(r => r.id === id ? { ...r, estado: nuevoEstado } : r)
  )
}

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Requerimientos Recibidos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-blue-100 text-left text-gray-700">
            <tr>
              <th className="px-4 py-2">Alumno</th>
              <th className="px-4 py-2">Correo</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {requerimientos.length > 0 ? (
              requerimientos.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.alumno?.nombre ?? "—"}</td>
                  <td className="px-4 py-2">{r.alumno?.correo ?? "—"}</td>
                  <td className="px-4 py-2">{r.tipo}</td>
                  <td className="px-4 py-2">{r.descripcion}</td>
                  <td className="px-4 py-2">{new Date(r.fecha_envio).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {r.imagen_url ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800"
                        onClick={() => handleVerImagen(r.imagen_url!)}
                      >
                        Ver
                      </button>
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                  <td className="px-4 py-2">
                    <select
                      value={r.estado}
                      onChange={(e) => handleEstadoChange(r.id, e.target.value)}
                      className="border p-1 rounded"
                    >
                      <option value="enviado">Enviado</option>
                      <option value="en progreso">En Progreso</option>
                      <option value="respondido">Respondido</option>
                      <option value="aceptado">Aceptado</option>
                      <option value="denegado">Denegado</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  No se encontraron requerimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-4xl w-full">
            {imagenSeleccionada.loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Cargando imagen...</p>
              </div>
            ) : (
              <>
                <img
                  src={imagenSeleccionada.url}
                  alt="Imagen del requerimiento"
                  className="w-full h-auto rounded max-h-[70vh] object-contain"
                  onError={(e) => { e.currentTarget.src = "/placeholder-error.jpg" }}
                />
                <div className="text-right mt-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setImagenSeleccionada(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
