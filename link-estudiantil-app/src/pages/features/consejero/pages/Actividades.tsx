import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
  lugar: string;
  tipo: string;
  estado: string;
  imagen_url?: string;
  capacidad: number;
  inscritos: number;
}

export default function ActividadesConsejero() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActividades = async () => {
      setLoading(true);
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      // 1. Obtener ID del consejero por su correo
      const { data: consejero, error: errorCj } = await supabase
        .from("consejeros")
        .select("id")
        .eq("id", auth.user.id)
        .single();

      if (errorCj || !consejero)
        return console.error("Error consiguiendo consejero", errorCj);

      // 2. Obtener propuestas aprobadas de ese consejero
      const { data: propuestas, error: errorProp } = await supabase
        .from("Propuestas")
        .select("id")
        .eq("estado", "aprobada")
        .eq("consejero_id", consejero.id);

      if (errorProp || !propuestas)
        return console.error("Error obteniendo propuestas", errorProp);

      const propuestasIds = propuestas.map((p) => p.id);

      if (propuestasIds.length === 0) {
        setActividades([]);
        setLoading(false);
        return;
      }

      // 3. Buscar actividades que estén relacionadas con esas propuestas
      const { data: actividadesData, error: errorAct } = await supabase
        .from("Actividades")
        .select("*")
        .in("propuesta_id", propuestasIds);

      if (errorAct) {
        console.error("Error cargando actividades", errorAct);
      } else {
        setActividades(actividadesData || []);
      }

      setLoading(false);
    };

    fetchActividades();
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-800">
        Listado de Actividades
      </h2>

      {loading ? (
        <p className="text-center text-gray-500">Cargando actividades…</p>
      ) : actividades.length === 0 ? (
        <p className="text-center text-gray-600">
          No hay actividades aprobadas disponibles.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {actividades.map((act) => (
            <div
              key={act.id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
              <h3 className="text-lg font-semibold text-indigo-700">
                {act.titulo}
              </h3>
              <p className="text-sm text-gray-600">{act.descripcion}</p>
              <p className="text-sm mt-2">
                <strong>Fecha:</strong>{" "}
                {new Date(act.fecha).toLocaleDateString()}
              </p>
              <p className="text-sm">
                <strong>Hora:</strong> {act.hora}
              </p>
              <p className="text-sm">
                <strong>Lugar:</strong> {act.lugar}
              </p>
              <p className="text-sm">
                <strong>Tipo:</strong> {act.tipo}
              </p>
              <p className="text-sm">
                <strong>Estado:</strong> {act.estado}
              </p>
              <p className="text-sm">
                <strong>Inscritos:</strong> {act.inscritos ?? 0} /{" "}
                {act.capacidad}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
