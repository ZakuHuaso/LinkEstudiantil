import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../../../../components/Navbar";
import Footer from "../../../../components/Footer";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import {
  CalendarCheck,
  DollarSign,
  StickyNote,
  CheckCircle,
} from "lucide-react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

import DirectorioConsejeros from "../../../../components/DirectorioConsejeros";

const heroSlides = [
  {
    imagen: "/home.png",
    titulo: "Conecta con tu Carrera",
    texto:
      "Descubre actividades, talleres y oportunidades para participar en DUOC UC.",
  },
  {
    imagen: "/slide2.jpg",
    titulo: "Impulsa tu Futuro",
    texto: "Participa en eventos pensados para ti y tu desarrollo profesional.",
  },
  {
    imagen: "/slide3.jpg",
    titulo: "Sé Parte del Cambio",
    texto: "Envía tus propuestas a tu consejero y transforma tu experiencia estudiantil.",
  },
];

export default function Home() {

  const [loading, setLoading] = useState(true);
  const [actividades, setActividades] = useState<any[]>([]);
  const [eventos, setEventos] = useState<any[]>([]);
  const [filtroTipo, setFiltroTipo] = useState("");
  const navigate = useNavigate();

  const eventosFiltrados = eventos.filter((ev) =>
    filtroTipo ? ev.tipo === filtroTipo : true
  );

  //Colores de actividades
  const colorPorTipo = (tipo: string) => {
  switch (tipo) {
    case "Taller":
      return "#3B82F6"; // azul
    case "Charla":
      return "#8B5CF6"; // violeta
    case "Actividad Deportiva":
      return "#10B981"; // verde
    case "Voluntariado":
      return "#F59E0B"; // naranjo
    case "Feria":
      return "#EC4899"; // rosado
    case "Capacitación":
      return "#6366F1"; // azul-violeta
    case "Cultural":
      return "#F43F5E"; // rojo-rosado
    case "Concurso":
      return "#0EA5E9"; // celeste
    case "Otro":
      return "#6B7280"; // gris
    default:
      return "#6B7280"; // gris por defecto
  }
};

//Constantes para flecha flotante

const [showScroll, setShowScroll] = useState(false);

const checkScroll = () => {
  if (window.scrollY > 300) {
    setShowScroll(true);
  } else {
    setShowScroll(false);
  }
};

const scrollToTop = () => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};

  // Para actividades destacadas
useEffect(() => {
  const fetchDestacadas = async () => {
    const { data, error } = await supabase
      .from("Actividades")
      .select("*")
      .eq("estado", "aprobada")
      .eq("publicar_en_home", true)
      .eq("destacada", true)
      .order("fecha", { ascending: true })
      .limit(5);

    if (!error && data) {
      setActividades(data);
    }
     setLoading(false); // termina la carga
  };

  fetchDestacadas();
}, []);

