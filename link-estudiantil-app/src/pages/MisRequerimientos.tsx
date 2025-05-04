import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Requerimiento = {
  id: string;
  tipo: string;
  descripcion: string;
  fecha_envio: string;
  imagen_url: string;
};

export default function MisRequerimientos() {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    const fetchRequerimientos = async () => {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) return;

      const { data, error: reqError } = await supabase
        .from("requerimientos")
        .select("id, tipo, descripcion, fecha_envio, imagen_url")
        .eq("alumno_id", user.id);

      if (!reqError && data) {
        setRequerimientos(data);
      } else {
        console.error("Error al obtener requerimientos del alumno:", reqError);
      }
    };

    fetchRequerimientos();
  }, []);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">Mis Requerimientos</h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-blue-100 text-left text-gray-700">
            <tr>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Imagen</th>
            </tr>
          </thead>
          <tbody>
            {requerimientos.length > 0 ? (
              requerimientos.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.tipo}</td>
                  <td className="px-4 py-2">{r.descripcion}</td>
                  <td className="px-4 py-2">{new Date(r.fecha_envio).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {r.imagen_url ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800"
                        onClick={() => setImagenSeleccionada(r.imagen_url)}
                      >
                        Ver
                      </button>
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No has enviado requerimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para imagen */}
      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
            <img src={imagenSeleccionada} alt="Imagen del requerimiento" className="w-full h-auto rounded" />
            <div className="text-right mt-4">
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={() => setImagenSeleccionada(null)}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
