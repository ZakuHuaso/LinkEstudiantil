

import { useEffect, useState } from "react"
import CrearConsejeroModal from "../components/CrearConsejeroModal"
import { supabase } from "../../../../lib/supabaseClient"

interface Escuela {
  id: string
  nombre: string
}

interface Carrera {
  id: string
  nombre: string
  escuela_id: string | null
  escuelas: Escuela | null
}

interface Consejero {
  id: string
  nombre: string
  correo: string | null
  carrera_id: string | null
  carreras: Carrera | null
}

export default function Consejeros() {
  const [consejeros, setConsejeros] = useState<Consejero[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAbierto, setModalAbierto] = useState(false)

  // Estados para búsqueda
  const [terminoBusqueda, setTerminoBusqueda] = useState("")
  const [busquedaActiva, setBusquedaActiva] = useState(false)

  // Estados para paginación
  const [paginaActual, setPaginaActual] = useState(1)
  const [totalConsejeros, setTotalConsejeros] = useState(0)
  const elementosPorPagina = 10
  const totalPaginas = Math.ceil(totalConsejeros / elementosPorPagina)

  useEffect(() => {
    cargarConsejeros()
  }, [paginaActual, busquedaActiva])

  const cargarConsejeros = async () => {
    setLoading(true)

    try {
      // Calcular el rango para la paginación
      const desde = (paginaActual - 1) * elementosPorPagina
      const hasta = desde + elementosPorPagina - 1

      // Crear consulta separada para obtener el conteo
      let countQuery = supabase.from("consejeros").select("*", { count: "exact", head: true })

      // Aplicar filtro de búsqueda para el conteo
      if (busquedaActiva && terminoBusqueda.trim()) {
        countQuery = countQuery.ilike("nombre", `%${terminoBusqueda.trim()}%`)
      }

      // Obtener el total de consejeros con el filtro aplicado
      const { count } = await countQuery
      setTotalConsejeros(count || 0)

      // Crear consulta para obtener los datos con las relaciones a carreras y escuelas
      let dataQuery = supabase.from("consejeros").select(`
        id,
        nombre,
        correo,
        carrera_id,
        carreras!carrera_id (
          id,
          nombre,
          escuela_id,
          escuelas!escuela_id (
            id,
            nombre
          )
        )
      `)

      // Aplicar filtro de búsqueda si existe
      if (busquedaActiva && terminoBusqueda.trim()) {
        dataQuery = dataQuery.ilike("nombre", `%${terminoBusqueda.trim()}%`)
      }

      // Obtener los consejeros paginados
      const { data, error } = await dataQuery.order("nombre", { ascending: true }).range(desde, hasta)

      if (error) {
        console.error("Error al cargar consejeros:", error.message)
        setConsejeros([])
      } else {
        console.log("Consejeros cargados:", data)
        // Transformar los datos para asegurar que las relaciones sean objetos únicos
        const consejerosTransformados =
          data?.map((consejero: any) => ({
            ...consejero,
            carreras: consejero.carreras
              ? {
                  ...consejero.carreras,
                  escuelas: Array.isArray(consejero.carreras.escuelas)
                    ? consejero.carreras.escuelas[0] || null
                    : consejero.carreras.escuelas,
                }
              : null,
          })) || []

        setConsejeros(consejerosTransformados)
      }
    } catch (err) {
      console.error("Error inesperado al cargar consejeros:", err)
      setConsejeros([])
    } finally {
      setLoading(false)
    }
  }

  const eliminarConsejero = async (id: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de que quieres eliminar al consejero "${nombre}"?`)) {
      return
    }

    const { error } = await supabase.from("consejeros").delete().eq("id", id)

    if (error) {
      console.error("Error al eliminar consejero:", error)
      alert("Error al eliminar el consejero: " + error.message)
    } else {
      alert("Consejero eliminado exitosamente")
      cargarConsejeros()
    }
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
    setPaginaActual(1)
  }

  const limpiarBusqueda = () => {
    setTerminoBusqueda("")
    setBusquedaActiva(false)
    setPaginaActual(1)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <h2 className="text-3xl font-bold text-white text-center">Gestión de Consejeros</h2>
          </div>

          <div className="p-8">
            {/* Barra de búsqueda */}
            <div className="mb-8">
              <form onSubmit={handleBuscar} className="flex gap-3">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Buscar por nombre..."
                    className="w-full px-4 py-3 text-lg border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
                    value={terminoBusqueda}
                    onChange={(e) => setTerminoBusqueda(e.target.value)}
                  />
                  {terminoBusqueda && (
                    <button
                      type="button"
                      onClick={limpiarBusqueda}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xl"
                    >
                      ✕
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="px-6 py-3 bg-indigo-600 text-white text-lg rounded-lg hover:bg-indigo-700 shadow-sm transition-colors"
                >
                  Buscar
                </button>
                {busquedaActiva && (
                  <button
                    type="button"
                    onClick={limpiarBusqueda}
                    className="px-6 py-3 bg-gray-200 text-gray-700 text-lg rounded-lg hover:bg-gray-300 shadow-sm transition-colors"
                  >
                    Limpiar
                  </button>
                )}
              </form>
            </div>

            {/* Stats y botón crear */}
            <div className="flex justify-between items-center mb-6">
              <div className="text-lg text-gray-600">
                {busquedaActiva && (
                  <span className="font-medium">
                    Resultados para "{terminoBusqueda}":{" "}
                    <span className="text-blue-600 font-bold">{totalConsejeros}</span> consejeros
                  </span>
                )}
                {!busquedaActiva && (
                  <span>
                    Mostrando <span className="font-bold text-blue-600">{consejeros.length}</span> de{" "}
                    <span className="font-bold text-blue-600">{totalConsejeros}</span> consejeros
                  </span>
                )}
              </div>
              <button
                onClick={() => setModalAbierto(true)}
                className="px-6 py-3 bg-green-600 text-white text-lg font-medium rounded-lg hover:bg-green-700 shadow-lg transition-all transform hover:scale-105"
              >
                + Registrar Consejero
              </button>
            </div>

            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent"></div>
                <p className="mt-4 text-xl text-gray-600">Cargando consejeros...</p>
              </div>
            ) : consejeros.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                {busquedaActiva ? (
                  <div>
                    <div className="text-6xl mb-4">🔍</div>
                    <p className="text-xl text-gray-600">
                      No se encontraron consejeros con el nombre "{terminoBusqueda}".
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="text-6xl mb-4">👥</div>
                    <p className="text-xl text-gray-600">No hay consejeros registrados.</p>
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Tabla expandida */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                        <tr>
                          <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Nombre
                          </th>
                          <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Correo Electrónico
                          </th>
                          <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Carrera
                          </th>
                          <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Escuela
                          </th>
                          <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {consejeros.map((c, index) => (
                          <tr
                            key={c.id}
                            className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                          >
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg font-medium text-gray-900">
                                {busquedaActiva && terminoBusqueda ? (
                                  <HighlightText text={c.nombre} highlight={terminoBusqueda} />
                                ) : (
                                  c.nombre
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              <div className="text-lg text-gray-700">
                                {c.correo ? (
                                  <a
                                    href={`mailto:${c.correo}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {c.correo}
                                  </a>
                                ) : (
                                  <span className="text-gray-400 italic">Sin correo</span>
                                )}
                              </div>
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              {c.carreras?.nombre ? (
                                <span className="inline-flex px-4 py-2 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                  {c.carreras.nombre}
                                </span>
                              ) : (
                                <span className="inline-flex px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">
                                  Sin carrera asignada
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap">
                              {c.carreras?.escuelas?.nombre ? (
                                <span className="inline-flex px-4 py-2 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                                  {c.carreras.escuelas.nombre}
                                </span>
                              ) : (
                                <span className="inline-flex px-4 py-2 bg-gray-100 text-gray-500 text-sm font-medium rounded-full">
                                  Sin escuela
                                </span>
                              )}
                            </td>
                            <td className="px-8 py-6 whitespace-nowrap text-center">
                              <button
                                onClick={() => eliminarConsejero(c.id, c.nombre)}
                                className="inline-flex items-center px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-lg hover:bg-red-600 shadow-sm transition-all transform hover:scale-105"
                                title="Eliminar consejero"
                              >
                                <span className="mr-2">🗑️</span>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Controles de paginación mejorados */}
                {totalPaginas > 1 && (
                  <div className="flex justify-center items-center mt-8 gap-3">
                    <button
                      onClick={() => cambiarPagina(paginaActual - 1)}
                      disabled={paginaActual === 1}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-lg rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                      ← Anterior
                    </button>

                    {generarNumerosPagina().map((numero) => (
                      <button
                        key={numero}
                        onClick={() => cambiarPagina(numero)}
                        className={`px-4 py-2 text-lg rounded-lg shadow-sm transition-colors ${
                          numero === paginaActual
                            ? "bg-indigo-600 text-white font-bold"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                      >
                        {numero}
                      </button>
                    ))}

                    <button
                      onClick={() => cambiarPagina(paginaActual + 1)}
                      disabled={paginaActual === totalPaginas}
                      className="px-4 py-2 bg-gray-200 text-gray-700 text-lg rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-colors"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}

                <div className="text-center mt-6 text-lg text-gray-600">
                  Página <span className="font-bold text-blue-600">{paginaActual}</span> de{" "}
                  <span className="font-bold text-blue-600">{totalPaginas}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <CrearConsejeroModal
        abierto={modalAbierto}
        cerrar={() => setModalAbierto(false)}
        onConsejeroCreado={() => {
          setModalAbierto(false)
          cargarConsejeros()
        }}
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
