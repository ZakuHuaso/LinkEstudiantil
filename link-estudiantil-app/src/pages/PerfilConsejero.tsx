import { useEffect, useState } from "react";
import {
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { supabase } from "../lib/supabaseClient";

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
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      .select()  // devuelve la fila actualizada
      .single();

    if (error) {
      console.error("Error actualizando perfil:", error);
    } else {
      // conservamos el array consejero intacto
      setPerfil({ ...data, consejero: perfil.consejeros });
      setEditMode(false);
    }

    setLoading(false);
  };

  if (!perfil) {
    return <p className="p-6 text-center text-gray-500">Cargando perfil…</p>;
  }

 const consejero = perfil.consejeros?.[0] ?? { nombre: "", correo: "" };

  return (
  <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
    {/* Header */}
    <div className="bg-purple-800 text-white py-8 relative">
      <div className="container mx-auto px-6 flex items-center">
        <div className="w-28 h-28 rounded-full bg-gray-300 overflow-hidden">
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
              consejero.nombre || "X"
            )}&background=7F3FBF&color=fff&size=128`}
            alt={consejero.nombre}
            className="w-full h-full object-cover"
          />
          </div>
          <div className="ml-6 flex-1">
            <h2 className="text-3xl font-bold">{consejero.nombre}</h2>
            <p className="text-purple-200">{consejero.correo}</p>
          </div>
          <div className="ml-auto flex items-center space-x-2">
            {editMode ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="p-2 bg-green-500 rounded-full hover:bg-green-600"
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
                  className="p-2 bg-red-500 rounded-full hover:bg-red-600"
                >
                  <XMarkIcon className="w-5 h-5 text-white" />
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditMode(true)}
                className="p-2 bg-white bg-opacity-20 rounded-full hover:bg-opacity-30"
              >
                <PencilIcon className="w-5 h-5 text-white" />
              </button>
            )}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute top-1/2 right-0 transform -translate-y-1/2 flex space-x-4 pr-6">
          <div className="w-16 h-16 rounded-full bg-orange-400 bg-opacity-30"></div>
          <div className="w-24 h-24 rounded-full bg-yellow-400 bg-opacity-30"></div>
        </div>
      </div>

      {/* Body */}
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center text-gray-700">
            <EnvelopeIcon className="h-6 w-6 mr-2 text-orange-500" />
            {editMode ? (
              <input
                type="text"
                value={form.discord || ""}
                onChange={(e) =>
                  setForm({ ...form, discord: e.target.value })
                }
                placeholder="Discord ID"
                className="border-b border-gray-300 flex-1 px-1 py-0.5"
              />
            ) : (
              <span>{perfil.discord}</span>
            )}
          </div>
          <div className="flex items-center text-gray-700">
            <MapPinIcon className="h-6 w-6 mr-2 text-orange-500" />
            {editMode ? (
              <input
                type="text"
                value={form.instagram || ""}
                onChange={(e) =>
                  setForm({ ...form, instagram: e.target.value })
                }
                placeholder="Instagram"
                className="border-b border-gray-300 flex-1 px-1 py-0.5"
              />
            ) : (
              <span>{perfil.instagram}</span>
            )}
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Sobre mí</h3>
          {editMode ? (
            <textarea
              rows={4}
              value={form.about || ""}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              className="w-full border-gray-300 border rounded p-2"
            />
          ) : (
            <p className="text-gray-700">{perfil.about}</p>
          )}
        </div>
      </div>
    </div>
  );
}
