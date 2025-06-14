import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function DirectorioConsejeros() {
  const [data, setData] = useState<any[]>([]);
  const [escuelaActiva, setEscuelaActiva] = useState<number | null>(null);
  const [carreraActiva, setCarreraActiva] = useState<number | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: escuelas, error: e1 } = await supabase.from("escuelas").select("*");

      const { data: carreras, error: e2 } = await supabase.from("carreras").select("*");

      const { data: consejeros, error: e3 } = await supabase.from("consejeros").select("*");

      if (e1 || e2 || e3) return console.error("Error cargando datos");

      // Agrupar jerárquicamente
     const estructura = escuelas.map((escuela) => ({
  ...escuela,
  carreras: carreras
    .filter((c) => c.escuela_id === escuela.id)
    .map((carrera) => ({
      ...carrera,
      consejeros: consejeros.filter((con) => con.carrera_id === carrera.id),
    })),
}));

      setData(estructura);
    };

    fetchData();
  }, []);

  return (
    <section className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-2xl font-bold text-blue-900 mb-6 text-center">
        Directorio de Consejeros
      </h2>

      {data.map((escuela) => (
        <div key={escuela.id} className="mb-6 border rounded shadow">
          <button
            className="w-full text-left p-4 bg-blue-100 hover:bg-blue-200 font-semibold text-blue-800"
            onClick={() =>
              setEscuelaActiva(escuelaActiva === escuela.id ? null : escuela.id)
            }
          >
            {escuela.nombre}
          </button>

          {escuelaActiva === escuela.id && (
            <div className="bg-white">
              {escuela.carreras.map((carrera) => (
                <div key={carrera.id} className="border-t">
                  <button
                    className="w-full text-left px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800"
                    onClick={() =>
                      setCarreraActiva(carreraActiva === carrera.id ? null : carrera.id)
                    }
                  >
                    {carrera.nombre}
                  </button>

                  {carreraActiva === carrera.id && (
                    <ul className="bg-white px-8 py-4 space-y-2">
                      {carrera.consejeros.map((c) => (
                        <li key={c.id} className="text-gray-700">
                          👨‍🏫 <strong>{c.nombre}</strong> — {c.correo}
                        </li>
                      ))}

                      {carrera.consejeros.length === 0 && (
                        <p className="text-sm text-gray-500">Sin consejeros registrados</p>
                      )}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
