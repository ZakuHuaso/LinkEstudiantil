import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface ConsejeroInfo {
  id: string;
  nombre: string;
  correo: string;
}

interface Conversacion {
  id: string;
  consejero_id: string;
  ultima_fecha: string | null;
  ultimo_mensaje: string | null;
  consejero: ConsejeroInfo;
}

export default function ChatInboxCoordinador() {
  const [conversaciones, setConversaciones] = useState<Conversacion[]>([]);
  const [consejerosDisponibles, setConsejerosDisponibles] = useState<
    { id: string; nombre: string }[]
  >([]);
  const [nuevoId, setNuevoId] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const fetchConversaciones = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("conversaciones")
      .select(`
        id,
        consejero_id,
        ultima_fecha,
        ultimo_mensaje,
        consejero:consejeros!consejero_id (
          id,
          nombre,
          correo
        )
      `)
      .eq("coordinador_id", user.id)
      .order("ultima_fecha", { ascending: false });

    if (!error && data) {
      setConversaciones(data as unknown as Conversacion[]);
    } else {
      console.error("Error al cargar conversaciones:", error?.message);
    }
  };

  const fetchConsejeros = async () => {
    const { data, error } = await supabase
      .from("consejeros")
      .select("id, nombre");

    if (!error && data) setConsejerosDisponibles(data);
    else console.error("Error al cargar consejeros disponibles:", error?.message);
  };

  const crearConversacion = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !nuevoId) return;

    const { data: existente } = await supabase
      .from("conversaciones")
      .select("id")
      .eq("coordinador_id", user.id)
      .eq("consejero_id", nuevoId)
      .maybeSingle();

    if (existente) {
      navigate(`/coordinador/Chats/${existente.id}`);
      return;
    }

    const { data, error } = await supabase
      .from("conversaciones")
      .insert({
        coordinador_id: user.id,
        consejero_id: nuevoId,
        ultima_fecha: new Date().toISOString(),
        ultimo_mensaje: "Conversación iniciada",
      })
      .select()
      .single();

    if (!error && data) {
      navigate(`/coordinador/Chats/${data.id}`);
    } else {
      console.error("Error al crear conversación:", error?.message);
    }
  };

  useEffect(() => {
    fetchConversaciones();
    fetchConsejeros();
  }, []);

  const conversacionesFiltradas = conversaciones.filter((c) =>
    c.consejero?.nombre?.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Conversaciones</h2>
      <input
        type="text"
        placeholder="Buscar por consejero..."
        value={busqueda}
        onChange={(e) => setBusqueda(e.target.value)}
        className="w-full mb-4 px-3 py-2 border rounded"
      />
      <ul className="space-y-3">
        {conversacionesFiltradas.map((c) => (
          <li
            key={c.id}
            className="p-4 border rounded hover:bg-gray-50 cursor-pointer"
            onClick={() => navigate(`/coordinador/Chats/${c.id}`)}
          >
            <div className="font-semibold text-blue-800">
              {c.consejero?.nombre || "Sin nombre"}
            </div>
            <div className="text-sm text-gray-600">
              {c.ultimo_mensaje || "Sin mensajes aún"}
            </div>
            <div className="text-xs text-gray-400">
              Último mensaje:{" "}
              {c.ultima_fecha
                ? new Date(c.ultima_fecha).toLocaleString("es-CL")
                : "Nunca"}
            </div>
          </li>
        ))}
      </ul>
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">
          Iniciar nueva conversación
        </h3>
        <select
          className="w-full mb-3 p-2 border rounded"
          value={nuevoId}
          onChange={(e) => setNuevoId(e.target.value)}
        >
          <option value="">Selecciona un consejero</option>
          {consejerosDisponibles.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
        <button
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
          onClick={crearConversacion}
          disabled={!nuevoId}
        >
          Crear conversación
        </button>
      </div>
    </div>
  );
}
