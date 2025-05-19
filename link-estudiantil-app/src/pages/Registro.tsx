import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function RegistroAlumno() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [escuelas, setEscuelas] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [escuelaSeleccionada, setEscuelaSeleccionada] = useState("");
  const [carreraSeleccionada, setCarreraSeleccionada] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");

  const navigate = useNavigate();

  // Cargar escuelas
  useEffect(() => {
    const fetchEscuelas = async () => {
      const { data, error } = await supabase.from("escuelas").select("*");
      if (error) {
        console.error("Error al cargar escuelas:", error.message);
        return;
      }
      setEscuelas(data);
    };
    fetchEscuelas();
  }, []);

  // Cargar carreras según escuela
  useEffect(() => {
    const fetchCarreras = async () => {
      if (!escuelaSeleccionada) return;
      const { data, error } = await supabase
        .from("carreras")
        .select("*")
        .eq("escuela_id", escuelaSeleccionada);
      if (error) {
        console.error("Error al cargar carreras:", error.message);
        return;
      }
      setCarreras(data);
    };
    fetchCarreras();
  }, [escuelaSeleccionada]);

  // Enviar registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!correo.endsWith("@duocuc.cl")) {
      setError("Solo se permiten correos @duocuc.cl");
      return;
    }

    if (!carreraSeleccionada) {
      setError("Debes seleccionar una carrera.");
      return;
    }

    // Depuración
    console.log("Enviando registro con:", {
      email: correo,
      password,
      options: {
        data: {
          nombre,
          carrera_id: carreraSeleccionada,
        },
      },
    });

    const { error: signUpError } = await supabase.auth.signUp({
      email: correo,
      password,
      options: {
        data: {
          nombre,
          carrera_id: carreraSeleccionada,
        },
      },
    });

    if (signUpError) {
      setError("Error en signUp: " + signUpError.message);
      return;
    }

    setMensaje("Registro exitoso. Revisa tu correo para confirmar la cuenta.");
      navigate("/", { state: { registrado: true } });

  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Formulario */}
      <div className="md:w-1/2 flex items-center justify-center p-8 bg-white">
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <h2 className="text-2xl font-bold mb-6 text-center text-black">Crea tu cuenta</h2>

          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          {mensaje && <p className="text-green-600 text-sm mb-4 text-center">{mensaje}</p>}

          <label className="block mb-1 text-sm font-medium text-gray-700">Nombre completo</label>
          <input
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />

          <label className="block mb-1 text-sm font-medium text-gray-700">Correo DUOC</label>
          <input
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            placeholder="ejemplo@duocuc.cl"
            required
          />

          <label className="block mb-1 text-sm font-medium text-gray-700">Contraseña</label>
          <input
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label className="block mb-1 text-sm font-medium text-gray-700">Escuela</label>
          <select
            className="w-full p-3 mb-4 border border-gray-300 rounded"
            value={escuelaSeleccionada}
            onChange={(e) => {
              setEscuelaSeleccionada(e.target.value);
              setCarreraSeleccionada("");
            }}
            required
          >
            <option value="">Selecciona una escuela</option>
            {escuelas.map((e: any) => (
              <option key={e.id} value={e.id}>
                {e.nombre}
              </option>
            ))}
          </select>

          <label className="block mb-1 text-sm font-medium text-gray-700">Carrera</label>
          <select
            className="w-full p-3 mb-6 border border-gray-300 rounded"
            value={carreraSeleccionada}
            onChange={(e) => setCarreraSeleccionada(e.target.value)}
            required
          >
            <option value="">Selecciona una carrera</option>
            {carreras.map((c: any) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>

          <button
            type="submit"
            className="w-full bg-green-700 text-white font-semibold py-3 rounded hover:bg-green-800 transition"
          >
            Registrarse
          </button>

          <p className="text-sm text-center mt-4">
            ¿Ya tienes cuenta?{" "}
            <a href="/login" className="text-blue-600 font-semibold hover:underline">
              Inicia sesión
            </a>
          </p>
        </form>
      </div>

      {/* Imagen lateral */}
      <div
        className="hidden md:flex md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/hoja.png')" }}
      ></div>
    </div>
  );
}
