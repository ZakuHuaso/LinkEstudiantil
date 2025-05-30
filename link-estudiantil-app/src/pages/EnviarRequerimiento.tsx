import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../components/Navbar";
import StudentNav from "../pages/NavbarEstudiante";
import Footer from "../components/Footer";
import { Bell } from "lucide-react";

type Requerimiento = {
  id: string;
  tipo: string;
  descripcion: string;
  fecha_envio: string;
  imagen_url?: string;
  estado: string;
  respuesta?: string;
};

export default function RequerimientosPage() {
  // Estado de la tabla
  const [requerimientos, setRequerimientos] = useState<Requerimiento[]>([]);
  const [imagenSeleccionada, setImagenSeleccionada] = useState<string | null>(
    null
  );
  const [tablaLoading, setTablaLoading] = useState(true);

  // Estado del formulario
  const [tipo, setTipo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consejero, setConsejero] = useState<{
    id: string;
    nombre: string;
  } | null>(null);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  // Estados para filtros y paginación
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");

  // Lógica para filtrar
  const requerimientosFiltrados = requerimientos
    .filter((r) => (filtroTipo ? r.tipo === filtroTipo : true))
    .filter((r) => (filtroEstado ? r.estado === filtroEstado : true))
    .filter((r) =>
  filtroFecha
    ? r.fecha_envio.slice(0, 10) === filtroFecha
    : true
);

  // Lógica para paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = requerimientosFiltrados.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const totalPages = Math.ceil(requerimientosFiltrados.length / itemsPerPage);

  // Fetch mis requerimientos
  useEffect(() => {
    const fetchReqs = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("requerimientos")
        .select(
          "id, tipo, descripcion, fecha_envio, imagen_url, estado, respuesta"
        )
        .eq("alumno_id", user.id)
        .order("fecha_envio", { ascending: false });

      if (!error && data) setRequerimientos(data);
      else console.error("Error al cargar requerimientos:", error);
      setTablaLoading(false);
    };
    fetchReqs();
  }, []);

  // Fetch consejero para el formulario
  useEffect(() => {
    const obtenerConsejero = async () => {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) return;

      const { data: alumno } = await supabase
        .from("alumnos")
        .select("carrera_id")
        .eq("id", authData.user.id)
        .single();
      if (!alumno) return;

      const { data: consejeros } = await supabase
        .from("consejeros")
        .select("id, nombre")
        .eq("carrera_id", alumno.carrera_id)
        .limit(1);
      if (consejeros?.length) setConsejero(consejeros[0]);
    };
    obtenerConsejero();
  }, []);

  // Enviar nuevo requerimiento
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");
    setFormLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !consejero) {
      setFormError("Necesitas estar logueado y con un consejero asignado.");
      setFormLoading(false);
      return;
    }

    let imagenUrl: string | null = null;
    if (imagen) {
      const fileName = `${user.id}-${Date.now()}`;
      const { error: uploadError } = await supabase.storage
        .from("imagenes")
        .upload(`requerimientos/${fileName}`, imagen);
      if (uploadError) {
        setFormError("Error subiendo imagen.");
        setFormLoading(false);
        return;
      }
      const { data: urlData } = supabase.storage
        .from("imagenes")
        .getPublicUrl(`requerimientos/${fileName}`);
      imagenUrl = urlData.publicUrl;
    }

    const { error: insertError } = await supabase
      .from("requerimientos")
      .insert([
        {
          alumno_id: user.id,
          tipo,
          descripcion,
          imagen_url: imagenUrl,
          consejero_id: consejero.id,
          fecha_envio: new Date().toISOString(),
        },
      ]);
    setFormLoading(false);
    if (insertError) return setFormError("Error enviando requerimiento.");
    setFormSuccess("✅ Requerimiento enviado!");

    // refrescar la tabla
    setTablaLoading(true);
    const { data } = await supabase
      .from("requerimientos")
      .select(
        "id, tipo, descripcion, fecha_envio, imagen_url, estado, respuesta"
      )
      .eq("alumno_id", user.id)
      .order("fecha_envio", { ascending: false });
    if (data) setRequerimientos(data);
    setTablaLoading(false);

    // limpiar form
    setTipo("");
    setDescripcion("");
    setImagen(null);
    setPreviewUrl(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImagen(file);
    setPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  return (
    <>
      <Navbar />
      <StudentNav />

      <main className="max-w-4xl mx-auto py-8 space-y-12">
        {/* Tabla de Mis Requerimientos */}
        <section>
  <h2 className="text-2xl font-bold text-blue-900 mb-4">
    Mis Requerimientos
  </h2>

  {/* Filtros */}
  <div className="flex flex-wrap gap-4 mb-4">
    {/* Tipo */}
    <div>
      <label className="block text-sm font-medium mb-1">Filtrar por tipo</label>
      <select
        value={filtroTipo}
        onChange={(e) => {
          setFiltroTipo(e.target.value);
          setCurrentPage(1);
        }}
        className="border p-2 rounded"
      >
        <option value="">Todos</option>
        <option value="Actividad">Actividad</option>
        <option value="Sugerencia">Sugerencia</option>
        <option value="Otro">Otro</option>
      </select>
    </div>

    {/* Estado */}
    <div>
      <label className="block text-sm font-medium mb-1">Filtrar por estado</label>
      <select
        value={filtroEstado}
        onChange={(e) => {
          setFiltroEstado(e.target.value);
          setCurrentPage(1);
        }}
        className="border p-2 rounded"
      >
        <option value="">Todos</option>
        <option value="pendiente">Pendiente</option>
        <option value="respondido">Respondido</option>
        <option value="aceptado">Aceptado</option>
        <option value="denegado">Denegado</option>
      </select>
    </div>

    {/* Fecha */}
    <div>
      <label className="block text-sm font-medium mb-1">Filtrar por fecha</label>
      <input
        type="date"
        value={filtroFecha}
        onChange={(e) => {
          setFiltroFecha(e.target.value);
          setCurrentPage(1);
        }}
        className="border p-2 rounded"
      />
    </div>
  </div>

  {/* Tabla */}
  {tablaLoading ? (
    <p className="text-gray-500">Cargando...</p>
  ) : (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 text-sm">
        <thead className="bg-blue-100 text-left text-gray-700">
          <tr>
            <th className="px-4 py-2">Tipo</th>
            <th className="px-4 py-2">Descripción</th>
            <th className="px-4 py-2">Fecha</th>
            <th className="px-4 py-2">Estado</th>
            <th className="px-4 py-2">Respuesta</th>
            <th className="px-4 py-2">Imagen</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-2">{r.tipo}</td>
                <td className="px-4 py-2">{r.descripcion}</td>
                <td className="px-4 py-2">
                  {new Date(r.fecha_envio).toLocaleDateString()}
                </td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs ${
                      r.estado === "respondido" || r.estado === "aceptado"
                        ? "bg-green-100 text-green-800"
                        : r.estado === "denegado"
                        ? "bg-red-100 text-red-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {r.estado.toUpperCase()}
                  </span>
                </td>
                <td className="px-4 py-2">
                  {r.respuesta || <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-2">
                  {r.imagen_url ? (
                    <button
                      className="text-blue-600 underline"
                      onClick={() => setImagenSeleccionada(r.imagen_url!)}
                    >
                      Ver
                    </button>
                  ) : (
                    "—"
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
  )}

  {/* Paginación */}
  {totalPages > 1 && (
    <div className="flex justify-center mt-6 space-x-2">
      <button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &lt;
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          onClick={() => setCurrentPage(i + 1)}
          className={`px-3 py-1 border rounded ${
            currentPage === i + 1 ? "bg-blue-500 text-white" : ""
          }`}
        >
          {i + 1}
        </button>
      ))}

      <button
        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
        disabled={currentPage === totalPages}
        className="px-3 py-1 border rounded disabled:opacity-50"
      >
        &gt;
      </button>
    </div>
  )}

  {/* Modal imagen */}
  {imagenSeleccionada && (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded shadow-lg max-w-md w-full">
        <img
          src={imagenSeleccionada}
          alt="Preview"
          className="w-full h-auto rounded"
        />
        <div className="text-right mt-4">
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            onClick={() => setImagenSeleccionada(null)}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )}
</section>

        {/* Formulario de Envío */}
        <section className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition">
          <h2 className="text-2xl font-bold mb-4 border-b-2 border-blue-600 inline-block">
            Enviar Requerimiento
          </h2>

          {consejero && (
            <p className="text-gray-700 mb-3">
              Tu requerimiento se enviará a: <strong>{consejero.nombre}</strong>
            </p>
          )}
          {formError && <p className="text-red-600 mb-3">{formError}</p>}
          {formSuccess && <p className="text-green-600 mb-3">{formSuccess}</p>}

          <form onSubmit={handleSubmit} className="grid gap-4">
            <div>
              <label className="block mb-1 font-medium">Tipo</label>
              <select
                className="w-full p-3 border border-gray-300 rounded focus:ring-blue-400 focus:ring-2"
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
                required
              >
                <option value="">Selecciona</option>
                <option value="Actividad">Actividad</option>
                <option value="Sugerencia">Sugerencia</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium">Descripción</label>
              <textarea
                className="w-full p-3 border border-gray-300 rounded focus:ring-blue-400 focus:ring-2"
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                required
                maxLength={300} // máximo 300 caracteres
              />
              <p className="text-sm text-gray-500 mt-1 text-right">
                {descripcion.length}/300 caracteres
              </p>
            </div>

            <div>
              <label className="block mb-1 font-medium">
                Imagen (opcional)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="focus:outline-none"
              />
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="preview"
                  className="w-24 h-24 object-cover rounded mt-2 border"
                />
              )}
            </div>

            <button
              type="submit"
              disabled={formLoading}
              className="w-full bg-blue-600 text-white py-3 rounded flex items-center justify-center hover:bg-blue-700 transition"
            >
              {formLoading ? (
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8H4z"
                  />
                </svg>
              ) : (
                <Bell className="h-5 w-5 mr-2" />
              )}
              {formLoading ? "Enviando…" : "Enviar"}
            </button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}
