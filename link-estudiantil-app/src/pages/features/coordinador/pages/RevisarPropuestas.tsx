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
      const { data, error } = await supabase
        .from("propuestas")
        .select(`
          id,
          requerimiento_id,
          consejero_id,
          descripcion,
          estado,
          fecha_envio,
          consejero:consejero_id (nombre, correo)
        `);

      setPropuestas(data.map(p => ({
  ...p,
  consejero: Array.isArray(p.consejero) ? p.consejero[0] : p.consejero,
})));
    };

    fetchPropuestas();
  }, []);

  const cambiarEstado = async (id: string, estado: string) => {
    const { error } = await supabase
      .from("propuestas")
      .update({ estado })
      .eq("id", id);

    if (!error) {
      setPropuestas(prev =>
        prev.map(p => (p.id === id ? { ...p, estado } : p))
      );
    }
  };
  
  const enviarMensaje = async () => {
    const propuesta = propuestas.find(p => p.id === seleccionada);
    if (!propuesta) return alert("Selecciona una propuesta válida");

    const { error } = await supabase.from("mensajes").insert({
      propuesta_id: propuesta.id,
      consejero_id: propuesta.consejero_id,
      mensaje,
    });

    if (!error) {
      alert("Mensaje enviado al consejero");
      setMensaje("");
      setSeleccionada("");
    } else {
      console.error("Error enviando mensaje:", error.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-blue-900 mb-4">Propuestas Recibidas</h2>

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
            {propuestas.map(p => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{p.id}</td>
                <td className="px-4 py-2">{p.consejero?.nombre}</td>
                <td className="px-4 py-2">{p.descripcion}</td>
                <td className="px-4 py-2">{p.estado}</td>
                <td className="px-4 py-2">{new Date(p.fecha_envio).toLocaleDateString()}</td>
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
        <h3 className="text-lg font-semibold text-gray-800">Enviar mensaje a un consejero</h3>

        <select
          className="w-full border p-2 rounded"
          value={seleccionada}
          onChange={(e) => setSeleccionada(e.target.value)}
        >
          <option value="">Selecciona una propuesta</option>
          {propuestas.map(p => (
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