// Para eventos del calendario (TODAS las actividades)
useEffect(() => {
  const fetchEventos = async () => {
    const { data, error } = await supabase
      .from("Actividades")
      .select("id, titulo, fecha, tipo")
      .eq("estado", "aprobada")
      .eq("publicar_en_home", true)
      .order("fecha", { ascending: true });

    if (!error && data) {
      const eventosCalendar = data.map((a) => ({
        id: a.id,
        title: a.titulo,
        date: a.fecha,
        tipo: a.tipo,
        url: `/actividad/${a.id}`,
        color: colorPorTipo(a.tipo),
      }));

      setEventos(eventosCalendar);
    }
  };

  fetchEventos();

  // Escuchar scroll para el botón flotante
  window.addEventListener("scroll", checkScroll);
  return () => window.removeEventListener("scroll", checkScroll);
}, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />

      {/* Hero Slider */}
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop
        className="h-[500px]"
      >
        {heroSlides.map((slide, i) => (
          <SwiperSlide key={i}>
            <header
              className="relative bg-cover bg-center h-full"
              style={{ backgroundImage: `url('${slide.imagen}')` }}
            >
              <div className="bg-black/60 w-full h-full flex items-center justify-center">
                <div className="text-center text-white px-4">
                  <h1 className="text-4xl md:text-5xl font-bold mb-4">
                    {slide.titulo}
                  </h1>
                  <p className="text-lg md:text-xl mb-6">{slide.texto}</p>
                  <button
                    onClick={() => navigate("/eventos")}
                    className="bg-pink-600 hover:bg-pink-700 px-6 py-3 rounded text-white font-semibold"
                  >
                    Ver Actividades
                  </button>
                </div>
              </div>
            </header>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Accesos Rápidos */}
      <section className="py-12 px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
        {[
          {
            titulo: "Actividades",
            desc: "Participa en eventos aprobados",
            icon: <CalendarCheck className="mx-auto w-8 h-8 text-blue-700" />,
            link: "/eventos",
          },
          {
            titulo: "Fondos",
            desc: "Conoce las iniciativas apoyadas",
            icon: <DollarSign className="mx-auto w-8 h-8 text-yellow-600" />,
            link: "/fondos",
          },
          {
            titulo: "Propuestas",
            desc: "Envía tus ideas a tu consejero",
            icon: <StickyNote className="mx-auto w-8 h-8 text-purple-600" />,
            link: "/requerimiento",
          },
          {
            titulo: "Inscripciones",
            desc: "Gestiona tus actividades inscritas",
            icon: <CheckCircle className="mx-auto w-8 h-8 text-green-600" />,
            link: "/mis-eventos",
          },
        ].map((item, i) => (
          <div
            key={i}
            onClick={() => navigate(item.link)}
            className="bg-blue-50 hover:bg-blue-100 p-6 rounded-lg shadow transition cursor-pointer"
          >
            {item.icon}
            <h3 className="text-lg font-bold mb-1 mt-2 text-blue-900">
              {item.titulo}
            </h3>
            <p className="text-sm text-gray-600">{item.desc}</p>
          </div>
        ))}
      </section>

      {/* Nueva sección: Requerimientos */}
      <section className="max-w-6xl mx-auto flex flex-col md:flex-row items-center bg-blue-50 p-8 rounded-lg space-y-6 md:space-y-0 md:space-x-8 mb-12">
        <img
          src="/requerimientos-illustration.png"
          alt="Enviar requerimientos"
          className="w-full md:w-1/2 rounded-lg shadow"
        />
        <div className="md:w-1/2">
          <h2 className="text-2xl font-bold text-blue-900 mb-4">
            ¿Tienes una idea? ¡Compártela!
          </h2>
          <p className="text-gray-700 mb-6">
            Ahora puedes enviar requerimientos directamente a tu consejero desde
            la plataforma. Sugiere actividades, comparte propuestas o reporta
            incidencias con un clic.
          </p>
          <button
            onClick={() => navigate("/requerimiento")}
            className="bg-blue-600 text-white px-5 py-3 rounded hover:bg-blue-700 transition"
          >
            Enviar Requerimiento
          </button>
        </div>
      </section>

      {/* Sección combinada: Actividades + Calendario */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <h2 className="text-2xl font-bold text-blue-900 mb-8 text-center">
          Actividades y Calendario
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          {/* IZQUIERDA: Actividades destacadas */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Actividades destacadas
            </h3>
            <div className="grid gap-6">
              {loading ? (
  // ✅ SKELETON
  <div className="grid gap-6">
    {Array(3).fill(0).map((_, i) => (
      <div key={i} className="bg-white shadow rounded-lg p-4 animate-pulse">
        <div className="h-6 bg-gray-300 mb-2 rounded" />
        <div className="h-4 bg-gray-200 mb-2 rounded" />
        <div className="h-4 bg-gray-200 mb-2 rounded" />
      </div>
    ))}
  </div>
) : actividades.length > 0 ? (
  // ✅ MOSTRAR ACTIVIDADES
  <div className="grid gap-6">
    {actividades.map((a) => (
      <div
        key={a.id}
        onClick={() => navigate(`/actividad/${a.id}`)}
        className="bg-white shadow rounded-lg p-4 hover:shadow-md hover:scale-[1.02] transition-transform cursor-pointer"
      >
        <h4 className="text-lg font-bold text-blue-800 mb-1">
          {a.titulo}
        </h4>
        <p className="text-sm text-gray-600 mb-2 line-clamp-3">
          {a.descripcion}
        </p>
        <p className="text-sm text-gray-500">
          Fecha: {new Date(a.fecha).toLocaleDateString()}
        </p>
      </div>
    ))}
  </div>
) : (
  // ✅ NO HAY ACTIVIDADES
  <p className="text-gray-500">No hay actividades destacadas.</p>
)}
            </div>
          </div>

          {/* DERECHA: Calendario + filtros */}
          <div>
            <h3 className="text-xl font-semibold text-gray-800 mb-4">
              Calendario de actividades
            </h3>

            {/* Filtros */}
            <div className="flex flex-wrap gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Filtrar por tipo
                </label>
                <select
                  value={filtroTipo}
                  onChange={(e) => setFiltroTipo(e.target.value)}
                  className="border p-2 rounded w-full"
                >
                  <option value="">Todos</option>
                  <option value="Taller">Taller</option>
                  <option value="Charla">Charla</option>
                  <option value="Actividad Deportiva">
                    Actividad Deportiva
                  </option>
                  <option value="Voluntariado">Voluntariado</option>
                  <option value="Feria">Feria</option>
                  <option value="Capacitación">Capacitación</option>
                  <option value="Cultural">Cultural</option>
                  <option value="Concurso">Concurso</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>
            </div>

            {/* Calendario */}
            <div className="bg-white p-4 rounded shadow">
              <FullCalendar
                plugins={[dayGridPlugin]}
                initialView="dayGridMonth"
                locale="es"
                events={eventosFiltrados}
                eventColor={undefined}
                height="auto"
                headerToolbar={{
                  start: "prev,next today",
                  center: "title",
                  end: "",
                }}
              />
            </div>
          </div>
        </div>
      </section>

      <DirectorioConsejeros />
        {/* Botón flotante "Subir arriba" */}
{showScroll && (
  <button
  onClick={scrollToTop}
  className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white text-2xl rounded-full flex items-center justify-center shadow-lg hover:bg-blue-700 transition z-50"
  title="Volver arriba"
>
  ↑
</button>
)}
      <Footer />
    </div>
  );
}
