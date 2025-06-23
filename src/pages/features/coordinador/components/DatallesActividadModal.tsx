"use client"

import { Dialog } from "@headlessui/react"

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

interface Props {
  abierto: boolean
  cerrar: () => void
  actividad: Actividad | null
}

export default function DetallesActividadModal({ abierto, cerrar, actividad }: Props) {
  if (!actividad) return null

  return (
    <Dialog open={abierto} onClose={cerrar} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-start mb-6">
            <Dialog.Title className="text-2xl font-bold text-gray-900">Detalles de la Actividad</Dialog.Title>
            <button onClick={cerrar} className="text-gray-400 hover:text-gray-600 text-2xl">
              ✕
            </button>
          </div>

          <div className="space-y-6">
            {/* Imagen */}
            {actividad.imagen_url && (
              <div className="w-full">
                <img
                  src={actividad.imagen_url || "/placeholder.svg"}
                  alt={actividad.titulo}
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = "none"
                  }}
                />
              </div>
            )}

            {/* Información principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Información General</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Título</label>
                    <p className="text-gray-900 font-medium">{actividad.titulo}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Estado</label>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                        actividad.estado === "aprobada"
                          ? "bg-green-100 text-green-800"
                          : actividad.estado === "publicada"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {actividad.estado}
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tipo</label>
                    <p className="text-gray-900">{actividad.tipo || "No especificado"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Fecha y Lugar</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha</label>
                    <p className="text-gray-900">
                      {actividad.fecha
                        ? new Date(actividad.fecha).toLocaleDateString("es-CL", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "No especificada"}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Hora</label>
                    <p className="text-gray-900">{actividad.hora || "No especificada"}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Lugar</label>
                    <p className="text-gray-900">{actividad.lugar || "No especificado"}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Descripción</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{actividad.descripcion || "Sin descripción"}</p>
              </div>
            </div>

            {/* Capacidad e inscritos */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-blue-600">{actividad.capacidad}</div>
                <div className="text-sm text-blue-800">Capacidad Total</div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-green-600">{actividad.inscritos}</div>
                <div className="text-sm text-green-800">Inscritos</div>
              </div>

              <div className="bg-purple-50 p-4 rounded-lg text-center">
                <div className="text-2xl font-bold text-purple-600">{actividad.capacidad - actividad.inscritos}</div>
                <div className="text-sm text-purple-800">Disponibles</div>
              </div>
            </div>

            {/* Configuraciones */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Configuraciones</h3>
              <div className="flex gap-4">
                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${actividad.publicar_en_home ? "bg-green-500" : "bg-gray-300"}`}
                  ></span>
                  <span className="text-sm text-gray-700">
                    {actividad.publicar_en_home ? "Publicada en Home" : "No publicada en Home"}
                  </span>
                </div>

                <div className="flex items-center">
                  <span
                    className={`w-3 h-3 rounded-full mr-2 ${actividad.destacada ? "bg-yellow-500" : "bg-gray-300"}`}
                  ></span>
                  <span className="text-sm text-gray-700">
                    {actividad.destacada ? "Actividad Destacada" : "No destacada"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <button onClick={cerrar} className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              Cerrar
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
