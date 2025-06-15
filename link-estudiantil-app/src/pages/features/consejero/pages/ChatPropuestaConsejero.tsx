import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "../../../../lib/supabaseClient";

interface Mensaje {
  id: string;
  conversacion_id: string;
  emisor_id: string;
  receptor_id: string;
  mensaje: string;
  creado_en: string;
}

export default function ChatPropuestaConsejero() {
  const { id } = useParams<{ id: string }>(); // ID de la conversación
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState("");
  const [miId, setMiId] = useState("");
  const [nombreReceptor, setNombreReceptor] = useState("");
  const [receptorId, setReceptorId] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // Cargar usuario y datos iniciales
  useEffect(() => {
    const fetchInfo = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      setMiId(user.id);

      const { data, error } = await supabase
        .from("conversaciones")
        .select("coordinador_id, coordinadores!coordinador_id (nombre)")
        .eq("id", id)
        .single();

      if (!error && data) {
        setReceptorId(data.coordinador_id);

        const nombre = (data as any).coordinadores?.nombre;
        setNombreReceptor(nombre || "Coordinador");
      } else {
        console.error("Error cargando datos del receptor:", error?.message);
      }
    };

    fetchInfo();
  }, [id]);

  // Cargar mensajes y suscripción en tiempo real
  useEffect(() => {
    const fetchMensajes = async () => {
      const { data, error } = await supabase
        .from("mensajes")
        .select("*")
        .eq("conversacion_id", id)
        .order("creado_en", { ascending: true });

      if (!error && data) {
        setMensajes(data);
      } else {
        console.error("Error cargando mensajes:", error?.message);
      }
    };

    fetchMensajes();

    const canal = supabase
      .channel("mensajes_consejero")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mensajes" },
        (payload) => {
          if (payload.new.conversacion_id === id) {
            setMensajes((prev) => [...prev, payload.new as Mensaje]);
            bottomRef.current?.scrollIntoView({ behavior: "smooth" });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [id]);

  const enviarMensaje = async () => {
    if (!nuevoMensaje.trim() || !receptorId || !miId) return;

    const { error } = await supabase.from("mensajes").insert({
      conversacion_id: id,
      emisor_id: miId,
      receptor_id: receptorId,
      mensaje: nuevoMensaje,
    });

    if (!error) {
      setNuevoMensaje("");
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    } else {
      console.error("Error al enviar mensaje:", error.message);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow h-[80vh] flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Chat con {nombreReceptor}</h2>

      <div className="flex-1 overflow-y-auto space-y-3 px-2">
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`p-3 max-w-[70%] rounded-lg text-sm whitespace-pre-wrap break-words ${
              m.emisor_id === miId
                ? "ml-auto bg-blue-100 text-right"
                : "mr-auto bg-gray-200 text-left"
            }`}
          >
            {m.mensaje}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(m.creado_en).toLocaleTimeString("es-CL", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef}></div>
      </div>

      <div className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Escribe un mensaje..."
          className="flex-1 border rounded px-3 py-2"
          value={nuevoMensaje}
          onChange={(e) => setNuevoMensaje(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && enviarMensaje()}
        />
        <button
          onClick={enviarMensaje}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
