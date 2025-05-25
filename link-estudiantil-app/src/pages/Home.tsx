import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
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
    texto: "Envía tus propuestas y transforma tu experiencia estudiantil.",
  },
];

export default function Home() {
  const [actividades, setActividades] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchActividades = async () => {
      const { data, error } = await supabase
        .from("Actividades")
        .select("*")
        .eq("estado", "aprobada")
        .eq("publicar_en_home", true)
        .order("fecha", { ascending: true })
        .limit(3);

      if (!error) setActividades(data);
    };

    fetchActividades();
  }, []);

  return (
    <div className="bg-white min-h-screen font-sans">
      <Navbar />

      {/* Hero Slider */}
      <Swiper
        modules={[Autoplay]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        loop={true}
        className="h-[500px]"
      >
        {heroSlides.map((slide, index) => (
          <SwiperSlide key={index}>
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

      {/* Actividades Destacadas */}
      <section className="py-10 px-6">
        <h2 className="text-2xl font-bold text-center text-blue-900 mb-8">
          Actividades Destacadas
        </h2>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {actividades.length > 0 ? (
            actividades.map((a) => (
              <div
                key={a.id}
                onClick={() => navigate(`/actividad/${a.id}`)}
                className="bg-white shadow-md rounded-lg p-4 hover:shadow-lg hover:scale-[1.02] transition-transform cursor-pointer"
              >
                <h3 className="text-lg font-semibold text-blue-800 mb-1">
                  {a.titulo}
                </h3>
                <p className="text-sm text-gray-600 mb-2 line-clamp-3">
                  {a.descripcion}
                </p>
                <p className="text-sm text-gray-500">Fecha: {a.fecha}</p>
              </div>
            ))
          ) : (
            <p className="col-span-3 text-center text-gray-500">
              No hay actividades publicadas aún.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
