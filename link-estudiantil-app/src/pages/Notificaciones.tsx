import { useEffect, useState } from "react"
import { supabase } from "../lib/supabaseClient"
import { useNavigate } from "react-router-dom"

type Notificacion = {
  id: string
  tipo: string
  mensaje: string
  link?: string
  leido: boolean
  creado_en: string
}

export default function Notificaciones() {
  const [notifs, setNotifs] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const fetch = async () => {
      const { data, error } = await supabase
        .from("notificaciones")
        .select("id, tipo, mensaje, link, leido, creado_en")
        .order("creado_en", { ascending: false })

      if (!error && data) setNotifs(data)
      else console.error("Error fetching notifs:", error)
      setLoading(false)
    }
    fetch()
  }, [])

  const marcarLeido = async (id: string) => {
    await supabase.from("notificaciones").update({ leido: true }).eq("id", id)
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, leido: true } : n))
    )
  }

  if (loading) return <p className="p-6">Cargando notificaciones…</p>
  if (notifs.length === 0) return <p className="p-6 text-gray-500">Sin notificaciones.</p>

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Notificaciones</h2>
      <ul className="space-y-3">
        {notifs.map((n) => (
          <li
  key={n.id}
  className={`p-4 rounded shadow flex justify-between items-start ${
    n.leido ? "bg-gray-100" : "bg-white"
  }`}
>
  <div
    onClick={() => n.link && navigate(n.link)}
    className="cursor-pointer flex-1"
  >
    <p className="font-semibold">{n.mensaje}</p>
    <p className="text-xs text-gray-500">
      {new Date(n.creado_en).toLocaleString()}
    </p>
  </div>
  {!n.leido && (
    <button
      className="ml-4 text-blue-600 text-sm hover:underline"
      onClick={async () => {
        // Marcar como leído en la base
        const { error } = await supabase
          .from("notificaciones")
          .update({ leido: true })
          .eq("id", n.id)
        if (error) {
          console.error("Error marcando leído:", error)
          return
        }
        // Quitar de la lista local
        setNotifs((prev) => prev.filter((notif) => notif.id !== n.id))
      }}
    >
      Marcar leído
    </button>
  )}
</li>
        ))}
      </ul>
    </div>
  )
}