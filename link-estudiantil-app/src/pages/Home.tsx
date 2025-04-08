export default function Home() {
    return (
      <div className="min-h-screen bg-blue-50">
        {/* Barra superior */}
        <div className="bg-blue-900 text-white py-2 px-6 flex justify-between items-center">
          <h1 className="text-sm mx-auto font-medium">
            Postula a los fondos concursables
          </h1>
          <img
            src="/avatar.png" // reemplazá esto por tu imagen real en /public/
            className="w-8 h-8 rounded-full ml-auto"
            alt="Usuario"
          />
        </div>
  
        {/* Banner principal */}
        <div className="w-full">
          <img
            src="/banner.jpg" // reemplazá esto por tu imagen real en /public/
            alt="Banner"
            className="w-full max-h-[300px] object-cover"
          />
        </div>
  
        {/* Sección de botones */}
        <div className="py-10 px-4 flex flex-wrap justify-center gap-6">
          {[
            "Eventos y Talleres",
            "Actividades programados",
            "Fondos Concursables",
            "Propuestas",
          ].map((texto, index) => (
            <button
              key={index}
              className="bg-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-900 transition"
            >
              {texto}
            </button>
          ))}
        </div>
      </div>
    )
  }
  