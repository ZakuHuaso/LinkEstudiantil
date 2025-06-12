import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export default function AsistenciaDashboard() {
  const [datos, setDatos] = useState<any[]>([]);

  useEffect(() => {
    const fetchAsistencia = async () => {
      const { data: actividades } = await supabase
        .from("Asistencia")
        .select("tipo, id_actividad")
        .neq("tipo", "ausente");

      const resumen: Record<string, number> = {
        Actividades: 0,
        Fondos: 0,
        Talleres: 0,
        Eventos: 0,
      };

      actividades?.forEach((a) => {
        if (a.tipo === "actividad") resumen.Actividades++;
        else if (a.tipo === "fondo") resumen.Fondos++;
        else if (a.tipo === "taller") resumen.Talleres++;
        else if (a.tipo === "evento") resumen.Eventos++;
      });

      setDatos(
        Object.entries(resumen).map(([tipo, cantidad]) => ({ tipo, cantidad }))
      );
    };

    fetchAsistencia();
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold text-blue-800 mb-6 text-center">
        Registro de Asistencia
      </h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={datos} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="tipo" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="cantidad" fill="#3b82f6" name="Participaciones" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}