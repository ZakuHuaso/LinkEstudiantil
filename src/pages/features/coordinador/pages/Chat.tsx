import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
interface Mensaje {
  id: string;
  conversacion_id: string;
  emisor_id: string;
  mensaje: string;
  creado_en: string;
}

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [nuevoMensaje, setNuevoMensaje] = useState('');
  const [miId, setMiId] = useState('');
  const [nombreConsejero, setNombreConsejero] = useState('');
  const [receptorId, setReceptorId] = useState('');
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();

  // Obtener nombre del consejero y su ID
  useEffect(() => {
    const fetchInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error("Usuario no autenticado.");
        return;
      }
      setMiId(user.id);

      // Primero, obtén los detalles de la conversación para encontrar el consejero_id
      const { data: conversacionData, error: conversacionError } = await supabase
        .from('conversaciones')
        .select('consejero_id') // Suponiendo que tienes una columna consejero_id en tu tabla conversaciones
        .eq('id', id)
        .single();

      if (conversacionError) {
        console.error("Error al obtener la conversación:", conversacionError.message);
        return;
      }

      if (conversacionData && conversacionData.consejero_id) {
        setReceptorId(conversacionData.consejero_id);

        // Ahora, obtén el nombre del consejero usando el consejero_id
        const { data: consejeroData, error: consejeroError } = await supabase
          .from('consejeros')
          .select('nombre')
          .eq('id', conversacionData.consejero_id)
          .single();

        if (consejeroError) {
          console.error("Error al obtener la información del consejero:", consejeroError.message);
          return;
        }

        if (consejeroData) {
          setNombreConsejero(consejeroData.nombre);
        } else {
          console.warn("Consejero no encontrado para el ID:", conversacionData.consejero_id);
        }
      } else {
        console.warn("No se encontró consejero_id para la conversación:", id);
      }
    };

    fetchInfo();
  }, [id]);

  useEffect(() => {
    const fetchMensajes = async () => {
      const { data, error } = await supabase
        .from('mensajes')
        .select('*')
        .eq('conversacion_id', id)
        .order('creado_en', { ascending: true });

      if (!error && data) {
        setMensajes(data);
      } else {
        console.error("Error al obtener mensajes:", error?.message);
      }
    };

    fetchMensajes();

    const canal = supabase
      .channel('mensajes')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'mensajes' },
        (payload) => {
          if (payload.new.conversacion_id === id) {
            setMensajes((prev) => [...prev, payload.new as Mensaje]);
            bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(canal);
    };
  }, [id]);

  const enviarMensaje = async () => {
  if (!nuevoMensaje.trim() || !receptorId || !miId) {
    console.warn("No se puede enviar el mensaje: mensaje vacío, receptorId o miId no definidos.");
    return;
  }

  const { error } = await supabase.from('mensajes').insert({
    conversacion_id: id,
    emisor_id: miId,
    receptor_id: receptorId,
    mensaje: nuevoMensaje,
  });

  if (!error) {
    // 🔹 Actualiza la tabla conversaciones
    const { error: updateError } = await supabase
      .from('conversaciones')
      .update({
        ultimo_mensaje: nuevoMensaje,
        ultima_fecha: new Date().toISOString(),
      })
      .eq('id', id);

    if (updateError) {
      console.error("Error al actualizar conversación:", updateError.message);
    }

    setNuevoMensaje('');
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  } else {
    console.error("Error al enviar mensaje:", error.message);
  }
};


  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow h-[80vh] flex flex-col">
        <button onClick={() => navigate('/coordinador/Historial-chats')} className="text-sm text-blue-600 hover:underline mb-4 flex items-center">
  ← Volver al historial
</button>
      <h2 className="text-2xl font-bold mb-4">Chat con {nombreConsejero || 'Consejero'}</h2>

      <div className="flex-1 overflow-y-auto space-y-3 px-2">
        {mensajes.map((m) => (
          <div
            key={m.id}
            className={`p-3 max-w-[70%] rounded-lg text-sm whitespace-pre-wrap break-words ${
              m.emisor_id === miId
                ? 'ml-auto bg-indigo-100 text-right'
                : 'mr-auto bg-gray-200 text-left'
            }`}
          >
            {m.mensaje}
            <div className="text-xs text-gray-500 mt-1">
              {new Date(m.creado_en).toLocaleTimeString('es-CL', {
                hour: '2-digit',
                minute: '2-digit',
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
          onKeyDown={(e) => e.key === 'Enter' && enviarMensaje()}
        />
        <button
          onClick={enviarMensaje}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}