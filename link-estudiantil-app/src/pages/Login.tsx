import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"
import { Eye, EyeOff } from "lucide-react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [tipoUsuario, setTipoUsuario] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) navigate("/home")
    }
    checkSession()
  }, [navigate])

  const handleLogin = async (e: React.FormEvent) => {
  e.preventDefault(); // para evitar recarga del form
  setError("");
  setLoading(true);

  


  

  // 1️⃣ Login
  const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (loginError || !loginData.user) {
    setError("Correo o contraseña incorrectos.");
    setLoading(false);
    return;
  }

  const userId = loginData.user.id;

  // 2️⃣ Según el tipo de usuario
  if (tipoUsuario === "estudiante") {
    const { data: alumno } = await supabase
      .from("alumnos")
      .select("id")
      .eq("id", userId)
      .single();

    if (alumno) {
      navigate("/home"); // ruta estudiante
    } else {
      setError("Este correo no está registrado como estudiante.");
    }

  } else if (tipoUsuario === "consejero") {
    const { data: consejero } = await supabase
      .from("consejeros")
      .select("id")
      .eq("id", userId)
      .single();

    if (consejero) {
      navigate("/consejero"); // ruta consejero
    } else {
      setError("Este correo no está registrado como consejero.");
    }

  } else if (tipoUsuario === "coordinador") {
    const { data: coordinador } = await supabase
      .from("coordinadores")
      .select("id")
      .eq("id", userId)
      .single();

    if (coordinador) {
      navigate("/coordinador"); // ruta coordinador
    } else {
      setError("Este correo no está registrado como coordinador.");
    }

  } else {
    setError("Por favor selecciona un tipo de usuario.");
  }

  setLoading(false);
};


  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Formulario */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center">Welcome back</h2>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <label className="block mb-1 text-sm font-medium text-gray-700">Tipo de usuario</label>
          <div className="flex gap-4 mb-4">
            {["estudiante","consejero","coordinador"].map(tipo => (
              <label key={tipo} className="flex items-center gap-2 text-sm capitalize">
                <input
                  type="radio"
                  name="tipo"
                  value={tipo}
                  onChange={e => setTipoUsuario(e.target.value)}
                />
                {tipo}
              </label>
            ))}
          </div>

          <label className="block mb-1 text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />

          <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded pr-10"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(show => !show)}
              className="absolute inset-y-0 right-3 flex items-center text-gray-500"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-3 rounded hover:bg-green-800 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          <p className="text-sm text-center mt-4">
            ¿No tienes cuenta?{" "}
            <a href="/registro" className="text-blue-600 font-semibold hover:underline">
              Regístrate
            </a>
          </p>
        </form>
      </div>

      {/* Imagen de fondo */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/hoja.png')" }}
      />
    </div>
  )
}
