import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "./Navbar";
import StudentNav from "../pages/features/estudiante/components/NavbarEstudiante";
import Footer from "./Footer";

interface Consejero {
  nombre: string;
  correo: string;
}

interface Perfil {
  discord: string;
  instagram: string;
  about: string;
  fotoperfil: string;
  consejero: Consejero;
}

export default function PerfilConsejeroAlumno() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [carreraNombre, setCarreraNombre] = useState("");

  useEffect(() => {
    const fetchPerfil = async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;

      // Obtener carrera del alumno
      const { data: alumnoData } = await supabase
        .from("alumnos")
        .select("carrera_id")
        .eq("id", auth.user.id)
        .single();

      if (!alumnoData) return;

      // Obtener nombre de la carrera
      const { data: carreraData } = await supabase
        .from("carreras")
        .select("nombre")
        .eq("id", alumnoData.carrera_id)
        .single();

      if (carreraData) setCarreraNombre(carreraData.nombre);

      // Buscar consejero de esa carrera
      const { data: consejeroData } = await supabase
        .from("consejeros")
        .select("id")
        .eq("carrera_id", alumnoData.carrera_id)
        .maybeSingle();

      if (!consejeroData) return;

      // Obtener perfil del consejero
      const { data, error } = await supabase
        .from("PerfilConsejero")
        .select(`
          discord,
          instagram,
          about,
          fotoperfil,
          consejero:consejero_id (
            nombre,
            correo
          )
        `)
        .eq("consejero_id", consejeroData.id)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error al cargar perfil:", error.message);
      } else if (data) {
        setPerfil({
          ...data,
          consejero: Array.isArray(data.consejero)
            ? data.consejero[0]
            : data.consejero,
        });
      }
    };

    fetchPerfil();
  }, []);

  if (!perfil) {
    return <p className="text-center mt-10">Cargando perfil del consejero...</p>;
  }

  return (
    <>
      <Navbar />
      <StudentNav />
      <div className="max-w-xl mx-auto mt-10 mb-20 px-4">
        <h1 className="text-2xl font-bold text-blue-800 mb-1 text-center">{carreraNombre}</h1>
        <p className="text-center text-gray-600 mb-6">Estos son tus consejeros</p>

        <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center">
          {/* Imagen del consejero */}
          <div className="mb-4">
            {perfil.fotoperfil ? (
              <img
                src={perfil.fotoperfil}
                
                className="w-32 h-32 object-cover rounded-full border-4 border-blue-500 shadow"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-300 rounded-full flex items-center justify-center text-gray-600">
                Sin foto
              </div>
            )}
          </div>

          {/* Info básica */}
          <h2 className="text-xl font-semibold mb-1">{perfil.consejero.nombre}</h2>
          <p className="text-gray-600 mb-4">{perfil.consejero.correo}</p>

          {/* Sobre mí */}
          <div className="text-center mb-4">
            <h3 className="font-semibold text-gray-700 mb-1">Sobre mí</h3>
            <p className="text-gray-800 text-sm">
              {perfil.about || "Sin descripción."}
            </p>
          </div>

          {/* Redes */}
          <div className="space-y-1 text-sm text-center">
            {perfil.discord && (
              <p>
                <strong>Discord:</strong> {perfil.discord}
              </p>
            )}
            {perfil.instagram && (
              <p>
                <strong>Instagram:</strong> @{perfil.instagram}
              </p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
