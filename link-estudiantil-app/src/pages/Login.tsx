import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Login() {
  // Declaro los estados necesarios para manejar el formulario de login
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // Uso useEffect para comprobar si ya hay una sesión activa
  // Si ya hay un usuario logueado, lo redirijo automáticamente al home
  useEffect(() => {
    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Aquí podría validar el rol del usuario para redirigirlo según corresponda
        navigate("/home");
      }
    };
    checkSession();
  }, [navigate]);

  // Esta función maneja el envío del formulario de login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault(); // Evito que el formulario recargue la página
    setError("");
    setLoading(true); // Activo el loading para deshabilitar el botón

    // Valido que se haya seleccionado un tipo de usuario
    if (!tipoUsuario) {
      setError("Debes seleccionar un tipo de usuario.");
      setLoading(false);
      return;
    }

    // Intento autenticar al usuario con su email y contraseña usando Supabase
    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    // Si hay un error o no se obtuvo el usuario, muestro mensaje de error
    if (authError || !data.user) {
      setError("Correo o contraseña incorrectos");
      setLoading(false);
      return;
    }

    // Según el tipo de usuario, defino a qué tabla consultar en Supabase
    const tabla = tipoUsuario === "estudiante"
      ? "alumnos"
      : tipoUsuario === "consejero"
      ? "consejeros"
      : "coordinadores";

    // Hago una consulta a la tabla correspondiente para obtener el perfil del usuario
    const { data: perfil, error: perfilError } = await supabase
      .from(tabla)
      .select("*")
      .eq("id", data.user.id)
      .single();

    // Si no encuentro el perfil, muestro error
    if (!perfil || perfilError) {
      setError("No se encontró el perfil del usuario.");
      setLoading(false);
      return;
    }

    // Si todo está correcto, redirijo al home
    navigate(`/home`);
    setLoading(false);
  };

  return (
    // Estructuro el layout del login con Tailwind CSS
    <div className="min-h-screen flex flex-col md:flex-row">
      
      {/* Columna izquierda: formulario */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <form onSubmit={handleLogin} className="w-full max-w-md bg-white">
          <h2 className="text-2xl font-bold mb-6 text-black text-center">Welcome back</h2>

          {/* Muestro errores en rojo si existen */}
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          {/* Input para seleccionar tipo de usuario */}
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

          {/* Input de correo electrónico */}
          <label className="block mb-1 text-sm font-medium text-gray-700">Email address</label>
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {/* Input de contraseña */}
          <label className="block mb-1 text-sm font-medium text-gray-700">Password</label>
          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 mb-6 border border-gray-300 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {/* Botón de login */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-700 text-white font-semibold py-3 rounded hover:bg-green-800 transition"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>

          {/* Enlace para registrarse */}
          <p className="text-sm text-center mt-4">
            ¿No tienes cuenta?{" "}
            <a href="/registro" className="text-blue-600 font-semibold hover:underline">
              Regístrate
            </a>
          </p>
        </form>
      </div>

      {/* Columna derecha: imagen de fondo */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/hoja.png')" }}
      ></div>
    </div>
  );
}
