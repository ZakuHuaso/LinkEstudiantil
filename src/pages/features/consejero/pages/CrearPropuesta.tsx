import { useState, useEffect } from "react";
import { supabase } from "../../../../lib/supabaseClient";

export default function CrearPropuesta() {
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fechaPropuesta, setFechaPropuesta] = useState("");
  const [coordinadores, setCoordinadores] = useState<{ id: string, nombre: string }[]>([]);
  const [coordinadorId, setCoordinadorId] = useState("");
  const hoy = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const fetchCoordinadores = async () => {
      const { data, error } = await supabase
        .from("coordinadores")
        .select("id, nombre");

      if (!error && data) setCoordinadores(data);
      else console.error("Error al cargar coordinadores:", error?.message);
    };

    fetchCoordinadores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !coordinadorId) return alert("Faltan datos");

    const { error } = await supabase.from("Propuestas").insert([
      {
        titulo,
        descripcion,
        estado: "en revisión",
        consejero_id: user.id,
        coordinador_id: coordinadorId,
        fecha_envio: new Date().toISOString(),
        fecha_propuesta: fechaPropuesta ? new Date(fechaPropuesta).toISOString() : null,
      },
    ]);

    if (error) {
      console.error("Error al enviar propuesta:", error.message);
      alert("Error al enviar propuesta");
    } else {
      alert("Propuesta enviada exitosamente");
      setTitulo("");
      setDescripcion("");
      setFechaPropuesta("");
      setCoordinadorId("");
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4">Crear Nueva Propuesta</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Título</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Descripción</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            maxLength={200}
            className="w-full px-3 py-2 border rounded"
            rows={4}
          />
          <p className="text-sm text-gray-500 mt-1">
            {descripcion.length}/200 caracteres
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium">Fecha propuesta</label>
          <input
            type="date"
            value={fechaPropuesta}
            onChange={(e) => setFechaPropuesta(e.target.value)}
            required
            min={hoy}
            className="w-full px-3 py-2 border rounded"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Selecciona Coordinador</label>
          <select
            value={coordinadorId}
            onChange={(e) => setCoordinadorId(e.target.value)}
            required
            className="w-full px-3 py-2 border rounded"
          >
            <option value="">Selecciona un coordinador</option>
            {coordinadores.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Enviar Propuesta
        </button>
      </form>
    </div>
  );
}