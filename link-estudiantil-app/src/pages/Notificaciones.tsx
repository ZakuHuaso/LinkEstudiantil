import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import StudentNav from "./features/estudiante/components/NavbarEstudiante"; // Asumiendo que esta ruta es correcta para StudentNav
import Footer from "../components/Footer";

type Notificacion = {
  id: string;
  tipo: string;
  mensaje: string;
  link?: string;
  leido: boolean;
  creado_en: string;
};

export default function Notificaciones() {
  const [notifs, setNotifs] = useState<Notificacion[]>([]);
  const [loading, setLoading] = useState(true);
  const [rol, setRol] = useState<string | null>(null);
  const navigate = useNavigate();

  // 🔹 Obtener el rol del usuario
  useEffect(() => {
    const fetchRol = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setRol("sin-rol"); // Establece un valor predeterminado o redirige si no hay usuario
        setLoading(false); // Asegúrate de establecer loading en false incluso si no hay usuario
        return;
      }

      const userId = user.id;

      const { data: alumno } = await supabase
        .from("alumnos")
        .select("id")
        .eq("id", userId)
        .single();

      if (alumno) {
        setRol("estudiante");
        return;
      }

      const { data: consejero } = await supabase
        .from("consejeros")
        .select("id")
        .eq("id", userId)
        .single();

      if (consejero) {
        setRol("consejero");
        return;
      }

      const { data: coordinador } = await supabase
        .from("coordinadores")
        .select("id")
        .eq("id", userId)
        .single();

      if (coordinador) {
        setRol("coordinador");
        return;
      }

      setRol("sin-rol"); // fallback
    };

    fetchRol();
  }, []);

  // 🔹 Obtener las notificaciones
  useEffect(() => {
    // Solo se obtienen las notificaciones una vez que el rol es determinado
    if (rol !== null) {
      const fetch = async () => {
        const { data, error } = await supabase
          .from("notificaciones")
          .select("id, tipo, mensaje, link, leido, creado_en")
          .order("creado_en", { ascending: false });

        if (!error && data) setNotifs(data);
        else console.error("Error fetching notifs:", error);
        setLoading(false);
      };

      fetch();
    }
  }, [rol]); // Depende del rol para asegurar que se carga antes de obtener las notificaciones

  const marcarLeido = async (id: string) => {
    await supabase.from("notificaciones").update({ leido: true }).eq("id", id);
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    );
  };

  // 🔹 Color de fondo dinámico
  const colorFondo = () => {
    if (rol === "estudiante") return "bg-blue-50 border-blue-200";
    if (rol === "consejero") return "bg-green-50 border-green-200";
    if (rol === "coordinador") return "bg-purple-50 border-purple-200";
    return "bg-gray-100";
  };

  // 🔹 Título dinámico
  const tituloPorRol = () => {
    if (rol === "estudiante") return "Notificaciones";
    if (rol === "consejero") return "Notificaciones de Consejero";
    if (rol === "coordinador") return "Panel de Notificaciones - Coordinador";
    return "Notificaciones"; 
  };

  return (
    <>
      <Navbar />
      <StudentNav />
      {rol === "estudiante"}

      <main className="max-w-4xl mx-auto px-4 py-10 min-h-[500px]">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          {tituloPorRol()}
        </h1>

        {loading ? (
          <div className="space-y-4">
            {Array(5).fill(0).map((_, i) => (
              <div
                key={i}
                className="p-5 rounded-lg border shadow-sm animate-pulse bg-gray-100 flex justify-between items-center"
              >
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="w-20 h-6 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>
        ) : notifs.length === 0 ? (
          <p className="text-center text-gray-500 text-lg">
            Sin notificaciones.
          </p>
        ) : (
          <ul className="space-y-4">
            {notifs.map((n) => (
              <li
                key={n.id}
                className={`p-5 rounded-lg border shadow-sm flex justify-between items-start transition ${
                  n.leido ? "bg-gray-100 border-gray-200" : colorFondo()
                }`}
              >
                <div
                  onClick={() => n.link && navigate(n.link)}
                  className="cursor-pointer flex-1"
                >
                  <div className="flex items-center mb-1">
                    <p className="font-semibold text-gray-800">{n.mensaje}</p>
                    {!n.leido && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(n.creado_en).toLocaleString("es-CL", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </div>

                {!n.leido && (
                  <button
                    className="ml-4 text-sm text-blue-700 font-medium hover:underline transition"
                    onClick={() => marcarLeido(n.id)}
                  >
                    Marcar leído
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </main>

      <Footer />
    </>
  );
}