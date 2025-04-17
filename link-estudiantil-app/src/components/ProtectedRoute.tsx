import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

type Props = {
  children: React.ReactNode
  allowedRoles: string[] // valores: "estudiante", "consejero", "coordinador"
}

export default function ProtectedRoute({ children, allowedRoles }: Props) {
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const verifyUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser()

      if (error || !user) {
        setAuthorized(false)
        setLoading(false)
        return
      }

      let rol = null

      // Buscar al usuario en cada tabla
      const tablas = [
        { nombre: "alumnos", rol: "estudiante" },
        { nombre: "consejeros", rol: "consejero" },
        { nombre: "coordinadores", rol: "coordinador" },
      ]

      for (const t of tablas) {
        const { data, error } = await supabase
          .from(t.nombre)
          .select("id")
          .eq("id", user.id)
          .single()

        if (data && !error) {
          rol = t.rol
          break
        }
      }

      if (rol && allowedRoles.includes(rol)) {
        setAuthorized(true)
      } else {
        setAuthorized(false)
      }

      setLoading(false)
    }

    verifyUser()
  }, [allowedRoles])

  if (loading) return <p className="text-center mt-10">Verificando acceso...</p>

  return authorized ? <>{children}</> : <Navigate to="/" />
}
