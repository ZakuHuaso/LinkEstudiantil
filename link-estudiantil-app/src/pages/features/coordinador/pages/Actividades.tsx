import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";


interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  estado: "borrador" | "publicada";
  asistentes: number;
}

export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const navigate = useNavigate();

  const fetchActividades = async () => {
    const { data, error } = await supabase
      .from("actividades")
      .select("*, inscripciones(count)")
      .order("fecha", { ascending: true });

    if (!error && data) {
      const formateadas = data.map((a: any) => ({
        ...a,
        asistentes: a.inscripciones.length,
      }));
      setActividades(formateadas);
    } else {
      console.error("Error al cargar actividades:", error?.message);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, []);

  const eliminarActividad = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta actividad?")) return;
    const { error } = await supabase.from("actividades").delete().eq("id", id);
    if (!error) fetchActividades();
    else console.error("Error al eliminar:", error.message);
  };

  const cambiarEstado = async (id: string, nuevoEstado: "borrador" | "publicada") => {
    const { error } = await supabase
      .from("actividades")
      .update({ estado: nuevoEstado })
      .eq("id", id);
    if (!error) fetchActividades();
    else console.error("Error al cambiar estado:", error.message);
  };

  return (
    
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Gestor de Actividades</h2>
          <button
            onClick={() => navigate("/coordinador/crear-actividad")}
            className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          >
            Crear nueva actividad
          </button>
        </div>

        <div className="space-y-4">
          {actividades.map((a) => (
            <div
              key={a.id}
              className="p-4 border rounded shadow-sm space-y-1 bg-white"
            >
              <h3 className="text-xl font-semibold">{a.titulo}</h3>
              <p className="text-sm text-gray-600">{a.descripcion}</p>
              <p className="text-sm">Fecha: {new Date(a.fecha).toLocaleDateString("es-CL")}</p>
              <p className="text-sm">Estado: {a.estado}</p>
              <p className="text-sm">Asistentes: {a.asistentes}</p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => navigate(`/coordinador/editar-actividad/${a.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  Editar
                </button>
                <button
                  onClick={() => eliminarActividad(a.id)}
                  className="text-red-600 hover:underline"
                >
                  Eliminar
                </button>
                {a.estado === "borrador" ? (
                  <button
                    onClick={() => cambiarEstado(a.id, "publicada")}
                    className="text-green-600 hover:underline"
                  >
                    Publicar
                  </button>
                ) : (
                  <button
                    onClick={() => cambiarEstado(a.id, "borrador")}
                    className="text-yellow-600 hover:underline"
                  >
                    Volver a borrador
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    
  );
}
