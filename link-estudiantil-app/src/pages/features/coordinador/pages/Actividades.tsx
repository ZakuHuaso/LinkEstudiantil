import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface Actividad {
  id: string;
  titulo: string;
  descripcion: string;
  fecha: string;
  estado: "borrador" | "publicada";
  asistentes: number;
  archivo?: string;
  motivo_rechazo?: string;
}

export default function Actividades() {
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const navigate = useNavigate();

  const fetchActividades = async () => {
    const { data, error } = await supabase
      .from("actividades")
      .select("*, inscripciones(count)")
      .order("fecha", { ascending: true });

    if (!error && data) {
      const formateadas = data.map((a: any) => ({
        ...a,
        asistentes: a.inscripciones.length,
      }));
      setActividades(formateadas);
    } else {
      console.error("Error al cargar actividades:", error?.message);
    }
  };

  useEffect(() => {
    fetchActividades();
  }, []);

  const eliminarActividad = async (id: string) => {
    if (!confirm("¿Seguro que quieres eliminar esta actividad?")) return;
    const { error } = await supabase.from("actividades").delete().eq("id", id);
    if (!error) fetchActividades();
    else console.error("Error al eliminar:", error.message);
  };

  const cambiarEstado = async (id: string, nuevoEstado: "borrador" | "publicada") => {
    const { error } = await supabase
      .from("actividades")
      .update({ estado: nuevoEstado, motivo_rechazo: null })
      .eq("id", id);
    if (!error) fetchActividades();
    else console.error("Error al cambiar estado:", error.message);
  };

  const rechazarActividad = async (id: string) => {
    const motivo = prompt("¿Cuál es el motivo del rechazo de esta actividad?");
    if (!motivo) {
      alert("Debe ingresar un motivo para rechazar la actividad.");
      return;
    }

    const { error } = await supabase
      .from("actividades")
      .update({ estado: "borrador", motivo_rechazo: motivo })
      .eq("id", id);

    if (!error) {
      fetchActividades();
      alert("Actividad devuelta a borrador.");
    } else {
      console.error("Error al rechazar actividad:", error.message);
    }
  };

  const FormularioActividad = ({ onActividadCreada }: { onActividadCreada: () => void }) => {
    const [titulo, setTitulo] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [fecha, setFecha] = useState("");
    const [hora, setHora] = useState("");
    const [archivo, setArchivo] = useState<File | null>(null);
    const [archivoUrl, setArchivoUrl] = useState<string>("");

    const handleEliminarArchivo = () => {
      setArchivo(null);
      setArchivoUrl("");
    };

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!titulo || !descripcion || !fecha || !hora) {
        alert("Por favor completa todos los campos obligatorios");
        return;
      }

      let uploadedUrl = archivoUrl;

      if (archivo && !archivoUrl) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("archivos_actividades")
          .upload(`actividades/${Date.now()}-${archivo.name}`, archivo);

        if (uploadError) {
          alert("Error al subir archivo");
          return;
        }

        if (uploadData?.path) {
          const { data: publicData } = supabase.storage
            .from("archivos_actividades")
            .getPublicUrl(uploadData.path);
          uploadedUrl = publicData.publicUrl;
        }
      }

      const { error } = await supabase.from("actividades").insert({
        titulo,
        descripcion,
        fecha: `${fecha}T${hora}`,
        estado: "borrador",
        archivo: uploadedUrl || null,
      });

      if (error) {
        alert("Error al crear actividad");
        console.error(error.message);
      } else {
        alert("Actividad creada correctamente");
        onActividadCreada();
      }
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-full max-w-lg space-y-4 relative">
          <h2 className="text-xl font-bold">Crear nueva actividad</h2>
          <input
            type="text"
            placeholder="Título"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <textarea
            placeholder="Descripción"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            className="w-full p-2 border rounded"
          />
          <div className="flex gap-4">
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              required
              className="p-2 border rounded w-1/2"
            />
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              required
              className="p-2 border rounded w-1/2"
            />
          </div>
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            onChange={(e) => {
              const file = e.target.files?.[0] || null;
              setArchivo(file);
              setArchivoUrl("");
            }}
            className="p-2"
          />

          {archivoUrl || archivo ? (
            <div className="mt-2 flex items-center gap-2">
              <a
                href={archivoUrl || (archivo ? URL.createObjectURL(archivo) : "")}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {archivo ? archivo.name : archivoUrl}
              </a>
              <button
                type="button"
                onClick={handleEliminarArchivo}
                className="ml-2 text-red-600 font-bold hover:text-red-800"
                aria-label="Eliminar archivo"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "1.2rem",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ×
              </button>
            </div>
          ) : null}

          <div className="flex justify-between">
            <button
              type="submit"
              className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setMostrarFormulario(false)}
              className="text-gray-600 hover:underline"
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6 relative">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Gestor de Actividades</h2>
        <button
          onClick={() => setMostrarFormulario(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Crear nueva actividad
        </button>
      </div>

      {mostrarFormulario && (
        <FormularioActividad
          onActividadCreada={() => {
            setMostrarFormulario(false);
            fetchActividades();
          }}
        />
      )}

      <div className="space-y-4">
        {actividades.map((a) => (
          <div
            key={a.id}
            className="p-4 border rounded shadow-sm space-y-1 bg-white"
          >
            <h3 className="text-xl font-semibold">{a.titulo}</h3>
            <p className="text-sm text-gray-600">{a.descripcion}</p>
            <p className="text-sm">Fecha: {new Date(a.fecha).toLocaleDateString("es-CL")}</p>
            <p className="text-sm">Estado: {a.estado}</p>
            <p className="text-sm">Asistentes: {a.asistentes}</p>

            {a.archivo && (
              <p className="text-sm text-blue-600 underline break-all">
                <a href={a.archivo} target="_blank" rel="noopener noreferrer">
                  Ver archivo adjunto
                </a>
              </p>
            )}

            {a.motivo_rechazo && a.estado === "borrador" && (
              <p className="text-sm text-red-600">
                Motivo de rechazo: {a.motivo_rechazo}
              </p>
            )}

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => navigate(`/coordinador/editar-actividad/${a.id}`)}
                className="text-blue-600 hover:underline"
              >
                Editar
              </button>
              <button
                onClick={() => eliminarActividad(a.id)}
                className="text-red-600 hover:underline"
              >
                Eliminar
              </button>
              {a.estado === "borrador" ? (
                <button
                  onClick={() => cambiarEstado(a.id, "publicada")}
                  className="text-green-600 hover:underline"
                >
                  Publicar
                </button>
              ) : (
                <button
                  onClick={() => rechazarActividad(a.id)}
                  className="text-yellow-600 hover:underline"
                >
                  Volver a borrador
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
