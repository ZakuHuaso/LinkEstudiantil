import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function Fondos() {
  const [fondos, setFondos] = useState<any[]>([]);
  const [destacados, setDestacados] = useState<any[]>([]);

  useEffect(() => {
    const fetchFondos = async () => {
      const { data, error } = await supabase
        .from("FondosConcursables")
        .select("*")
        .order("fecha", { ascending: false });

      if (!error && data) {
        setFondos(data.filter((f) => f.estado === "disponible"));
        setDestacados(data.filter((f) => f.destacado && f.estado === "disponible"));
      }
    };

    fetchFondos();
  }, []);

  const formatFecha = (fecha: string) => {
    const d = new Date(fecha);
    return d.toLocaleDateString("es-CL", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
        Fondos Concursables
      </h1>

      {/* Fondos Disponibles */}
      <section className="mb-12">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Fondos disponibles</h2>
        {fondos.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {fondos.map((fondo) => (
              <div
                key={fondo.id}
                className="bg-blue-50 p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold text-blue-800">{fondo.nombre}</h3>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {fondo.descripcion}
                </p>
                {fondo.fecha && (
                  <p className="text-sm text-gray-500 mt-1">
                    Disponible hasta: {formatFecha(fondo.fecha)}
                  </p>
                )}
                {fondo.link_externo && (
                  <a
                    href={fondo.link_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 text-sm font-semibold"
                  >
                    Ver más
                  </a>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay fondos disponibles en este momento.</p>
        )}
      </section>

      {/* Iniciativas destacadas */}
      {destacados.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Iniciativas destacadas</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {destacados.map((fondo) => (
              <div
                key={fondo.id}
                className="bg-yellow-50 p-4 rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="text-lg font-bold text-yellow-700">{fondo.nombre}</h3>
                <p className="text-sm text-gray-700 mt-2 line-clamp-3">
                  {fondo.descripcion}
                </p>
                {fondo.link_externo && (
                  <a
                    href={fondo.link_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-4 bg-yellow-500 text-white px-3 py-2 rounded hover:bg-yellow-600 text-sm font-semibold"
                  >
                    Ver más
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
