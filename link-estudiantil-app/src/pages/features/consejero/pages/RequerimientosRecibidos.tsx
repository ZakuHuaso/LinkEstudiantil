import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient";

// Tipos de datos
interface Alumno { id: string; nombre: string; correo: string }
interface RequerimientoRaw { id: string; tipo: string; descripcion: string; fecha_envio: string; imagen_url?: string; alumno_id: string; estado: string; respuesta?: string }
interface Requerimiento extends RequerimientoRaw { alumno?: Alumno }

export default function RequerimientosRecibidos() {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [current, setCurrent] = useState<Requerimiento | null>(null)
  const [responseText, setResponseText] = useState("")
  const [imagenSeleccionada, setImagenSeleccionada] = useState<{ url: string; loading: boolean } | null>(null)

  // Carga inicial de requerimientos y alumnos
  useEffect(() => {
    const fetchAll = async () => {
      const { data: auth } = await supabase.auth.getUser()
      if (!auth.user) return
      const { data: cj } = await supabase.from("consejeros").select("id").eq("correo", auth.user.email).single()
      if (!cj) return
      const { data: reqs } = await supabase
        .from("requerimientos")
        .select("id, tipo, descripcion, fecha_envio, imagen_url, alumno_id, estado, respuesta")
        .eq("consejero_id", cj.id)
      if (!reqs) return
      const ids = Array.from(new Set(reqs.map(r => r.alumno_id)))
      const { data: alms } = await supabase.from("alumnos").select("id, nombre, correo").in("id", ids)
      if (!alms) return
      const map = Object.fromEntries(alms.map(a => [a.id, a]))
      setRequerimientos(reqs.map(r => ({ ...r, alumno: map[r.alumno_id] })))
    }
    fetchAll()
  }, [])

  // Abrir modal para responder
  const openModal = (req: Requerimiento) => {
    setCurrent(req)
    setResponseText(req.respuesta || "")
    setModalOpen(true)
  }

  // Enviar respuesta al alumno
  const sendResponse = async () => {
    if (!current) return
    const { error } = await supabase
      .from("requerimientos")
      .update({ respuesta: responseText, estado: 'respondido' })
      .eq("id", current.id)
      .eq("consejero_id", (await supabase.auth.getUser()).data.user?.id)
    if (error) return console.error(error)
    setRequerimientos(prev => prev.map(r => r.id === current.id ? { ...r, respuesta: responseText, estado: 'respondido' } : r))
    setModalOpen(false)
  }

  // Cambio manual de estado
  const handleEstadoChange = async (id: string, estado: string) => {
    const userId = (await supabase.auth.getUser()).data.user?.id
    const { data, error } = await supabase
      .from("requerimientos")
      .update({ estado })
      .eq("id", id)
      .eq("consejero_id", userId)
      .select()
    console.log("Update result:", { data, error })
    if (!error) setRequerimientos(prev => prev.map(r => r.id === id ? { ...r, estado } : r))
  }

  // Ver imagen en modal
  const handleVerImagen = async (path: string) => {
    setImagenSeleccionada({ url: "", loading: true })
    try {
      const rel = path.split("/public/imagenes/")[1] || path
      const { data } = await supabase.storage.from("imagenes").createSignedUrl(rel, 3600)
      setImagenSeleccionada({ url: data.signedUrl, loading: false })
    } catch {
      const { data } = supabase.storage.from("imagenes").getPublicUrl(path)
      setImagenSeleccionada({ url: data.publicUrl, loading: false })
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Requerimientos Recibidos</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">Alumno</th>
              <th className="px-4 py-2">Correo</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Imagen</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Abrir</th>
            </tr>
          </thead>
          <tbody>
            {requerimientos.map(r => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.alumno?.nombre}</td>
                <td className="px-4 py-2">{r.alumno?.correo}</td>
                <td className="px-4 py-2">{r.tipo}</td>
                <td className="px-4 py-2">{r.descripcion}</td>
                <td className="px-4 py-2">{new Date(r.fecha_envio).toLocaleDateString()}</td>
                <td className="px-4 py-2">{
                  r.imagen_url
                  ? <button onClick={() => handleVerImagen(r.imagen_url!)} className="text-blue-600 underline">Ver</button>
                  : 'Sin imagen'
                }</td>
                <td className="px-4 py-2">
                  <select value={r.estado} onChange={e => handleEstadoChange(r.id, e.target.value)} className="border p-1 rounded">
                    <option value="enviado">Enviado</option>
                    <option value="en progreso">En Progreso</option>
                    <option value="respondido">Respondido</option>
                    <option value="aceptado">Aceptado</option>
                    <option value="denegado">Denegado</option>
                  </select>
                </td>
                <td className="px-4 py-2">
                  <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => openModal(r)}>
                    Abrir
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de respuesta */}
      {modalOpen && current && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-2xl">
            <h3 className="text-xl font-semibold mb-4">Responder a {current.alumno?.nombre}</h3>
            <p className="mb-2"><strong>Tipo:</strong> {current.tipo}</p>
            <p className="mb-4"><strong>Descripción:</strong> {current.descripcion}</p>
            <textarea value={responseText} onChange={e => setResponseText(e.target.value)} placeholder="Escribe tu respuesta..." className="w-full border p-2 rounded mb-4 h-32"/>
            <div className="flex justify-end gap-2">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2">Cancelar</button>
              <button onClick={sendResponse} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">Enviar</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de imagen */}
      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-40">
          <div className="bg-white p-4 rounded shadow-lg max-w-4xl w-full">
            {imagenSeleccionada.loading
              ? <div className="flex justify-center items-center h-64"><p>Cargando imagen...</p></div>
              : <>
                  <img src={imagenSeleccionada.url} alt="Imagen" className="w-full h-auto rounded max-h-[70vh] object-contain"/>
                  <div className="text-right mt-4"><button onClick={() => setImagenSeleccionada(null)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Cerrar</button></div>
                </>}
          </div>
        </div>
      )}
    </div>
  )
}
