// src/pages/coordinador/components/CrearActividadModal.tsx
import { Dialog } from "@headlessui/react"
import { useState } from "react"
import { supabase } from "../../../../lib/supabaseClient"

interface Props {
  abierto: boolean
  cerrar: () => void
  onActividadCreada: () => void
}

export default function CrearActividadModal({ abierto, cerrar, onActividadCreada }: Props) {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    lugar: "",
    tipo: "",
    capacidad: "",
    publicar_en_home: false,
    destacada: false,
  })

  const [loading, setLoading] = useState(false)
  const [imagen, setImagen] = useState<File | null>(null)
  const [previewImagen, setPreviewImagen] = useState<string | null>(null)
  const [subiendoImagen, setSubiendoImagen] = useState(false)

  // Fecha mínima para el input date: hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split("T")[0]

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de archivo
      if (!file.type.startsWith("image/")) {
        alert("Por favor selecciona un archivo de imagen válido")
        return
      }

      // Validar tamaño (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("La imagen debe ser menor a 5MB")
        return
      }

      setImagen(file)

      // Crear preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImagen(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const subirImagen = async (): Promise<string | null> => {
    if (!imagen) return null

    setSubiendoImagen(true)
    try {
      // Generar nombre único para la imagen
      const fileExt = imagen.name.split(".").pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `actividades/${fileName}`

      // Subir imagen a Supabase Storage
      const { data, error } = await supabase.storage.from("actividades").upload(filePath, imagen)

      if (error) {
        console.error("Error al subir imagen:", error)
        throw error
      }

      // Obtener URL pública de la imagen
      const {
        data: { publicUrl },
      } = supabase.storage.from("actividades").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Error al subir imagen:", error)
      alert("Error al subir la imagen: " + (error instanceof Error ? error.message : "Error desconocido"))
      return null
    } finally {
      setSubiendoImagen(false)
    }
  }

  const crearActividad = async () => {
    // Validación básica
    if (!form.titulo.trim()) {
      alert("El título es requerido")
      return
    }

    setLoading(true)

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError) {
        console.error("Error de autenticación:", authError)
        alert("Error de autenticación: " + authError.message)
        return
      }

      if (!user) {
        alert("Usuario no autenticado")
        return
      }

      // Subir imagen si existe
      let imagenUrl = null
      if (imagen) {
        imagenUrl = await subirImagen()
        if (!imagenUrl) {
          // Si falla la subida de imagen, no continuar
          return
        }
      }

      // Preparar los datos para insertar
      const actividadData = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        fecha: form.fecha || null,
        hora: form.hora || null,
        lugar: form.lugar.trim() || null,
        publicar_en_home: form.publicar_en_home,
        estado: "aprobada", // Cambiado de "borrador" a "aprobada" según tu esquema
        tipo: form.tipo.trim() || null,
        destacada: form.destacada,
        capacidad: form.capacidad ? Number(form.capacidad) : 0,
        inscritos: 0, // Valor por defecto
        coordinador_id: user.id,
        propuesta_id: null, // Valor por defecto
        imagen_url: imagenUrl,
      }

      console.log("Datos a insertar:", actividadData)

      // Insertar en la tabla
      const { data, error } = await supabase.from("Actividades").insert([actividadData]).select()

      if (error) {
        console.error("Error completo de Supabase:", error)
        console.error("Código de error:", error.code)
        console.error("Detalles:", error.details)
        console.error("Hint:", error.hint)

        // Mensajes de error más específicos
        if (error.code === "42501") {
          alert("Error de permisos: No tienes autorización para insertar en esta tabla. Verifica las políticas RLS.")
        } else if (error.code === "23505") {
          alert("Error: Ya existe un registro con estos datos únicos.")
        } else if (error.code === "23503") {
          alert("Error de referencia: El coordinador_id o propuesta_id no existe.")
        } else {
          alert("Error al crear actividad: " + error.message)
        }
        return
      }

      console.log("Actividad creada exitosamente:", data)

      // Limpiar formulario
      setForm({
        titulo: "",
        descripcion: "",
        fecha: "",
        hora: "",
        lugar: "",
        tipo: "",
        capacidad: "",
        publicar_en_home: false,
        destacada: false,
      })
      setImagen(null)
      setPreviewImagen(null)

      cerrar()
      onActividadCreada()
      alert("Actividad creada exitosamente!")
    } catch (err) {
      console.error("Error inesperado:", err)
      alert("Error inesperado: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  const eliminarPreview = () => {
    setImagen(null)
    setPreviewImagen(null)
  }

  return (
    <Dialog open={abierto} onClose={cerrar} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded p-6 space-y-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold">Crear nueva actividad</Dialog.Title>

          <input
            type="text"
            placeholder="Título *"
            className="w-full border rounded p-2"
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
          />
          <textarea
            placeholder="Descripción"
            className="w-full border rounded p-2"
            rows={3}
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
          />

          {/* Subida de imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Imagen de la actividad</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImagenChange}
              className="w-full border rounded p-2"
              disabled={subiendoImagen}
            />
            <p className="text-xs text-gray-500 mt-1">Formatos soportados: JPG, PNG, GIF. Máximo 5MB.</p>

            {/* Preview de la imagen */}
            {previewImagen && (
              <div className="mt-3 relative">
                <img
                  src={previewImagen || "/placeholder.svg"}
                  alt="Preview"
                  className="w-full h-32 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={eliminarPreview}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                >
                  ✕
                </button>
              </div>
            )}
          </div>

          <input
            type="date"
            className="w-full border rounded p-2"
            min={hoy}
            value={form.fecha}
            onChange={(e) => setForm({ ...form, fecha: e.target.value })}
          />
          <input
            type="time"
            className="w-full border rounded p-2"
            value={form.hora}
            onChange={(e) => setForm({ ...form, hora: e.target.value })}
          />
          <input
            type="text"
            placeholder="Lugar"
            className="w-full border rounded p-2"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
          />
          <input
            type="text"
            placeholder="Tipo"
            className="w-full border rounded p-2"
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
          />
          <input
            type="number"
            placeholder="Capacidad"
            min={0}
            className="w-full border rounded p-2"
            value={form.capacidad}
            onChange={(e) => setForm({ ...form, capacidad: e.target.value })}
          />

          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.publicar_en_home}
                onChange={(e) => setForm({ ...form, publicar_en_home: e.target.checked })}
              />
              <span>Publicar en Home</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={form.destacada}
                onChange={(e) => setForm({ ...form, destacada: e.target.checked })}
              />
              <span>Destacada</span>
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button onClick={cerrar} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300" disabled={loading}>
              Cancelar
            </button>
            <button
              onClick={crearActividad}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
              disabled={loading || subiendoImagen}
            >
              {loading ? "Creando..." : subiendoImagen ? "Subiendo imagen..." : "Crear"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}