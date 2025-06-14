import { useEffect, useState } from "react";
import {
  MapPinIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../../../../lib/supabaseClient";

interface PerfilConsejeroRow {
  id: string;
  discord: string;
  instagram: string;
  about: string;
  consejeros: { nombre: string; correo: string }[];
}

export default function PerfilConsejero() {
  const [perfil, setPerfil] = useState<PerfilConsejeroRow | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<Partial<PerfilConsejeroRow>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("PerfilConsejero")
        .select(`
          id,
          discord,
          instagram,
          about,
          consejeros (
            nombre,
            correo
          )
        `)
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error cargando perfil:", error);
      } else {
        setPerfil(data);
        setForm({
          discord: data.discord,
          instagram: data.instagram,
          about: data.about,
        });
      }
    })();
  }, []);

  const handleSave = async () => {
    if (!perfil) return;
    setLoading(true);

    const updates = {
      id: perfil.id,
      discord: form.discord,
      instagram: form.instagram,
      about: form.about,
    };

    const { data, error } = await supabase
      .from("PerfilConsejero")
      .upsert(updates)
      .select()
      .single();

    if (error) {
      console.error("Error actualizando perfil:", error);
    } else {
      setPerfil({ ...data, consejeros: perfil.consejeros });
      setEditMode(false);
    }

    setLoading(false);
  };

  if (!perfil) {
    return <p className="p-6 text-center text-gray-500">Cargando perfil…</p>;
  }

  const consejero = perfil.consejeros?.[0] ?? { nombre: "", correo: "" };

  return (
    <div className="bg-gray-50 min-h-screen py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
        {/* Header */}
        <div className="bg-purple-800 text-white p-6 flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              consejero.nombre || "X"
            )}&background=7F3FBF&color=fff&size=128`}
            alt="Avatar"
            className="w-24 h-24 rounded-full object-cover"
          />
          <div className="flex-1">
            <h2 className="text-2xl font-bold">{consejero.nombre}</h2>
            <p className="text-purple-200">{consejero.correo}</p>
          </div>
          <div className="flex items-center space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 bg-green-500 hover:bg-green-600 rounded-full transition"
                >
                  <CheckIcon className="w-5 h-5 text-white" />
                </button>
                <button
                  onClick={() => {
                    setEditMode(false);
                    setForm({
                      discord: perfil.discord,
                      instagram: perfil.instagram,
                      about: perfil.about,
                    });
                  }}
                  className="p-2 bg-red-500 hover:bg-red-600 rounded-full transition"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="p-2 bg-white/20 hover:bg-white/30 rounded-full transition"
              >
                <PencilIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex items-center space-x-2">
              <EnvelopeIcon className="w-6 h-6 text-blue-500" />
              {editMode ? (
                <input
                  type="text"
                  value={form.discord || ""}
                  onChange={(e) => setForm({ ...form, discord: e.target.value })}
                  placeholder="Discord ID"
                  className="flex-1 border-b border-gray-300 px-1 py-0.5 outline-none"
                />
              ) : (
                <span className="text-gray-700">{perfil.discord}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-6 h-6 text-blue-500" />
              {editMode ? (
                <input
                  type="text"
                  value={form.instagram || ""}
                  onChange={(e) => setForm({ ...form, instagram: e.target.value })}
                  placeholder="Instagram"
                  className="flex-1 border-b border-gray-300 px-1 py-0.5 outline-none"
                />
              ) : (
                <span className="text-gray-700">{perfil.instagram}</span>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Sobre mí</h3>
            {editMode ? (
              <textarea
                rows={4}
                value={form.about || ""}
                onChange={(e) => setForm({ ...form, about: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2"
              />
            ) : (
              <p className="text-gray-700">{perfil.about}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
