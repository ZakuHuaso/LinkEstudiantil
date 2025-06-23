  import { FaFacebookF, FaInstagram, FaLinkedinIn } from "react-icons/fa";

  export default function Footer() {
    return (
      <footer className="bg-gray-800 text-gray-300 py-8 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Enlaces */}
          <div>
            <h4 className="text-white font-semibold mb-2">Enlaces útiles</h4>
            <ul className="space-y-1">
              <li><a href="/privacidad" className="hover:underline">Política de privacidad</a></li>
              <li><a href="/terminos" className="hover:underline">Términos y condiciones</a></li>
              <li><a href="/soporte" className="hover:underline">Ayuda / Soporte</a></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h4 className="text-white font-semibold mb-2">Contacto</h4>
            <ul className="space-y-1">
              <li>Email: <a href="mailto:soporte@duocuc.cl" className="hover:underline">soporte@duocuc.cl</a></li>
              <li>Teléfono: <a href="tel:+56212345678" className="hover:underline">+56 2 1234 5678</a></li>
            </ul>
          </div>

          {/* Redes Sociales */}
          <div>
            <h4 className="text-white font-semibold mb-2">Síguenos</h4>
            
<div className="flex space-x-4">
  <a href="https://facebook.com/duocuc" target="_blank" rel="noopener">
    <FaFacebookF className="text-white hover:text-blue-400 w-6 h-6" />
  </a>
  <a href="https://instagram.com/duocuc" target="_blank" rel="noopener">
    <FaInstagram className="text-white hover:text-pink-500 w-6 h-6" />
  </a>
  <a href="https://linkedin.com/school/duoc-uc" target="_blank" rel="noopener">
    <FaLinkedinIn className="text-white hover:text-blue-300 w-6 h-6" />
  </a>
</div>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-gray-500">
          © 2025 DUOC UC – Todos los derechos reservados
        </div>
      </footer>
    )
  }
