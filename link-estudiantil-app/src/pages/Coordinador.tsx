import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function Coordinador() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { titulo: "Eventos y Talleres", link: "/talleres" },
    { titulo: "Actividades programadas", link: "/actividades" },
    { titulo: "Fondos Concursables", link: "/fondos" },
    { titulo: "Propuestas", link: "/propuestas-consejeros" },
  ];

  const acciones = [
    {
      titulo: "Crear Actividad",
      desc: "Publica nuevas actividades",
      icon: "🆕",
      link: "/crear-actividad"
    },
    {
      titulo: "Modificar Actividad",
      desc: "Edita actividades",
      icon: "✏️",
      link: "/modificar-actividad"
    },
    {
      titulo: "Eliminar Actividad",
      desc: "Quita actividades",
      icon: "🗑️",
      link: "/eliminar-actividad"
    },
    {
      titulo: "Propuestas de Consejeros",
      desc: "Aprueba sugerencias",
      icon: "📩",
      link: "/propuestas-consejeros"
    },
    {
      titulo: "Ver Asistencia",
      desc: "Consulta asistencia",
      icon: "📊",
      link: "/asistencia"
    },
    {
      titulo: "Ver Eventos",
      desc: "Explora eventos",
      icon: "📅",
      link: "/eventos"
    },
    {
      titulo: "Ver Talleres",
      desc: "Talleres activos",
      icon: "🛠️",
      link: "/talleres"
    },
    {
      titulo: "Ver Actividades",
      desc: "Todas las actividades",
      icon: "📚",
      link: "/actividades"
    },
    {
      titulo: "Ver Fondos Concursables",
      desc: "Fondos disponibles",
      icon: "💰",
      link: "/fondos"
    },
    {
      titulo: "Cerrar Sesión",
      desc: "Salir del sistema",
      icon: "🔒",
      action: async () => {
        const confirm = window.confirm("¿Estás seguro que deseas cerrar sesión?");
        if (confirm) {
          await supabase.auth.signOut();
          navigate("/");
        }
      }
    }
  ];

  return (
    <div className="flex min-h-screen font-sans bg-gray-100 relative">
      {/* Botón de menú */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed top-4 left-4 z-40 text-2xl bg-white p-2 rounded shadow"
      >
        ☰
      </button>

      {/* Sidebar deslizante */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-[#0f1e54] text-white z-30 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col justify-between h-full">
          <div>
            {/* Logo y perfil */}
            <div className="flex flex-col items-center p-6">
              <img src="/Logo_DuocUC.svg.png" alt="Logo Duoc UC" className="w-32 mb-4" />
              <div className="text-center">
                <img src="/userl.png" alt="User avatar" className="w-16 h-16 rounded-full mx-auto mb-2" />
                <h2 className="text-lg font-semibold">Coordinador</h2>
                <p className="text-sm text-gray-300">Admin</p>
              </div>
            </div>

            {/* Botones */}
            <div className="px-4">
              <h3 className="uppercase text-xs text-gray-400 mb-2">Inicio</h3>
              <div
                onClick={() => navigate("/talleres")}
                className="flex items-center gap-2 cursor-pointer py-2 px-3 my-1 bg-yellow-500 text-black rounded hover:bg-yellow-600"
              >
                <span className="text-lg">🏠</span>
                <span>Dashboard</span>
              </div>

              <h3 className="uppercase text-xs text-gray-400 mt-4 mb-2">Gestión</h3>
              {acciones.slice(0, 9).map((item, i) => (
                <div
                  key={i}
                  onClick={() => navigate(item.link)}
                  className="flex items-center gap-2 cursor-pointer py-2 px-3 my-1 hover:bg-[#1c2f6e] rounded transition"
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.titulo}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Botón cerrar sesión */}
          <div className="p-4">
            <button
              onClick={acciones[9].action}
              className="w-full flex items-center justify-center bg-red-600 hover:bg-red-700 text-white py-2 rounded"
            >
              {acciones[9].icon} {acciones[9].titulo}
            </button>
          </div>
        </div>
      </aside>

      {/* Panel principal */}
      <div className="flex-1 ml-0 lg:ml-64">
        {/* Header */}
        <div className="bg-white px-6 py-4 shadow flex items-center gap-4">
          {tabs.map((tab, i) => (
            <button
              key={i}
              onClick={() => navigate(tab.link)}
              className="bg-[#0f1e54] hover:bg-[#1c2f6e] text-white py-2 px-4 rounded"
            >
              {tab.titulo}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-4">
            <input
              type="text"
              placeholder="Buscar..."
              className="border px-3 py-2 rounded"
            />
            <span className="relative text-blue-500">🔔<span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">0</span></span>
            <span className="relative text-yellow-500">🛠️<span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">0</span></span>
            <span className="relative text-green-500">📩<span className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">0</span></span>
          </div>
        </div>

        {/* Banner */}
        <div className="bg-[#0f1e54] text-white flex justify-between items-center p-10">
          <div>
            <h1 className="text-3xl font-bold">Bienvenid@ a los eventos y talleres de Duoc UC</h1>
          </div>
          <img src="/leave 1.png" alt="Ilustración" className="h-40" />
        </div>
      </div>
    </div>
  );
}
