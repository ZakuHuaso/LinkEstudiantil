"use client"

import { useEffect, useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"

interface Consejero {
  nombre: string
  correo: string | null
}

interface Propuesta {
  id: string
  requerimiento_id: string | null
  consejero_id: string | null
  titulo: string | null
  descripcion: string | null
  estado: string | null
  fecha_envio: string
  coordinador_id: string | null
  fecha_propuesta: string | null
  consejeros: Consejero | null
}

export default function RevisarPropuestas() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [usuarioActual, setUsuarioActual] = useState<string | null>(null)

  // Estados para el modal de mensaje
  const [modalMensajeAbierto, setModalMensajeAbierto] = useState(false)
  const [propuestaSeleccionada, setPropuestaSeleccionada] = useState<Propuesta | null>(null)
  const [nuevoEstado, setNuevoEstado] = useState<string>("")
  const [mensaje, setMensaje] = useState("")
  const [enviandoMensaje, setEnviandoMensaje] = useState(false)

  useEffect(() => {
    obtenerUsuarioActual()
    fetchPropuestas()
  }, [])

  const obtenerUsuarioActual = async () => {
    try {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error) {
        console.error("Error al obtener usuario:", error)
        return
      }

      if (user) {
        setUsuarioActual(user.id)
        console.log("Usuario actual:", user.id)
      } else {
        console.log("No hay usuario autenticado")
      }
    } catch (err) {
      console.error("Error inesperado al obtener usuario:", err)
    }
  }

  const fetchPropuestas = async () => {
    setLoading(true)
    setError(null)

    try {
      console.log("Iniciando consulta de propuestas...")

      const { data, error } = await supabase
        .from("Propuestas")
        .select(`
          id,
          requerimiento_id,
          consejero_id,
          titulo,
          descripcion,
          estado,
          fecha_envio,
          coordinador_id,
          fecha_propuesta,
          consejeros!consejero_id (
            nombre,
            correo
          )
        `)
        .order("fecha_envio", { ascending: false })

      console.log("Datos recibidos:", data)
      console.log("Error en consulta:", error)

      if (error) {
        throw error
      }

      if (!data) {
        setPropuestas([])
        return
      }

      // Transformar los datos
      const propuestasTransformadas = data.map((p: any) => ({
        ...p,
        consejeros: Array.isArray(p.consejeros) ? p.consejeros[0] || null : p.consejeros,
      }))

      console.log("Propuestas transformadas:", propuestasTransformadas)
      setPropuestas(propuestasTransformadas)
    } catch (err) {
      console.error("Error al cargar propuestas:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  const obtenerOCrearConversacion = async (coordinadorId: string, consejeroId: string) => {
    try {
      console.log("Buscando conversación existente...")
      console.log("Coordinador ID:", coordinadorId)
      console.log("Consejero ID:", consejeroId)

      // Buscar conversación existente
      const { data: conversacionExistente, error: errorBusqueda } = await supabase
        .from("conversaciones")
        .select("id")
        .eq("coordinador_id", coordinadorId)
        .eq("consejero_id", consejeroId)
        .single()

      if (conversacionExistente) {
        console.log("Conversación existente encontrada:", conversacionExistente.id)
        return conversacionExistente.id
      }

      if (errorBusqueda && errorBusqueda.code !== "PGRST116") {
        // PGRST116 significa "no rows returned", que es esperado si no existe
        console.error("Error al buscar conversación:", errorBusqueda)
        throw errorBusqueda
      }

      // Crear nueva conversación
      console.log("Creando nueva conversación...")
      const { data: nuevaConversacion, error: errorCreacion } = await supabase
        .from("conversaciones")
        .insert({
          coordinador_id: coordinadorId,
          consejero_id: consejeroId,
        })
        .select("id")
        .single()

      if (errorCreacion) {
        console.error("Error al crear conversación:", errorCreacion)
        throw errorCreacion
      }

      console.log("Nueva conversación creada:", nuevaConversacion.id)
      return nuevaConversacion.id
    } catch (err) {
      console.error("Error en obtenerOCrearConversacion:", err)
      throw err
    }
  }

  const handleCambiarEstado = (propuesta: Propuesta, estado: string) => {
    if (estado === propuesta.estado) return // No hacer nada si es el mismo estado

    console.log("Cambiando estado de propuesta:", propuesta.id, "a:", estado)

    setPropuestaSeleccionada(propuesta)
    setNuevoEstado(estado)
    setModalMensajeAbierto(true)

    // Mensaje predeterminado según el estado con información de la propuesta
    const tituloTexto = propuesta.titulo ? `"${propuesta.titulo}"` : "sin título"
    const descripcionTexto = propuesta.descripcion
      ? propuesta.descripcion.substring(0, 100) + (propuesta.descripcion.length > 100 ? "..." : "")
      : "sin descripción"

    if (estado === "aprobada") {
      setMensaje(`Hola ${propuesta.consejeros?.nombre || ""},

¡Excelentes noticias! Tu propuesta ha sido APROBADA.

📋 DETALLES DE LA PROPUESTA:
• Título: ${tituloTexto}
• Descripción: ${descripcionTexto}
• Fecha de envío: ${new Date(propuesta.fecha_envio).toLocaleDateString("es-CL")}

Nos pondremos en contacto contigo pronto para coordinar los siguientes pasos.

Saludos cordiales.`)
    } else if (estado === "rechazada") {
      setMensaje(`Hola ${propuesta.consejeros?.nombre || ""},

Lamentamos informarte que tu propuesta ha sido RECHAZADA.

📋 DETALLES DE LA PROPUESTA RECHAZADA:
• Título: ${tituloTexto}
• Descripción: ${descripcionTexto}
• Fecha de envío: ${new Date(propuesta.fecha_envio).toLocaleDateString("es-CL")}

Te animamos a revisar los requisitos y enviar una nueva propuesta en el futuro.

Saludos cordiales.`)
    } else {
      setMensaje(`Hola ${propuesta.consejeros?.nombre || ""},

El estado de tu propuesta ha cambiado a: ${estado.toUpperCase()}

📋 DETALLES DE LA PROPUESTA:
• Título: ${tituloTexto}
• Descripción: ${descripcionTexto}
• Fecha de envío: ${new Date(propuesta.fecha_envio).toLocaleDateString("es-CL")}

Saludos cordiales.`)
    }
  }

  const confirmarCambioEstado = async () => {
    if (!propuestaSeleccionada || !nuevoEstado) {
      alert("Faltan datos para procesar la solicitud")
      return
    }

    if (!usuarioActual) {
      alert("No se pudo identificar el usuario actual")
      return
    }

    if (!propuestaSeleccionada.consejero_id) {
      alert("No se pudo identificar el consejero de la propuesta")
      return
    }

    setEnviandoMensaje(true)

    try {
      console.log("=== INICIANDO PROCESO ===")
      console.log("Propuesta ID:", propuestaSeleccionada.id)
      console.log("Nuevo estado:", nuevoEstado)
      console.log("Usuario actual (coordinador):", usuarioActual)
      console.log("Consejero ID:", propuestaSeleccionada.consejero_id)

      // 1. Actualizar el estado de la propuesta
      console.log("1. Actualizando estado de la propuesta...")
      const { data: dataEstado, error: errorEstado } = await supabase
        .from("Propuestas")
        .update({ estado: nuevoEstado })
        .eq("id", propuestaSeleccionada.id)
        .select()

      console.log("Resultado actualización estado:", dataEstado)
      console.log("Error actualización estado:", errorEstado)

      if (errorEstado) {
        throw new Error(`Error al actualizar estado: ${errorEstado.message}`)
      }

      // 2. Enviar mensaje al consejero si hay mensaje
      if (mensaje.trim()) {
        console.log("2. Procesando mensaje...")

        // 2a. Obtener o crear conversación
        const conversacionId = await obtenerOCrearConversacion(usuarioActual, propuestaSeleccionada.consejero_id)

        // 2b. Insertar mensaje
        const mensajeData = {
          emisor_id: usuarioActual,
          receptor_id: propuestaSeleccionada.consejero_id,
          propuesta_id: propuestaSeleccionada.id,
          conversacion_id: conversacionId,
          mensaje: mensaje.trim(),
          leido: false,
        }

        console.log("Datos del mensaje a insertar:", mensajeData)

        const { data: dataMensaje, error: errorMensaje } = await supabase.from("mensajes").insert(mensajeData).select()

        console.log("Resultado inserción mensaje:", dataMensaje)
        console.log("Error inserción mensaje:", errorMensaje)

        if (errorMensaje) {
          console.error("Error al enviar mensaje:", errorMensaje)
          throw new Error(`Error al enviar mensaje: ${errorMensaje.message}`)
        }

        // 2c. Actualizar última fecha y último mensaje en la conversación
        const { error: errorActualizarConversacion } = await supabase
          .from("conversaciones")
          .update({
            ultima_fecha: new Date().toISOString(),
            ultimo_mensaje: mensaje.trim(),
          })
          .eq("id", conversacionId)

        if (errorActualizarConversacion) {
          console.error("Error al actualizar conversación:", errorActualizarConversacion)
          // No es crítico, continuar
        }
      } else {
        console.log("2. No se enviará mensaje (vacío)")
      }

      // 3. Actualizar el estado local
      console.log("3. Actualizando estado local...")
      setPropuestas((prev) => prev.map((p) => (p.id === propuestaSeleccionada.id ? { ...p, estado: nuevoEstado } : p)))

      alert(`Propuesta ${nuevoEstado} correctamente${mensaje.trim() ? " y mensaje enviado" : ""}`)
      cerrarModal()
      console.log("=== PROCESO COMPLETADO ===")
    } catch (err) {
      console.error("=== ERROR EN EL PROCESO ===")
      console.error("Error completo:", err)
      alert("Error al procesar la solicitud: " + (err instanceof Error ? err.message : "Error desconocido"))
    } finally {
      setEnviandoMensaje(false)
    }
  }

  const cerrarModal = () => {
    setModalMensajeAbierto(false)
    setPropuestaSeleccionada(null)
    setNuevoEstado("")
    setMensaje("")
  }

  const getEstadoColor = (estado: string | null) => {
    switch (estado) {
      case "aprobada":
        return "bg-green-100 text-green-800"
      case "rechazada":
        return "bg-red-100 text-red-800"
      default:
        return "bg-yellow-100 text-yellow-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            <p className="mt-4 text-xl text-gray-600">Cargando propuestas...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-red-800 font-medium text-xl">Error al cargar propuestas</h3>
            <p className="text-red-600 mt-2 text-lg">{error}</p>
            <button
              onClick={fetchPropuestas}
              className="mt-6 px-6 py-3 bg-red-600 text-white text-lg rounded-lg hover:bg-red-700 shadow-sm transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-8 py-6">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-white">Propuestas Recibidas</h2>
              <button
                onClick={fetchPropuestas}
                className="px-6 py-3 bg-white bg-opacity-20 text-white rounded-lg hover:bg-opacity-30 transition-all transform hover:scale-105 shadow-lg"
              >
                🔄 Actualizar
              </button>
            </div>
          </div>

          <div className="p-8">
            {propuestas.length === 0 ? (
              <div className="text-center py-16 bg-gray-50 rounded-lg">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-xl text-gray-600">No hay propuestas registradas.</p>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100">
                      <tr>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Consejero
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Propuesta
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Estado
                        </th>
                        <th className="px-8 py-4 text-left text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Fecha de Envío
                        </th>
                        <th className="px-8 py-4 text-center text-sm font-semibold text-gray-700 uppercase tracking-wider border-b border-gray-200">
                          Cambiar Estado
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {propuestas.map((propuesta, index) => (
                        <tr
                          key={propuesta.id}
                          className={`hover:bg-gray-50 transition-colors ${index % 2 === 0 ? "bg-white" : "bg-gray-25"}`}
                        >
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <div className="text-lg font-medium text-gray-900">
                                {propuesta.consejeros?.nombre || "Consejero no encontrado"}
                              </div>
                              <div className="text-sm text-gray-500">
                                {propuesta.consejeros?.correo ? (
                                  <a
                                    href={`mailto:${propuesta.consejeros.correo}`}
                                    className="text-blue-600 hover:text-blue-800 hover:underline"
                                  >
                                    {propuesta.consejeros.correo}
                                  </a>
                                ) : (
                                  "Sin correo"
                                )}
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <div className="max-w-md">
                              {propuesta.titulo && (
                                <p className="text-lg font-medium text-gray-900 mb-2" title={propuesta.titulo}>
                                  {propuesta.titulo.length > 50
                                    ? propuesta.titulo.substring(0, 50) + "..."
                                    : propuesta.titulo}
                                </p>
                              )}
                              <p className="text-sm text-gray-600" title={propuesta.descripcion || ""}>
                                {propuesta.descripcion
                                  ? propuesta.descripcion.length > 100
                                    ? propuesta.descripcion.substring(0, 100) + "..."
                                    : propuesta.descripcion
                                  : "Sin descripción"}
                              </p>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span
                              className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full ${getEstadoColor(propuesta.estado)}`}
                            >
                              {propuesta.estado || "Sin estado"}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="text-lg text-gray-900">
                              {new Date(propuesta.fecha_envio).toLocaleDateString("es-CL", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </div>
                            <div className="text-sm text-gray-500">
                              {new Date(propuesta.fecha_envio).toLocaleTimeString("es-CL", {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-center">
                            <select
                              value={propuesta.estado || "pendiente"}
                              onChange={(e) => handleCambiarEstado(propuesta, e.target.value)}
                              className="border border-gray-300 rounded-lg px-4 py-2 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                            >
                              <option value="pendiente">Pendiente</option>
                              <option value="aprobada">Aprobada</option>
                              <option value="rechazada">Rechazada</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal para enviar mensaje */}
      {modalMensajeAbierto && propuestaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-medium text-gray-900">
                Cambiar estado a: <span className="font-bold text-blue-600 text-2xl">{nuevoEstado}</span>
              </h3>
              <p className="text-lg text-gray-600 mt-2">
                Propuesta de: <strong>{propuestaSeleccionada.consejeros?.nombre}</strong>
              </p>
              {propuestaSeleccionada.titulo && (
                <p className="text-sm text-gray-500 mt-1">
                  Título: <em>"{propuestaSeleccionada.titulo}"</em>
                </p>
              )}
            </div>

            <div className="p-6">
              <label className="block text-lg font-medium text-gray-700 mb-3">
                Mensaje para el consejero (opcional)
              </label>
              <textarea
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-4 text-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                rows={8}
                placeholder="Escribe un mensaje para notificar al consejero sobre el cambio de estado..."
              />
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
              <button
                onClick={cerrarModal}
                disabled={enviandoMensaje}
                className="px-6 py-3 border border-gray-300 text-gray-700 text-lg rounded-lg hover:bg-gray-50 disabled:opacity-50 shadow-sm transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarCambioEstado}
                disabled={enviandoMensaje}
                className="px-6 py-3 bg-blue-600 text-white text-lg rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-3 shadow-lg transition-all transform hover:scale-105"
              >
                {enviandoMensaje ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    <span>📤</span>
                    Confirmar y Enviar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
