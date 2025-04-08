import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError("Correo o contraseña incorrectos")
      setLoading(false)
      return
    }

    const { data: perfil, error: perfilError } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", data.user.id)
      .single()

    if (!perfil || perfilError) {
      setError("No se encontró el perfil del usuario.")
      setLoading(false)
      return
    }

    switch (perfil.rol) {
      case "estudiante":
        navigate("/estudiante")
        break
      case "consejero":
        navigate("/consejero")
        break
      case "coordinador":
        navigate("/coordinador")
        break
      default:
        setError("Rol no válido.")
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Formulario izquierdo */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">Welcome back</h2>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <label className="block mb-1 text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-3 rounded hover:bg-green-800 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          

          <p className="text-sm text-center">
            Don’t have an account?{" "}
            <a href="/registro" className="text-blue-600 font-semibold hover:underline">
              Sign Up
            </a>
          </p>
        </form>
      </div>

      {/* Imagen derecha */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/hoja.png')" }}
      ></div>
    </div>
  )
}
