import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("estudiante")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 1. Registrar usuario en Auth
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      return
    }

    // 2. Obtener el usuario autenticado para sacar el ID
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setError("No se pudo obtener el usuario después del registro.")
      return
    }

    // 3. Insertar en tabla usuarios
    console.log("USER ID:", user.id)
console.log("DATOS A INSERTAR:", {
  id: user.id,
  nombre,
  correo: email,
  rol,
})
    const { error: dbError } = await supabase.from("usuarios").insert([
      {
        id: user.id,
        nombre,
        correo: email,
        rol,
      },
    ])

    if (dbError) {
      setError("Error al guardar el perfil del usuario.")
      return
    }

    // 4. Redirigir al login
    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-6 rounded shadow w-96">
        <h2 className="text-2xl font-bold mb-4 text-center">Crear Cuenta</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <input
          type="text"
          placeholder="Nombre"
          className="w-full p-2 mb-3 border rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />
        <input
          type="email"
          placeholder="Correo"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-3 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <select
          className="w-full p-2 mb-4 border rounded"
          value={rol}
          onChange={(e) => setRol(e.target.value)}
        >
          <option value="estudiante">Estudiante</option>
          <option value="consejero">Consejero</option>
          <option value="coordinador">Coordinador</option>
        </select>
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Registrarse
        </button>
      </form>
    </div>
  )
}
