import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function CoordinadorDashboard() {
  const [totalPropuestas, setTotalPropuestas] = useState(0);
  const [actividades, setActividades] = useState(0);
  const [talleres, setTalleres] = useState(0);
  const [eventos, setEventos] = useState(0);
  const [ultimasPropuestas, setUltimasPropuestas] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { count: propuestasCount } = await supabase
        .from("Propuestas")
        .select("*", { count: "exact", head: true });

      const { count: actividadesCount } = await supabase
        .from("Actividades")
        .select("id", { count: "exact", head: true });

      const { count: talleresCount } = await supabase
        .from("Actividades")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "taller");

      const { count: eventosCount } = await supabase
        .from("Actividades")
        .select("id", { count: "exact", head: true })
        .eq("tipo", "evento");

      const { data: ultimas } = await supabase
        .from("Propuestas")
        .select("id, titulo, estado, fecha_envio")
        .order("fecha_envio", { ascending: false })
        .limit(5);

      setTotalPropuestas(propuestasCount || 0);
      setActividades(actividadesCount || 0);
      setTalleres(talleresCount || 0);
      setEventos(eventosCount || 0);
      setUltimasPropuestas(ultimas || []);
    };

    fetchData();
  }, []);

  const dataGrafico = [
    { nombre: "Propuestas", cantidad: totalPropuestas },
    { nombre: "Actividades", cantidad: actividades },
    { nombre: "Talleres", cantidad: talleres },
    { nombre: "Eventos", cantidad: eventos },
  ];

  return (
    <>
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Dashboard Coordinador</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-800 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{totalPropuestas}</span>
          <p className="mt-2 text-sm">Total Propuestas</p>
        </div>
        <div className="bg-purple-700 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{actividades}</span>
          <p className="mt-2 text-sm">Total Actividades</p>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{talleres}</span>
          <p className="mt-2 text-sm">Talleres</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{eventos}</span>
          <p className="mt-2 text-sm">Eventos</p>
        </div>
      </div>

      

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Últimas Propuestas Recibidas</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="py-2">Título</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ultimasPropuestas.length > 0 ? (
              ultimasPropuestas.map((prop) => (
                <tr key={prop.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{prop.titulo}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        prop.estado === "aceptado"
                          ? "bg-green-100 text-green-800"
                          : prop.estado === "denegado"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {prop.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">
                    {new Date(prop.fecha_envio).toLocaleDateString("es-CL")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No hay propuestas recientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
