import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Actividad {
  id: number;
  titulo: string;
  descripcion: string;
  fecha: string;
}

export default function ActividadesTable() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedActividad, setSelectedActividad] = useState<Actividad | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [totalParticipantes, setTotalParticipantes] = useState<number | null>(null);

  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase.from("Actividades").select("*");
      if (error) {
        console.error("Error al obtener actividades:", error.message);
      } else {
        setActividades(data || []);
      }
      setLoading(false);
    };

    fetchActividades();
  }, []);

  const fetchTotalParticipantes = async (actividadId: number) => {
    const { count, error } = await supabase
      .from("Inscripciones")
      .select("*", { count: "exact", head: true }) // contar todas las filas
      .eq("actividad_id", actividadId);

    if (error) {
      console.error("❌ Error al contar inscripciones:", error.message);
      setTotalParticipantes(null);
    } else {
      setTotalParticipantes(count ?? 0);
    }
  };


  const openModal = async (actividad: Actividad) => {
    setSelectedActividad(actividad);
    setShowModal(true);
    setTotalParticipantes(null); // reset para mostrar "Cargando..."
    await fetchTotalParticipantes(actividad.id);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedActividad(null);
    setTotalParticipantes(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 mt-8 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">Listado de Actividades</h2>

      {loading ? (
        <p className="text-center text-gray-600">Cargando actividades...</p>
      ) : actividades.length === 0 ? (
        <p className="text-center text-gray-600">No hay actividades disponibles.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300">
            <thead className="bg-blue-100 text-left">
              <tr>
                <th className="px-4 py-2 border-b">Nombre</th>
                <th className="px-4 py-2 border-b">Descripción</th>
                <th className="px-4 py-2 border-b">Fecha</th>
                <th className="px-4 py-2 border-b text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {actividades.map((actividad) => (
                <tr key={actividad.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 border-b">{actividad.titulo}</td>
                  <td className="px-4 py-2 border-b">{actividad.descripcion}</td>
                  <td className="px-4 py-2 border-b">
                    {new Date(actividad.fecha).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-2 border-b text-center">
                    <button
                      onClick={() => openModal(actividad)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Ver más
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedActividad && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg w-full max-w-md relative">
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-800">Detalle de la Actividad</h3>
            <p><span className="font-semibold">Nombre:</span> {selectedActividad.titulo}</p>
            <p className="mt-2"><span className="font-semibold">Descripción:</span> {selectedActividad.descripcion}</p>
            <p className="mt-2">
              <span className="font-semibold">Fecha:</span>{" "}
              {new Date(selectedActividad.fecha).toLocaleDateString("es-CL", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
            <p className="mt-2">
              <span className="font-semibold">Total de Participantes:</span>{" "}
              {totalParticipantes === null ? "Cargando..." : totalParticipantes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
