import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Requerimiento = {
  id: string;
  tipo: string;
  descripcion: string;
  fecha_envio: string;
  imagen_url: string;
  alumno: {
    nombre: string;
    correo: string;
  }[];
};

export default function RequerimientosRecibidos() {
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<{url: string, loading: boolean} | null>(null);

  useEffect(() => {
    const fetchRequerimientos = async () => {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) return;

      const { data: consejero, error: consejeroError } = await supabase
        .from("consejeros")
        .select("id")
        .eq("correo", user.email)
        .single();

      if (consejeroError || !consejero) return;

      const { data, error } = await supabase
        .from("requerimientos")
        .select(`
            id,
            tipo,
            descripcion,
            fecha_envio,
            imagen_url,
            alumnos (
              nombre,
              correo
            )
          `)
        .eq("consejero_id", consejero.id);
            
      if (!error && data) {
        const formattedData = data.map(item => ({
          id: item.id as string,
          tipo: item.tipo as string,
          descripcion: item.descripcion as string,
          fecha_envio: item.fecha_envio as string,
          imagen_url: item.imagen_url as string,
          alumno: item.alumnos ? [
            {
              nombre: (item.alumnos as any).nombre as string,
              correo: (item.alumnos as any).correo as string
            }
          ] : []
        }));
        setRequerimientos(formattedData);
      } else {
        console.error("Error al obtener requerimientos:", error);
      }
    };

    fetchRequerimientos();
  }, []);

  const handleVerImagen = async (path: string) => {
    setImagenSeleccionada({url: '', loading: true});
    
    try {
      // Extraer el path relativo del bucket
      const pathRelativo = path.split('/public/imagenes/')[1] || path;
      
      // Obtener URL firmada
      const { data, error } = await supabase
        .storage
        .from('imagenes')
        .createSignedUrl(pathRelativo, 3600); // 1 hora de validez

      if (error) throw error;

      setImagenSeleccionada({
        url: data.signedUrl,
        loading: false
      });
    } catch (error) {
      console.error("Error al obtener imagen:", error);
      // Fallback a URL pública si hay error
      const { data } = supabase.storage
        .from('imagenes')
        .getPublicUrl(path.split('/public/imagenes/')[1] || path);
      
      setImagenSeleccionada({
        url: data.publicUrl,
        loading: false
      });
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6 text-blue-900">
        Requerimientos Recibidos
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border border-gray-200 text-sm">
          <thead className="bg-blue-100 text-left text-gray-700">
            <tr>
              <th className="px-4 py-2">Alumno</th>
              <th className="px-4 py-2">Correo</th>
              <th className="px-4 py-2">Tipo</th>
              <th className="px-4 py-2">Descripción</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Imagen</th>
            </tr>
          </thead>
          <tbody>
            {requerimientos.length > 0 ? (
              requerimientos.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="px-4 py-2">{r.alumno?.[0]?.nombre}</td>
                  <td className="px-4 py-2">{r.alumno?.[0]?.correo}</td>
                  <td className="px-4 py-2">{r.tipo}</td>
                  <td className="px-4 py-2">{r.descripcion}</td>
                  <td className="px-4 py-2">{new Date(r.fecha_envio).toLocaleDateString()}</td>
                  <td className="px-4 py-2">
                    {r.imagen_url ? (
                      <button
                        className="text-blue-600 underline hover:text-blue-800"
                        onClick={() => handleVerImagen(r.imagen_url)}
                      >
                        Ver
                      </button>
                    ) : (
                      "Sin imagen"
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="text-center py-4 text-gray-500">
                  No se encontraron requerimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal para mostrar la imagen */}
      {imagenSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white p-4 rounded shadow-lg max-w-4xl w-full">
            {imagenSeleccionada.loading ? (
              <div className="flex justify-center items-center h-64">
                <p>Cargando imagen...</p>
              </div>
            ) : (
              <>
                <img 
                  src={imagenSeleccionada.url} 
                  alt="Imagen del requerimiento" 
                  className="w-full h-auto rounded max-h-[70vh] object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder-error.jpg';
                    console.error("Error al cargar la imagen:", imagenSeleccionada.url);
                  }}
                />
                <div className="text-right mt-4">
                  <button
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    onClick={() => setImagenSeleccionada(null)}
                  >
                    Cerrar
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}