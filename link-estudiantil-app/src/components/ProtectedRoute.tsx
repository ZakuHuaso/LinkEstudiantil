import { useEffect, useState } from "react"
import { Navigate } from "react-router-dom"
import { supabase } from "../lib/supabaseClient"

type Props = {
  children: React.ReactNode
  allowedRoles: string[]
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

      const { data: perfil, error: perfilError } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single()

      if (perfilError || !perfil) {
        setAuthorized(false)
      } else {
        setAuthorized(allowedRoles.includes(perfil.rol))
      }

      setLoading(false)
    }

    verifyUser()
  }, [allowedRoles])

  if (loading) return <p className="text-center mt-10">Verificando acceso...</p>

  return authorized ? <>{children}</> : <Navigate to="/" />
}
