// components/StudentNav.tsx
import { NavLink } from "react-router-dom"

export default function StudentNav() {
  const links = [
    { to: "/eventos", label: "Actividades" },
    { to: "/fondos", label: "Fondos" },
    { to: "/requerimiento", label: "Requerimientos" },
    { to: "/mis-eventos", label: "Inscripciones" },
  ]

  return (
    <nav className="bg-white shadow-sm">
      <ul className="max-w-6xl mx-auto flex space-x-8 px-4 md:px-0">
        {links.map((l) => (
          <li key={l.to}>
            <NavLink
              to={l.to}
              className={({ isActive }) =>
                `block py-3 text-sm font-medium transition ${
                  isActive
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-800"
                }`
              }
            >
              {l.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
