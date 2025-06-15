import { ReactNode, useEffect, useState } from 'react';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { supabase } from '../../../../lib/supabaseClient'; 

export default function ConsejeroLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [nombreConsejero, setNombreConsejero] = useState(""); // 👈 estado para el nombre

  const notifi = async () => {
    navigate('/notificaciones');
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      navigate('/');
    } else {
      console.error("Error al cerrar sesión:", error.message);
    }
  };

  const navItems = [
    { name: 'Inicio', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6', path: '/consejero/dashboard' },
    { name: 'Requerimientos Recibidos', icon: 'M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z', path: '/consejero/requerimientos-recibidos'},
    { name: 'Crear Propuesta', icon: 'M12 4v16m8-8H4', path: '/consejero/crear-propuesta' },
    { name: 'Mis Propuestas', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', path: '/consejero/mis-propuestas' },
    { name: 'Actividades', icon: 'M7 12l3-3 3 3 4-4M18 14V6M6 18h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/consejero/actividades' },
    { name: 'Chats', icon: 'M7 12l3-3 3 3 4-4M18 14V6M6 18h8a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v10a2 2 0 002 2z', path: '/consejero/historial-chats' },
  ];

  // 👇 Cargar nombre del consejero al montar el layout
  useEffect(() => {
    const fetchNombreConsejero = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("consejeros")
        .select("nombre")
        .eq("id", user.id)
        .single();

      if (!error && data) {
        setNombreConsejero(data.nombre); // ✅ actualizamos el estado
      } else {
        console.error("Error al obtener nombre del consejero:", error);
      }
    };

    fetchNombreConsejero();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col">
        <div className="p-6 text-2xl font-bold text-center border-b border-blue-800">
          DuocUC
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {navItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center px-4 py-2 rounded-md transition-colors duration-200
                ${location.pathname === item.path ? 'bg-blue-700' : 'hover:bg-blue-800'}`}
            >
              <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon}></path>
              </svg>
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Perfil + Logout */}
        <div className="p-4 border-t border-blue-800">
          <Link
            to="/consejero/perfil"
            className="flex items-center px-4 py-2 rounded-md hover:bg-blue-800 transition-colors duration-200 mb-2"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
            Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-red-400 rounded-md hover:bg-blue-800 transition-colors duration-200"
          >
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-6">
        {/* Header */}
        <header className="flex justify-between items-center p-4 rounded-lg ">
          <div className="relative"></div>

          <div className="flex items-center space-x-4">
            {/* Notificacion */}
            <button onClick={notifi} className="p-2 rounded-full hover:bg-gray-200 transition-colors duration-200">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path>
              </svg>
            </button>

            {/* Avatar + Nombre real */}
            <div className="flex items-center space-x-2">
              <img src="https://via.placeholder.com/32" alt="Avatar" className="w-8 h-8 rounded-full" />
              
              <div className="p-1 font-semibold text-gray-800"><span>{nombreConsejero}</span ><p className="text-gray-500 text-sm ">Consejero</p></div>
             
            </div>
          </div>
        </header>

        {/* Outlet */}
        <Outlet />
      </main>
    </div>
  );
}
