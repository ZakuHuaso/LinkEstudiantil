import { useEffect } from "react";
import { supabase } from "../lib/supabaseClient";

declare global {
  interface Window {
    FullCalendar: any;
  }
}

export default function CalendarioEventosDUOC() {
  useEffect(() => {
    const fetchEventos = async () => {
      const { data, error } = await supabase
        .from("Eventos")
        .select("id, titulo, fecha, descripcion, tipo")
        .eq("tipo", "DUOC UC");

      if (error) return console.error("Error al cargar eventos:", error);

      const eventos = data.map((evento: any) => ({
        title: evento.titulo,
        date: evento.fecha,
        url: `/evento/${evento.id}`,
        extendedProps: {
          descripcion: evento.descripcion,
        },
      }));

      const calendarEl = document.getElementById("calendar");
      if (calendarEl && window.FullCalendar) {
        const calendar = new window.FullCalendar.Calendar(calendarEl, {
          initialView: "dayGridMonth",
          locale: "es",
          events: eventos,
          eventColor: "#10b981",
          eventDidMount: function (info: any) {
            const tooltip = info.event.extendedProps.descripcion;
            if (tooltip) info.el.setAttribute("title", tooltip);
          },
        });
        calendar.render();
      }
    };

    fetchEventos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 mb-16">
      <h2 className="text-2xl font-bold text-center text-green-700 mb-8">
        Calendario de Eventos DUOC UC
      </h2>
      <div id="calendar" className="bg-white p-4 rounded shadow"></div>
    </div>
  );
}