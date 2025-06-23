"use client"

import { Dialog } from "@headlessui/react"
import { useState, useEffect } from "react"
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

interface Props {
  abierto: boolean
  cerrar: () => void
  onConsejeroCreado: () => void
}

export default function CrearConsejeroModal({ abierto, cerrar, onConsejeroCreado }: Props) {
  const [form, setForm] = useState({
    nombre: "",
    correo: "",
    password: "",
    confirmPassword: "",
    carrera_id: "",
  })

  const [loading, setLoading] = useState(false)
  const [carreras, setCarreras] = useState<Carrera[]>([])
  const [cargandoCarreras, setCargandoCarreras] = useState(false)
  const [mostrarPassword, setMostrarPassword] = useState(false)
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Cargar carreras cuando se abre el modal
  useEffect(() => {
    if (abierto) {
      cargarCarreras()
      setError(null)
      setForm({
        nombre: "",
        correo: "",
        password: "",
        confirmPassword: "",
        carrera_id: "",
      })
    }
  }, [abierto])

  const cargarCarreras = async () => {
    setCargandoCarreras(true)
    try {
      console.log("Cargando carreras...")

      const { data, error } = await supabase
        .from("carreras")
        .select(`
          id,
          nombre,
          escuela_id,
          escuelas (
            id,
            nombre
          )
        `)
        .order("nombre", { ascending: true })

      if (error) {
        console.error("Error al cargar carreras:", error)
        setCarreras([])
      } else {
        console.log("Carreras cargadas:", data)
        const carrerasTransformadas =
          data?.map((carrera: any) => ({
            ...carrera,
            escuelas: Array.isArray(carrera.escuelas) ? carrera.escuelas[0] || null : carrera.escuelas,
          })) || []

        setCarreras(carrerasTransformadas)
      }
    } catch (err) {
      console.error("Error inesperado al cargar carreras:", err)
      setCarreras([])
    } finally {
      setCargandoCarreras(false)
    }
  }

  const validarFormulario = () => {
    // Validación básica
    if (!form.nombre.trim()) {
      setError("El nombre es requerido")
      return false
    }

    if (!form.correo.trim()) {
      setError("El correo es requerido")
      return false
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(form.correo.trim())) {
      setError("Por favor ingresa un correo válido")
      return false
    }

    if (!form.password.trim()) {
      setError("La contraseña es requerida")
      return false
    }

    // Validar longitud de contraseña
    if (form.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }

    // Validar confirmación de contraseña
    if (form.password !== form.confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }

    setError(null)
    return true
  }

  const crearConsejero = async () => {
    if (!validarFormulario()) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      console.log("=== INICIANDO REGISTRO DE CONSEJERO ===")

      // 1. Crear usuario en Supabase Auth
      console.log("1. Creando usuario en Supabase Auth...")
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.correo.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.nombre.trim(),
            role: "consejero",
          },
        },
      })

      console.log("Resultado de signUp:", authData)
      console.log("Error de signUp:", authError)

      if (authError) {
        console.error("Error al crear usuario:", authError)

        // Manejar errores específicos de autenticación
        if (authError.message.includes("already registered")) {
          setError("Ya existe un usuario registrado con este correo electrónico")
        } else if (authError.message.includes("Password should be")) {
          setError("La contraseña no cumple con los requisitos mínimos")
        } else {
          setError("Error al crear usuario: " + authError.message)
        }
        return
      }

      if (!authData.user) {
        setError("Error: No se pudo crear el usuario")
        return
      }

      console.log("Usuario creado exitosamente:", authData.user.id)

      // 2. Crear registro en la tabla consejeros
      console.log("2. Creando registro en tabla consejeros...")
      const consejeroData = {
        uid: authData.user.id,
        nombre: form.nombre.trim(),
        correo: form.correo.trim(),
        carrera_id: form.carrera_id || null,
      }

      console.log("Datos del consejero a insertar:", consejeroData)

      const { data: consejeroResult, error: consejeroError } = await supabase
        .from("consejeros")
        .insert([consejeroData])
        .select()

      if (consejeroError) {
        console.error("Error al crear consejero:", consejeroError)
        setError("Error al crear el registro del consejero: " + consejeroError.message)
        return
      }

      console.log("Consejero creado exitosamente:", consejeroResult)

      // 3. Limpiar formulario y cerrar modal
      setForm({
        nombre: "",
        correo: "",
        password: "",
        confirmPassword: "",
        carrera_id: "",
      })

      cerrar()
      onConsejeroCreado()

      // Mostrar mensaje de éxito
      alert(`¡Consejero registrado exitosamente!
      
Se ha enviado un correo de confirmación a ${form.correo}.
El consejero debe verificar su correo antes de poder iniciar sesión.`)

      console.log("=== REGISTRO COMPLETADO ===")
    } catch (err) {
      console.error("Error inesperado:", err)
      setError("Error inesperado: " + (err instanceof Error ? err.message : String(err)))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={abierto} onClose={cerrar} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Dialog.Panel className="bg-white rounded-lg p-6 space-y-4 w-full max-w-lg max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl font-bold text-green-800">Registrar Nuevo Consejero</Dialog.Title>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              <p className="flex items-center">
                <span className="mr-2">⚠️</span> {error}
              </p>
            </div>
          )}

          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre completo *</label>
              <input
                type="text"
                placeholder="Nombre completo del consejero"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            {/* Correo */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Correo electrónico *</label>
              <input
                type="email"
                placeholder="correo@ejemplo.com"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                value={form.correo}
                onChange={(e) => setForm({ ...form, correo: e.target.value })}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Se enviará un correo de confirmación a esta dirección</p>
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña *</label>
              <div className="relative">
                <input
                  type={mostrarPassword ? "text" : "password"}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Confirmar contraseña */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar contraseña *</label>
              <div className="relative">
                <input
                  type={mostrarConfirmPassword ? "text" : "password"}
                  placeholder="Repetir la contraseña"
                  className="w-full border border-gray-300 rounded-lg p-3 pr-10 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.confirmPassword}
                  onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                  required
                />
                <button
                  type="button"
                  onClick={() => setMostrarConfirmPassword(!mostrarConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {mostrarConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {form.password && form.confirmPassword && form.password !== form.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">Las contraseñas no coinciden</p>
              )}
            </div>

            {/* Carrera */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Carrera (opcional)</label>
              {cargandoCarreras ? (
                <div className="w-full border border-gray-300 rounded-lg p-3 text-gray-500 bg-gray-50">
                  Cargando carreras...
                </div>
              ) : carreras.length === 0 ? (
                <div className="w-full border border-gray-300 rounded-lg p-3 text-gray-500 bg-gray-50">
                  No hay carreras disponibles
                </div>
              ) : (
                <select
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  value={form.carrera_id}
                  onChange={(e) => setForm({ ...form, carrera_id: e.target.value })}
                >
                  <option value="">Sin carrera asignada</option>
                  {carreras.map((carrera) => (
                    <option key={carrera.id} value={carrera.id}>
                      {carrera.nombre} {carrera.escuelas ? `(${carrera.escuelas.nombre})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Información adicional */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2">ℹ️ Información importante:</h4>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Los campos marcados con * son obligatorios</li>
              <li>• Se creará una cuenta de acceso para el consejero</li>
              <li>• Se enviará un correo de confirmación</li>
              <li>• El consejero debe verificar su correo antes de iniciar sesión</li>
            </ul>
          </div>

          {/* Botones */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={cerrar}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              onClick={crearConsejero}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              disabled={loading || cargandoCarreras}
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                  <span>Registrando...</span>
                </>
              ) : (
                "Registrar Consejero"
              )}
            </button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  )
}
