import { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Registro() {
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [carrera, setCarrera] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMensaje("");
  
    if (!correo.endsWith("@duocuc.cl")) {
      setError("Solo se permiten correos @duocuc.cl");
      return;
    }
  
    const { error: signUpError } = await supabase.auth.signUp({
      email: correo,
      password,
      options: {
        data: {
          nombre,
          carrera,
        }
      }
    });
  
    if (signUpError) {
      setError("Error al crear cuenta: " + signUpError.message);
      return;
    }
  
    setMensaje("Registro exitoso. Por favor confirma tu correo electrónico para completar el registro.");
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Registro de Estudiante</h2>
      {error && <p className="text-red-600">{error}</p>}
      {mensaje && <p className="text-green-600">{mensaje}</p>}

      <form onSubmit={handleSubmit}>
        <label>Nombre completo</label>
        <input className="w-full mb-4 p-2 border rounded" value={nombre} onChange={(e) => setNombre(e.target.value)} required />

        <label>Correo DUOC</label>
        <input className="w-full mb-4 p-2 border rounded" type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} required />

        <label>Contraseña</label>
        <input className="w-full mb-4 p-2 border rounded" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <label>Carrera</label>
        <input className="w-full mb-4 p-2 border rounded" value={carrera} onChange={(e) => setCarrera(e.target.value)} required />

        <button className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">Registrarse</button>
      </form>
    </div>
  );
}
