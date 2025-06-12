import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function FondosConcursables() {
  const [fondos, setFondos] = useState<any[]>([]);

  useEffect(() => {
    const fetchFondos = async () => {
      const { data, error } = await supabase.from("FondosConcursables").select("*");
      if (error) console.error("Error al cargar fondos:", error);
      else setFondos(data);
    };
    fetchFondos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-900 mb-6">Fondos Concursables</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {fondos.map((fondo) => (
          <div
            key={fondo.id}
            className="bg-white p-4 rounded-lg shadow border border-blue-100"
          >
            <h3 className="text-lg font-semibold text-blue-800 mb-2">{fondo.nombre}</h3>
            <p className="text-gray-600">{fondo.descripcion}</p>
            <p className="text-sm text-blue-500 mt-2">Fecha: {fondo.fecha}</p>
          </div>
        ))}
      </div>
    </div>
  );
}