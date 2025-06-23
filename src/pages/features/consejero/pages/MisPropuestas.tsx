import { useEffect, useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface Propuesta {
    id: number;
    titulo: string;
    descripcion: string;
    estado: string;
    fecha_envio: string;
}


export default function MisPropuestas() {
    const [propuestas, setPropuestas] = useState<Propuesta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPropuestas = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data, error } = await supabase
                .from("Propuestas")
                .select("id, titulo, descripcion, estado, fecha_envio")
                .eq("consejero_id", user.id);


            if (error) {
                console.error("Error al obtener propuestas:", error.message);
            } else {
                setPropuestas(data || []);
            }

            setLoading(false);
        };

        fetchPropuestas();
    }, []);

    return (
        <div className="max-w-6xl mx-auto p-6 mt-8 bg-white rounded shadow">
            <h2 className="text-2xl font-bold mb-6 text-blue-800 text-center">Mis Propuestas</h2>

            {loading ? (
                <p className="text-center text-gray-600">Cargando propuestas...</p>
            ) : propuestas.length === 0 ? (
                <p className="text-center text-gray-600">No tienes propuestas enviadas.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-300">
                        <thead className="bg-blue-100 text-left">
                            <tr>
                                <th className="px-4 py-2 border-b">Título</th>
                                <th className="px-4 py-2 border-b">Descripción</th>
                                <th className="px-4 py-2 border-b">Estado</th>
                                <th className="px-4 py-2 border-b">Fecha Envio</th>
                            </tr>
                        </thead>
                        <tbody>
                            {propuestas.map((propuesta) => (
                                <tr key={propuesta.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 border-b">{propuesta.titulo}</td>
                                    <td className="px-4 py-2 border-b">{propuesta.descripcion}</td>
                                    <td className="px-4 py-2 border-b">
                                        <span className={`px-2 py-1 rounded-full text-sm font-medium
                      ${propuesta.estado === "aprobada" ? "bg-green-100 text-green-700" :
                                                propuesta.estado === "rechazada" ? "bg-red-100 text-red-700" :
                                                    "bg-yellow-100 text-yellow-700"}`}>
                                            {propuesta.estado}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 border-b">
                                        {new Date(propuesta.fecha_envio

                                        ).toLocaleDateString("es-CL", {
                                            year: "numeric",
                                            month: "long",
                                            day: "numeric",
                                        })}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}