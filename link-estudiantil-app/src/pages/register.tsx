import { useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"

export default function Register() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [rol, setRol] = useState("estudiante")
  const [acepta, setAcepta] = useState(false)
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!acepta) {
      setError("Debes aceptar los términos y condiciones.")
      return
    }

    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      return
    }

    const userId = data.user?.id
    if (!userId) {
      setError("No se pudo obtener el ID del usuario.")
      return
    }

    const { error: dbError } = await supabase.from("usuarios").insert([
      {
        id: userId,
        nombre,
        correo: email,
        rol,
      },
    ])

    if (dbError) {
      setError("Error al guardar el perfil del usuario.")
      return
    }

    navigate("/")
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <form onSubmit={handleRegister} className="w-full max-w-md bg-white">
        <h2 className="text-2xl font-bold mb-6 text-black text-center">Get Started Now</h2>

        {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

        <label className="block mb-1 text-sm font-medium text-gray-700">Name</label>
        <input
          type="text"
          placeholder="Enter your name"
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          required
        />

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
          className="w-full p-3 mb-4 border border-gray-300 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="terms"
            className="mr-2"
            checked={acepta}
            onChange={(e) => setAcepta(e.target.checked)}
          />
          <label htmlFor="terms" className="text-sm text-gray-600">
            I agree to the <a href="#" className="underline font-medium">terms & policy</a>
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-green-700 text-white font-semibold py-3 rounded hover:bg-green-800 transition"
        >
          Signup
        </button>

        <div className="my-6 flex items-center gap-2">
          <hr className="flex-grow border-t" />
          <span className="text-sm text-gray-500">or</span>
          <hr className="flex-grow border-t" />
        </div>

        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <button type="button" className="flex-1 border border-gray-300 py-2 rounded flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5" alt="Google" />
            <span className="text-sm">Sign in with Google</span>
          </button>
          <button type="button" className="flex-1 border border-gray-300 py-2 rounded flex items-center justify-center gap-2">
            <img src="https://www.svgrepo.com/show/452085/apple.svg" className="w-5 h-5" alt="Apple" />
            <span className="text-sm">Sign in with Apple</span>
          </button>
        </div>

        <p className="text-sm text-center">
          Have an account?{" "}
          <a href="/" className="text-blue-600 font-semibold hover:underline">Sign In</a>
        </p>
      </form>
    </div>
  )
}
