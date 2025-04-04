import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return setError("Correo o contraseña incorrectos");

    const { data: perfil } = await supabase
      .from("usuarios")
      .select("rol")
      .eq("id", data.user.id)
      .single();

    if (!perfil) return setError("No se encontró el perfil del usuario.");

    switch (perfil.rol) {
      case "estudiante":
        navigate("/estudiante");
        break;
      case "consejero":
        navigate("/consejero");
        break;
      case "coordinador":
        navigate("/coordinador");
        break;
      default:
        setError("Rol no válido.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow w-80">
        <h2 className="text-xl font-bold mb-4">Iniciar Sesión</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <input
          type="email"
          placeholder="Correo"
          className="w-full p-2 mb-3 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-4 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
        >
          Entrar
        </button>
        <p className="mt-4 text-sm text-center">
          ¿No tienes cuenta?{" "}
          <a href="/registro" className="text-blue-600 underline">
            Regístrate aquí
          </a>
        </p>
      </form>
    </div>
  );
}
