import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Propuesta {
  id: string;
  requerimiento_id: string;
  consejero_id: string;
  descripcion: string;
  estado: string;
  fecha_envio: string;
  consejero: { nombre: string; correo: string };
}

export default function RevisarPropuestas() {
  const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
  const [mensaje, setMensaje] = useState("");
  const [seleccionada, setSeleccionada] = useState<string>("");

  useEffect(() => {
    const fetchPropuestas = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("Propuestas")
        .select(
          `
        id,
        requerimiento_id,
        consejero_id,
        descripcion,
        estado,
        fecha_envio,
        consejero:consejero_id (nombre, correo)
      `
        )
        .eq("coordinador_id", user.id);
      if (error) {
        console.error("Error cargando propuestas:", error.message);
        return;
      }

      if (data) {
        setPropuestas(
          data.map((p) => ({
            ...p,
            consejero: Array.isArray(p.consejero)
              ? p.consejero[0]
              : p.consejero,
          }))
        );
      }
    };

    fetchPropuestas();
  }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    const { error } = await supabase
      .from("propuestas")
      .update({ estado })
      .eq("id", id);

    if (!error) {
      setPropuestas((prev) =>
        prev.map((p) => (p.id === id ? { ...p, estado } : p))
      );
    }
  };

  const enviarMensaje = async () => {
    const propuesta = propuestas.find((p) => p.id === seleccionada);
    if (!propuesta) return alert("Selecciona una propuesta válida");

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return alert("Usuario no autenticado");

    // Buscar conversación existente
    let { data: conversacionExistente } = await supabase
      .from("conversaciones")
      .select("id")
      .eq("coordinador_id", user.id)
      .eq("consejero_id", propuesta.consejero_id)
      .maybeSingle();

    let conversacionId = conversacionExistente?.id;

    // Crear conversación si no existe
    if (!conversacionId) {
      const { data: nueva, error } = await supabase
        .from("conversaciones")
        .insert({
          coordinador_id: user.id,
          consejero_id: propuesta.consejero_id,
          ultima_fecha: new Date().toISOString(),
          ultimo_mensaje: mensaje || propuesta.descripcion.slice(0, 100),
        })
        .select()
        .single();

      if (error || !nueva) {
        console.error("Error creando conversación:", error?.message);
        return alert("No se pudo crear la conversación.");
      }

      conversacionId = nueva.id;
    }

    // Insertar mensaje
    const { error: mensajeError } = await supabase.from("mensajes").insert({
      conversacion_id: conversacionId,
      emisor_id: user.id,
      receptor_id: propuesta.consejero_id,
      mensaje: `PROPUESTA: ${mensaje || propuesta.descripcion.slice(0, 100)}`, // <-- agrega aquí el prefijo
    });

    if (mensajeError) {
      console.error("Error enviando mensaje:", mensajeError.message);
      return alert("No se pudo enviar el mensaje.");
    }

    // Actualizar conversación
    await supabase
      .from("conversaciones")
      .update({
        ultimo_mensaje:
          mensaje || `PROPUESTA: ${propuesta.descripcion.slice(0, 100)}`,
        ultima_fecha: new Date().toISOString(),
      })
      .eq("id", conversacionId);

    alert("Mensaje enviado correctamente");
    setMensaje("");
    setSeleccionada("");
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">
        Propuestas Recibidas
      </h2>

      <div className="overflow-x-auto mb-8">
        <table className="min-w-full bg-white border text-sm">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-2">ID</th>
              <th className="px-4 py-2">Consejero</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Estado</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Cambiar Estado</th>
            </tr>
          </thead>
          <tbody>
            {propuestas.map((p) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.consejero?.nombre}</td>
                <td className="px-4 py-2">{p.descripcion}</td>
                <td className="px-4 py-2">{p.estado}</td>
                <td className="px-4 py-2">
                  {new Date(p.fecha_envio).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <select
                    value={p.estado}
                    onChange={(e) => cambiarEstado(p.id, e.target.value)}
                    className="border p-1 rounded"
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobada">Aprobada</option>
                    <option value="rechazada">Rechazada</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sección para enviar mensaje */}
      <div className="bg-white p-4 rounded shadow max-w-xl mx-auto space-y-4">
        <h3 className="text-lg font-semibold text-gray-800">
          Enviar mensaje a un consejero
        </h3>

        <select
          className="w-full border p-2 rounded"
          value={seleccionada}
          onChange={(e) => setSeleccionada(e.target.value)}
        >
          <option value="">Selecciona una propuesta</option>
          {propuestas.map((p) => (
            <option key={p.id} value={p.id}>
              {p.consejero?.nombre} - {p.descripcion.slice(0, 30)}...
            </option>
          ))}
        </select>

        <textarea
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          className="w-full border rounded p-2"
          placeholder="Escribe tu mensaje..."
          rows={4}
        />

        <button
          onClick={enviarMensaje}
          className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
        >
          Enviar mensaje
        </button>
      </div>
    </div>
  );
}
