"use client"

// src/pages/coordinador/components/EditarActividadModal.tsx
import { Dialog } from "@headlessui/react"
import { useState, useEffect } from "react"
import { supabase } from "../../../../lib/supabaseClient"

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
  onActividadActualizada: () => void
}

export default function EditarActividadModal({ abierto, cerrar, actividad, onActividadActualizada }: Props) {
  const [form, setForm] = useState({
    titulo: "",
    descripcion: "",
    fecha: "",
    hora: "",
    lugar: "",
    tipo: "",
    capacidad: "",
    estado: "aprobada" as "borrador" | "publicada" | "aprobada",
    publicar_en_home: false,
    destacada: false,
    imagen_url: "",
  })

  const [loading, setLoading] = useState(false)

  // Fecha mínima para el input date: hoy en formato YYYY-MM-DD
  const hoy = new Date().toISOString().split("T")[0]

  // Cargar datos de la actividad cuando se abre el modal
  useEffect(() => {
    if (actividad && abierto) {
      setForm({
        titulo: actividad.titulo || "",
        descripcion: actividad.descripcion || "",
        fecha: actividad.fecha || "",
        hora: actividad.hora || "",
        lugar: actividad.lugar || "",
        tipo: actividad.tipo || "",
        capacidad: actividad.capacidad?.toString() || "0",
        estado: actividad.estado || "aprobada",
        publicar_en_home: actividad.publicar_en_home || false,
        destacada: actividad.destacada || false,
        imagen_url: actividad.imagen_url || "",
      })
    }
  }, [actividad, abierto])

  const actualizarActividad = async () => {
    if (!actividad) return

    // Validación básica
    if (!form.titulo.trim()) {
      alert("El título es requerido")
      return
    }

    setLoading(true)

    try {
      // Preparar los datos para actualizar
      const actividadData = {
        titulo: form.titulo.trim(),
        descripcion: form.descripcion.trim() || null,
        fecha: form.fecha || null,
        hora: form.hora || null,
        lugar: form.lugar.trim() || null,
        publicar_en_home: form.publicar_en_home,
        estado: form.estado,
        tipo: form.tipo.trim() || null,
        destacada: form.destacada,
        capacidad: form.capacidad ? Number(form.capacidad) : 0,
        imagen_url: form.imagen_url.trim() || null,
      }

      console.log("Datos a actualizar:", actividadData)

      const { data, error } = await supabase.from("Actividades").update(actividadData).eq("id", actividad.id).select()

      if (error) {
        console.error("Error completo de Supabase:", error)

        if (error.code === "42501") {
          alert("Error de permisos: No tienes autorización para actualizar esta actividad.")
        } else {
          alert("Error al actualizar actividad: " + error.message)
        }
        return
      }

      console.log("Actividad actualizada exitosamente:", data)
      onActividadActualizada()
      alert("Actividad actualizada exitosamente!")
    } catch (err) {
      console.error("Error inesperado:", err)
      alert("Error inesperado: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  if (!actividad) return null

  return (
    <Dialog open={abierto} onClose={cerrar} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded p-6 space-y-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold">Editar actividad</Dialog.Title>

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

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <input
            type="text"
            placeholder="Lugar"
            className="w-full border rounded p-2"
            value={form.lugar}
            onChange={(e) => setForm({ ...form, lugar: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
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
          </div>

          <select
            className="w-full border rounded p-2"
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value as "borrador" | "publicada" | "aprobada" })}
          >
            <option value="borrador">Borrador</option>
            <option value="aprobada">Aprobada</option>
            <option value="publicada">Publicada</option>
          </select>

          <input
            type="url"
            placeholder="URL de imagen (opcional)"
            className="w-full border rounded p-2"
            value={form.imagen_url}
            onChange={(e) => setForm({ ...form, imagen_url: e.target.value })}
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
              onClick={actualizarActividad}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Actualizando..." : "Actualizar"}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
