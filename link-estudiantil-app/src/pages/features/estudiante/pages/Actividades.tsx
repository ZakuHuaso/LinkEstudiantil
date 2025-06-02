import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";
import Navbar from "../../../../components/Navbar";
import StudentNav from "../components/NavbarEstudiante";
import Footer from "../../../../components/Footer";

type Actividad = {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  imagen_url: string | null;
  tipo: string;
};

export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener todas las actividades
  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase
        .from("Actividades")
        .select("id, titulo, descripcion, fecha, hora, lugar, imagen_url, tipo")
        .eq("estado", "aprobada")
        .order("fecha", { ascending: true });

      if (error || !data) {
        console.error("Error fetching actividades:", error);
        setLoading(false);
        return;
      }

      // Generar Signed URLs
      const conSignedUrls = await Promise.all(
        data.map(async (act) => {
          if (!act.imagen_url) return { ...act, imagen_url: null };

          const afterBucket = act.imagen_url.split(
            "/object/sign/actividades/"
          )[1];
          const pathInBucket = afterBucket.split("?")[0];

          try {
            const { data: signedData, error: signErr } = await supabase.storage
              .from("actividades")
              .createSignedUrl(pathInBucket, 300);
            if (signErr) throw signErr;
            return { ...act, imagen_url: signedData.signedUrl };
          } catch {
            console.error("No pude firmar URL:", act.imagen_url);
            return { ...act, imagen_url: null };
          }
        })
      );

      setActividades(conSignedUrls);
      setLoading(false);
    };

    fetchActividades();
  }, []);

  // Agrupar por tipo
  const actividadesPorTipo = actividades.reduce((acc, act) => {
    if (!acc[act.tipo]) acc[act.tipo] = [];
    acc[act.tipo].push(act);
    return acc;
  }, {} as Record<string, Actividad[]>);

  return (
    <>
      <Navbar />
      <StudentNav />

      <main className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-8 text-center">
          Actividades
        </h1>

        {loading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    {Array(6).fill(0).map((_, i) => (
      <div key={i} className="bg-white rounded-lg shadow animate-pulse">
        <div className="w-full h-48 bg-gray-300 mb-4 rounded" />
        <div className="h-6 bg-gray-300 mb-2 rounded" />
        <div className="h-4 bg-gray-200 mb-2 rounded" />
        <div className="h-4 bg-gray-200 mb-2 rounded" />
      </div>
    ))}
  </div>
        ) : actividades.length === 0 ? (
          <p className="text-center text-gray-500">No hay actividades.</p>
        ) : (
          Object.keys(actividadesPorTipo).map((tipo) => (
            <section key={tipo} className="mb-12">
              <h2 className="text-2xl font-semibold text-blue-800 mb-4 border-b pb-2">
                {tipo}
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {actividadesPorTipo[tipo].map((a) => (

                  //Navegacion a la actividad elegida, se pasa el id de la actividad
                  <Link
                    key={a.id}
                    to={`/actividad/${a.id}`}
                    className="block bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition"
                  >
                    {a.imagen_url ? (
                      <img
                        src={a.imagen_url}
                        alt={a.titulo}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">Sin imagen</span>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-xl font-semibold text-blue-800">
                        {a.titulo}
                      </h3>
                      <p className="text-gray-700 my-2 line-clamp-3">
                        {a.descripcion}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(a.fecha).toLocaleDateString("es-CL", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}{" "}
                        • {a.hora}
                      </p>
                      <p className="text-sm text-gray-500">{a.lugar}</p>
                      <span className="mt-3 inline-block text-blue-600 hover:underline">
                        Ver detalle →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          ))
        )}
      </main>

      <Footer />
    </>
  );
}
