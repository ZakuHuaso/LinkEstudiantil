import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Redirigir si ya está logueado
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Opcionalmente podrías consultar qué tipo de usuario es para redirigir a /estudiante, /consejero o /coordinador
        navigate("/home");
      }
    };
    checkSession();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!tipoUsuario) {
      setError("Debes seleccionar un tipo de usuario.");
      setLoading(false);
      return;
    }

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    const tabla = tipoUsuario === "estudiante"
      ? "alumnos"
      : tipoUsuario === "consejero"
      ? "consejeros"
      : "coordinadores";

    const { data: perfil, error: perfilError } = await supabase
      .from(tabla)
      .select("*")
      .eq("id", data.user.id)
      .single();

    if (!perfil || perfilError) {
      setError("No se encontró el perfil del usuario.");
      setLoading(false);
      return;
    }

    navigate(`/${tipoUsuario}`);
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">Welcome back</h2>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <label className="block mb-1 text-sm font-medium text-gray-700">Tipo de usuario</label>
          <div className="flex gap-4 mb-4">
            {["estudiante", "consejero", "coordinador"].map(tipo => (
              <label key={tipo} className="flex items-center gap-2 text-sm capitalize">
                <input
                  type="radio"
                  name="tipo"
                  value={tipo}
                  onChange={(e) => setTipoUsuario(e.target.value)}
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

          <p className="text-sm text-center mt-4">
            ¿No tienes cuenta?{" "}
            <a href="/registro" className="text-blue-600 font-semibold hover:underline">
              Regístrate
            </a>
          </p>
        </form>
      </div>

      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/hoja.png')" }}
      ></div>
    </div>
  );
}
