"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Ui/Header";
import { createClient } from "@/utils/supabase/client";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";

interface UserProfile {
  id: string;
  nome: string;
  sobrenome: string;
  username: string;
  bio: string | null;
}

export default function CreatePostPage() {
  const router = useRouter();
  const supabase = createClient();

  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const [newPostData, setNewPostData] = useState({
    nomelocal: "",
    cidade: "",
    estado: "",
    caption: "",
  });

  useEffect(() => {
    async function loadProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error("Você precisa estar logado para criar uma publicação.");
        router.push("/login");
        return;
      }

      const { data: profileData, error } = await supabase
        .from("Perfis")
        .select("id, nome, sobrenome, username, bio")
        .eq("id", user.id)
        .single();

      if (error || !profileData) {
        toast.error("Não foi possível carregar seu perfil.");
        router.push("/");
        return;
      }

      setMyProfile(profileData as UserProfile);
    }

    loadProfile();
  }, []);

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!myProfile) {
      toast.error("Você precisa estar autenticado para criar uma publicação!");
      return;
    }

    setIsUploading(true);
    let finalImageUrl = null;

    if (selectedImage) {
      const fileExt = selectedImage.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random()
        .toString(36)
        .substring(2)}.${fileExt}`;
      const filePath = `${myProfile.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("post_images")
        .upload(filePath, selectedImage);

      if (uploadError) {
        setIsUploading(false);
        toast.error("Erro ao fazer upload da imagem.");
        return;
      }

      const { data: publicUrlData } = supabase.storage
        .from("post_images")
        .getPublicUrl(filePath);

      finalImageUrl = publicUrlData.publicUrl;
    }

    const postToSave = {
      userId: myProfile.id,
      ...newPostData,
      likes: 0,
      comments: 0,
      imagem_url: finalImageUrl,
    };

    const { error } = await supabase.from("Posts").insert([postToSave]);

    if (error) {
      toast.error("Erro ao salvar postagem: " + error.message);
      setIsUploading(false);
      return;
    }

    toast.success("Experiência compartilhada com sucesso!");
    setIsUploading(false);

    router.push("/");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <Header />

      <main className="mx-auto max-w-3xl px-4 py-8">
        <button
          onClick={() => router.back()}
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-slate-300 transition hover:text-teal-300"
        >
          <ArrowLeft size={18} />
          Voltar
        </button>

        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 shadow-md">
          <div className="mb-6">
            <span className="text-sm font-semibold uppercase tracking-wider text-teal-400">
              Compartilhe uma experiência
            </span>

            <h1 className="mt-2 text-3xl font-bold">
              Conte para a comunidade onde você esteve
            </h1>

            <p className="mt-2 text-slate-300">
              Publique uma foto, marque o local e ajude outras pessoas a
              descobrirem bons lugares.
            </p>
          </div>

          <form onSubmit={handleCreatePost} className="space-y-5">
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/50 p-5 text-center">
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2">
                <ImageIcon className="text-slate-400" size={34} />

                <span className="text-sm text-slate-300">
                  {selectedImage
                    ? selectedImage.name
                    : "Adicione uma foto do local"}
                </span>

                <span className="text-xs text-slate-500">
                  Opcional, mas recomendado para destacar sua experiência.
                </span>

                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setSelectedImage(e.target.files[0]);
                    }
                  }}
                />
              </label>

              {selectedImage && (
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="mt-3 text-xs font-medium text-red-400 hover:text-red-300"
                >
                  Remover foto
                </button>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                📍 Qual local você visitou?
              </label>

              <input
                type="text"
                value={newPostData.nomelocal}
                onChange={(e) =>
                  setNewPostData({
                    ...newPostData,
                    nomelocal: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                placeholder="Ex: Café Aurora"
                required
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  🏙 Cidade
                </label>

                <input
                  type="text"
                  value={newPostData.cidade}
                  onChange={(e) =>
                    setNewPostData({
                      ...newPostData,
                      cidade: e.target.value,
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="Ex: Goiânia"
                  required
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-300">
                  🗺 Estado
                </label>

                <input
                  type="text"
                  maxLength={2}
                  value={newPostData.estado}
                  onChange={(e) =>
                    setNewPostData({
                      ...newPostData,
                      estado: e.target.value.toUpperCase(),
                    })
                  }
                  className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                  placeholder="Ex: GO"
                  required
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">
                💬 Como foi sua experiência?
              </label>

              <textarea
                value={newPostData.caption}
                onChange={(e) =>
                  setNewPostData({
                    ...newPostData,
                    caption: e.target.value,
                  })
                }
                className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                placeholder="Compartilhe sua experiência, ambiente, atendimento, produtos ou qualquer detalhe que ajude outras pessoas..."
                rows={5}
                required
              />
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-800 pt-5">
              <button
                type="button"
                onClick={() => router.push("/")}
                className="rounded-xl px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
                disabled={isUploading}
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={isUploading}
                className="rounded-xl bg-teal-500 px-5 py-2.5 font-bold text-slate-950 transition hover:bg-teal-400 disabled:opacity-50"
              >
                {isUploading ? "Publicando..." : "Compartilhar Experiência"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}