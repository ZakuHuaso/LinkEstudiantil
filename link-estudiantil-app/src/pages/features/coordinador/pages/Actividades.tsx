import { useEffect, useState } from "react"
import CrearActividadModal from "../components/CrearActividadModal"
import EditarActividadModal from "../components/EditarActividadModal"
import { supabase } from "../../../../lib/supabaseClient"
import DetallesActividadModal from "../components/DatallesActividadModal"

interface Actividad {
  id: string
  titulo: string
  descripcion: string
  estado: "borrador" | "publicada" | "aprobada"
  fecha: string
  hora: string
  lugar: string
  tipo: string
  capacidad: number
  inscritos: number
  publicar_en_home: boolean
  destacada: boolean
  coordinador_id: string
  propuesta_id: string | null
  imagen_url: string | null
}

export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)
  const [modalEditarAbierto, setModalEditarAbierto] = useState(false)
  const [actividadAEditar, setActividadAEditar] = useState<Actividad | null>(null)

  // Estado para la búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [busquedaActiva, setBusquedaActiva] = useState(false)

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalActividades, setTotalActividades] = useState(0)
  const elementosPorPagina = 10
  const totalPaginas = Math.ceil(totalActividades / elementosPorPagina)

  // Estados para el modal de detalles
  const [modalDetallesAbierto, setModalDetallesAbierto] = useState(false)
  const [actividadAVer, setActividadAVer] = useState<Actividad | null>(null)

  useEffect(() => {
    cargarActividades()
  }, [paginaActual, busquedaActiva])

  const cargarActividades = async () => {
    setLoading(true)

    // Calcular el rango para la paginación
    const desde = (paginaActual - 1) * elementosPorPagina
    const hasta = desde + elementosPorPagina - 1

    // Consulta base
    let query = supabase.from("Actividades").select("*", { count: "exact" })

    // Aplicar filtro de búsqueda si existe
    if (busquedaActiva && terminoBusqueda.trim()) {
      query = query.ilike("titulo", `%${terminoBusqueda.trim()}%`)
    }

    // Crear una consulta separada para obtener el conteo
    let countQuery = supabase.from("Actividades").select("*", { count: "exact", head: true })

    // Aplicar el mismo filtro de búsqueda para el conteo
    if (busquedaActiva && terminoBusqueda.trim()) {
      countQuery = countQuery.ilike("titulo", `%${terminoBusqueda.trim()}%`)
    }

    // Obtener el total de actividades con el filtro aplicado
    const { count } = await countQuery
    setTotalActividades(count || 0)

    // Crear nueva consulta para obtener los datos
    let dataQuery = supabase.from("Actividades").select("*")

    // Aplicar filtro de búsqueda si existe
    if (busquedaActiva && terminoBusqueda.trim()) {
      dataQuery = dataQuery.ilike("titulo", `%${terminoBusqueda.trim()}%`)
    }

    // Obtener las actividades paginadas con el filtro aplicado
    const { data, error } = await dataQuery.order("fecha", { ascending: false }).range(desde, hasta)

    if (error) {
      console.error("Error al cargar actividades:", error.message)
      setActividades([])
    } else {
      setActividades(data || [])
    }
    setLoading(false)
  }

  const eliminarActividad = async (id: string, titulo: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar la actividad "${titulo}"?`)) {
      return
    }

    const { error } = await supabase.from("Actividades").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar actividad:", error)
      alert("Error al eliminar la actividad: " + error.message)
    } else {
      alert("Actividad eliminada exitosamente")
      cargarActividades()
    }
  }

  const abrirModalEditar = (actividad: Actividad) => {
    setActividadAEditar(actividad)
    setModalEditarAbierto(true)
  }

  const abrirModalDetalles = (actividad: Actividad) => {
    setActividadAVer(actividad)
    setModalDetallesAbierto(true)
  }

  const cambiarPagina = (nuevaPagina: number) => {
    if (nuevaPagina >= 1 && nuevaPagina <= totalPaginas) {
      setPaginaActual(nuevaPagina)
    }
  }

  const generarNumerosPagina = () => {
    const numeros = []
    const maxNumeros = 5
    let inicio = Math.max(1, paginaActual - Math.floor(maxNumeros / 2))
    const fin = Math.min(totalPaginas, inicio + maxNumeros - 1)

    if (fin - inicio + 1 < maxNumeros) {
      inicio = Math.max(1, fin - maxNumeros + 1)
    }

    for (let i = inicio; i <= fin; i++) {
      numeros.push(i)
    }
    return numeros
  }

  const handleBuscar = (e: React.FormEvent) => {
    e.preventDefault()
    setBusquedaActiva(!!terminoBusqueda.trim())
    setPaginaActual(1) // Volver a la primera página al buscar
  }

  const limpiarBusqueda = () => {
    setTerminoBusqueda("")
    setBusquedaActiva(false)
    setPaginaActual(1)
  }

  return (
    <div className="max-w-7xl mx-auto p-6 mt-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">Listado de Actividades</h2>

      {/* Barra de búsqueda */}
      <div className="mb-6">
        <form onSubmit={handleBuscar} className="flex gap-2">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Buscar por título..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              value={terminoBusqueda}
              onChange={(e) => setTerminoBusqueda(e.target.value)}
            />
            {terminoBusqueda && (
              <button
                type="button"
                onClick={limpiarBusqueda}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
            Buscar
          </button>
          {busquedaActiva && (
            <button
              type="button"
              onClick={limpiarBusqueda}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Limpiar
            </button>
          )}
        </form>
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-600">
          {busquedaActiva && (
            <span className="font-medium">
              Resultados para "{terminoBusqueda}": {totalActividades} actividades
            </span>
          )}
          {!busquedaActiva && (
            <span>
              Mostrando {actividades.length} de {totalActividades} actividades
            </span>
          )}
        </div>
        <button
          onClick={() => setModalAbierto(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Crear Actividad
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Cargando actividades...</p>
        </div>
      ) : actividades.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          {busquedaActiva ? (
            <p className="text-gray-600">No se encontraron actividades con el título "{terminoBusqueda}".</p>
          ) : (
            <p className="text-gray-600">No tienes actividades registradas.</p>
          )}
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-300">
              <thead className="bg-blue-100 text-left">
                <tr>
                  <th className="px-4 py-2 border-b">Título</th>
                  <th className="px-4 py-2 border-b">Estado</th>
                  <th className="px-4 py-2 border-b">Fecha</th>
                  <th className="px-4 py-2 border-b">Hora</th>
                  <th className="px-4 py-2 border-b">Lugar</th>
                  <th className="px-4 py-2 border-b">Capacidad</th>
                  <th className="px-4 py-2 border-b">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {actividades.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border-b font-medium">
                      {busquedaActiva && terminoBusqueda ? (
                        <HighlightText text={a.titulo} highlight={terminoBusqueda} />
                      ) : (
                        a.titulo
                      )}
                    </td>
                    <td className="px-4 py-2 border-b">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          a.estado === "aprobada"
                            ? "bg-green-100 text-green-800"
                            : a.estado === "publicada"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {a.estado}
                      </span>
                    </td>
                    <td className="px-4 py-2 border-b">
                      {a.fecha ? new Date(a.fecha).toLocaleDateString("es-CL") : "-"}
                    </td>
                    <td className="px-4 py-2 border-b">{a.hora || "-"}</td>
                    <td className="px-4 py-2 border-b">{a.lugar || "-"}</td>
                    <td className="px-4 py-2 border-b text-center">{a.capacidad}</td>
                    <td className="px-4 py-2 border-b">
                      <div className="flex gap-2">
                        <button
                          onClick={() => abrirModalDetalles(a)}
                          className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
                          title="Ver detalles"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => abrirModalEditar(a)}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                          title="Editar actividad"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => eliminarActividad(a.id, a.titulo)}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
                          title="Eliminar actividad"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de paginación */}
          {totalPaginas > 1 && (
            <div className="flex justify-center items-center mt-6 gap-2">
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Anterior
              </button>

              {generarNumerosPagina().map((numero) => (
                <button
                  key={numero}
                  onClick={() => cambiarPagina(numero)}
                  className={`px-3 py-2 rounded ${
                    numero === paginaActual ? "bg-indigo-600 text-white" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {numero}
                </button>
              ))}

              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={paginaActual === totalPaginas}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Siguiente →
              </button>
            </div>
          )}

          <div className="text-center mt-4 text-sm text-gray-600">
            Página {paginaActual} de {totalPaginas}
          </div>
        </>
      )}

      <CrearActividadModal
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        onActividadCreada={() => {
          setModalAbierto(false)
          cargarActividades()
        }}
      />

      <EditarActividadModal
        abierto={modalEditarAbierto}
        cerrar={() => {
          setModalEditarAbierto(false)
          setActividadAEditar(null)
        }}
        actividad={actividadAEditar}
        onActividadActualizada={() => {
          setModalEditarAbierto(false)
          setActividadAEditar(null)
          cargarActividades()
        }}
      />

      <DetallesActividadModal
        abierto={modalDetallesAbierto}
        cerrar={() => {
          setModalDetallesAbierto(false)
          setActividadAVer(null)
        }}
        actividad={actividadAVer}
      />
    </div>
  )
}

// Componente para resaltar el texto buscado
function HighlightText({ text, highlight }: { text: string; highlight: string }) {
  if (!highlight.trim()) {
    return <>{text}</>
  }

  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-200 font-medium">
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
