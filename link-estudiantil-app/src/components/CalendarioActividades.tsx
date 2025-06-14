import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

declare global {
  interface Window {
    FullCalendar: any;
  }
}

export default function CalendarioActividadesCDN() {
  useEffect(() => {
    const fetchEventos = async () => {
      const { data, error } = await supabase
        .from("Actividades")
        .select("id, titulo, fecha, descripcion, estado, publicar_en_home")
        .eq("estado", "aprobada")
        .eq("publicar_en_home", true);

      if (error) {
        console.error("Error al cargar actividades:", error);
        return;
      }

      const eventos = data.map((actividad: any) => ({
        title: actividad.titulo,
        date: actividad.fecha,
        url: `/actividad/${actividad.id}`,
        extendedProps: {
          descripcion: actividad.descripcion,
        },
      }));

      const calendarEl = document.getElementById("calendar");
      if (calendarEl && window.FullCalendar) {
        const calendar = new window.FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          locale: "es",
          events: eventos,
          eventColor: "#2563eb",

          // 🔹 Aquí inyectamos el tooltip HTML
          eventDidMount: function (info: any) {
            const tooltip = info.event.extendedProps.descripcion;
            if (tooltip) {
              info.el.setAttribute("title", tooltip);
            }
          },
        });
        calendar.render();
      }
    };

    fetchEventos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 mb-16">
      <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">
        Calendario de Actividades
      </h2>
      <div id="calendar" className="bg-white p-4 rounded shadow"></div>
    </div>
  );
}
