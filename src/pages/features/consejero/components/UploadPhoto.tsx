import { useState } from "react";
import { supabase } from "../../../../lib/supabaseClient";

interface UploadPhotoProps {
  userId: string; // Id para nombrar la foto (puede ser perfil.id)
  onUploadComplete: (url: string) => void; // Callback con la URL pública
}

export default function UploadPhoto({ userId, onUploadComplete }: UploadPhotoProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      // Sube la imagen, con sobreescritura si ya existía
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file, { upsert: true, contentType: file.type });

      if (uploadError) throw uploadError;

      // Obtiene URL pública
      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error("No se pudo obtener URL pública");

      onUploadComplete(data.publicUrl);
    } catch (err: any) {
      console.error("Error subiendo la imagen:", err.message);
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p className="text-blue-600">Subiendo imagen...</p>}
      {error && <p className="text-red-600">Error: {error}</p>}
    </div>
  );
}
