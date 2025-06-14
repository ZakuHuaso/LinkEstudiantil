
import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";


export default function ConsejeroDashboard() {
  const [totalReqs, setTotalReqs] = useState(0);
  const [resueltos, setResueltos] = useState(0);
  const [pendientes, setPendientes] = useState(0);
  const [actividades, setActividades] = useState(0);
  const [ultimosReqs, setUltimosReqs] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) return;

      // Total requerimientos
      const { count: total } = await supabase
        .from("requerimientos")
        .select("*", { count: "exact", head: true })
        .eq("consejero_id", userId);

      // Resueltos
      const { count: res } = await supabase
        .from("requerimientos")
        .select("*", { count: "exact", head: true })
        .eq("consejero_id", userId)
        .in("estado", ["respondido", "aceptado"]);

      // Pendientes
      const { count: pend } = await supabase
        .from("requerimientos")
        .select("*", { count: "exact", head: true })
        .eq("consejero_id", userId)
        .not("estado", "in", '("respondido","aceptado")');


      // Actividades creadas (que son de mis propuestas)
      const { count: acts } = await supabase
        .from("Actividades")
        .select("id", { count: "exact", head: true })
        .in(
          "propuesta_id",
          (
            await supabase
              .from("Propuestas")
              .select("id")
              .eq("consejero_id", userId)
          ).data?.map((p) => p.id) || []
        );

      // Últimos requerimientos
      const { data: ultimos } = await supabase
        .from("requerimientos")
        .select("id, tipo, descripcion, estado, fecha_envio")
        .eq("consejero_id", userId)
        .order("fecha_envio", { ascending: false })
        .limit(5);

      // Setear estados
      setTotalReqs(total || 0);
      setResueltos(res || 0);
      setPendientes(pend || 0);
      setActividades(acts || 0);
      setUltimosReqs(ultimos || []);
    };

    fetchData();
  }, []);

  return (
    <>
      <h1 className="text-3xl font-bold text-blue-900 mb-6">Dashboard Consejero</h1>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        <div className="bg-blue-800 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{totalReqs}</span>
          <p className="mt-2 text-sm">Total Requerimientos</p>
        </div>
        <div className="bg-green-600 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{resueltos}</span>
          <p className="mt-2 text-sm">Requerimientos Resueltos</p>
        </div>
        <div className="bg-yellow-500 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{pendientes}</span>
          <p className="mt-2 text-sm">Requerimientos Pendientes</p>
        </div>
        <div className="bg-purple-700 text-white p-6 rounded-lg shadow flex flex-col items-center">
          <span className="text-2xl font-bold">{actividades}</span>
          <p className="mt-2 text-sm">Actividades Creadas</p>
        </div>
      </div>

      {/* Gráfico - Placeholder */}
      <div className="bg-white p-6 rounded-lg shadow mb-10">
        <h2 className="text-xl font-semibold mb-4">Gráfico de Requerimientos</h2>
        <div className="h-48 flex items-center justify-center text-gray-400">
          Aquí puedes insertar un gráfico (Recharts, Chart.js, etc)
        </div>
      </div>

      {/* Últimos Requerimientos */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Últimos Requerimientos</h2>
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="py-2">Tipo</th>
              <th className="py-2">Descripción</th>
              <th className="py-2">Estado</th>
              <th className="py-2">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {ultimosReqs.length > 0 ? (
              ultimosReqs.map((req) => (
                <tr key={req.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{req.tipo}</td>
                  <td className="py-2">{req.descripcion}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${req.estado === "respondido" || req.estado === "aceptado"
                          ? "bg-green-100 text-green-800"
                          : req.estado === "denegado"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                    >
                      {req.estado.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2">
                    {new Date(req.fecha_envio).toLocaleDateString("es-CL")}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center py-4 text-gray-500">
                  No hay requerimientos recientes.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
