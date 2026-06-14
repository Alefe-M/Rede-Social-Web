"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Ui/Header";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { Trash2 } from "lucide-react"; // 🎯 Ícone de lixeira adicionado

interface ProfileData {
  id: string;
  nome: string;
  sobrenome: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
}

interface Post {
  postId: string;
  created_at: string;
  nomelocal: string;
  cidade: string;
  estado: string;
  caption: string;
  likes: number;
  comments: number;
  imagem_url?: string; // 🎯 Coluna de imagem adicionada
}

interface VisitedPlace {
  name: string;
  category: string;
}

export default function ProfilePage() {
  const supabase = createClient();
  const params = useParams();
  const usernameUrl = params?.username as string;

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [userPosts, setUserPosts] = useState<Post[]>([]);
  const [followersCount, setFollowersCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  useEffect(() => {
    if (!usernameUrl) {
      setLoading(false);
      return;
    }

    async function loadProfileData() {
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("Perfis")
          .select("id, nome, sobrenome, username, bio, avatar_url")
          .eq("username", usernameUrl)
          .single();

        if (profileError || !profileData) {
          setLoading(false);
          return;
        }

        setProfile(profileData as ProfileData);
        setBioInput(profileData.bio || "");

        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        if (currentUser) {
          setCurrentUserId(currentUser.id);
          
          if (currentUser.id === profileData.id) {
            setIsOwner(true);
          } else {
            const { data: followData } = await supabase
              .from("Seguidores")
              .select("id")
              .eq("seguidor_id", currentUser.id)
              .eq("seguindo_id", profileData.id)
              .single();

            if (followData) setIsFollowing(true);
          }
        }

        // 🎯 Buscando a imagem_url junto com o resto dos dados
        const { data: postsData, error: postsError } = await supabase
          .from("Posts")
          .select("postId, created_at, nomelocal, cidade, estado, caption, likes, comments, imagem_url")
          .eq("userId", profileData.id)
          .order("created_at", { ascending: false });

        if (!postsError && postsData) setUserPosts(postsData as unknown as Post[]);

        const { count, error: followersError } = await supabase
          .from("Seguidores")
          .select("*", { count: "exact", head: true })
          .eq("seguindo_id", profileData.id);

        if (!followersError && count !== null) setFollowersCount(count);

      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
      } finally {
        setLoading(false);
      }
    }

    loadProfileData();
  }, [usernameUrl]);

  const handleSaveBio = async () => {
    if (!profile) return;
    const { error } = await supabase
      .from("Perfis")
      .update({ bio: bioInput })
      .eq("id", profile.id);

    if (error) {
      toast.error("Erro ao atualizar biografia.");
    } else {
      setProfile({ ...profile, bio: bioInput });
      setIsEditingBio(false);
      toast.success("Biografia atualizada!");
    }
  };

  const toggleFollow = async () => {
    if (!currentUserId || !profile) {
      toast.error("Você precisa estar logado para seguir alguém.");
      return;
    }

    if (isFollowing) {
      const { error } = await supabase
        .from("Seguidores")
        .delete()
        .eq("seguidor_id", currentUserId)
        .eq("seguindo_id", profile.id);

      if (!error) {
        setIsFollowing(false);
        setFollowersCount((prev) => prev - 1);
        toast.success(`Você deixou de seguir ${profile.nome}`);
      }
    } else {
      const { error } = await supabase
        .from("Seguidores")
        .insert([{ seguidor_id: currentUserId, seguindo_id: profile.id }]);

      if (!error) {
        setIsFollowing(true);
        setFollowersCount((prev) => prev + 1);
        toast.success(`Você agora segue ${profile.nome}`);
      }
    }
  };

  // 🎯 Lógica para excluir o post direto da página de perfil
  const handlePostDelete = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;

    try {
      const { error } = await supabase
        .from("Posts")
        .delete()
        .eq("postId", postId);

      if (error) throw error;

      toast.success("Postagem excluída com sucesso!");
      setUserPosts((prev) => prev.filter((p) => p.postId !== postId));
    } catch (err) {
      console.error("Erro ao excluir:", err);
      toast.error("Erro ao excluir postagem. Verifique sua conexão.");
    }
  };

  const visitedPlaces: VisitedPlace[] = Array.from(
    new Set(userPosts.map((p) => p.nomelocal))
  ).map((name) => ({ name, category: "Local Registrado" }));

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="flex justify-center items-center py-20">
          <p className="text-slate-400 animate-pulse">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-950 text-white">
        <Header />
        <div className="text-center py-20 space-y-3">
          <h1 className="text-2xl font-bold text-red-400">🤔 Perfil não encontrado</h1>
          <p className="text-slate-400">O usuário @{usernameUrl} não existe no sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            
            <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-teal-100 text-4xl font-bold text-teal-700 shadow-inner">
              {profile.nome ? profile.nome.charAt(0) : "?"}
            </div>

            <div className="flex-1 space-y-1">
              <p className="text-sm font-semibold text-teal-300">Perfil de usuário</p>

              <h1 className="text-4xl font-bold tracking-tight">
                {profile.nome} {profile.sobrenome}
              </h1>
              <p className="text-slate-400">@{profile.username}</p>

              <div className="pt-2">
                {isEditingBio ? (
                  <div className="mt-2 space-y-2 max-w-2xl">
                    <textarea
                      value={bioInput}
                      onChange={(e) => setBioInput(e.target.value)}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-sm text-white focus:border-teal-500 focus:outline-none"
                      rows={3}
                      placeholder="Escreva algo sobre você..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => {
                          setIsEditingBio(false);
                          setBioInput(profile.bio || "");
                        }}
                        className="rounded-lg border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSaveBio}
                        className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-400"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="max-w-2xl text-slate-300 text-sm italic leading-relaxed">
                    {profile.bio || "Nenhuma biografia definida ainda."}
                  </p>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-3 pt-2">
                <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-800">
                  {userPosts.length} {userPosts.length === 1 ? "publicação" : "publicações"}
                </span>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-800">
                  {followersCount} {followersCount === 1 ? "seguidor" : "seguidores"}
                </span>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-slate-300 border border-slate-800">
                  {visitedPlaces.length} {visitedPlaces.length === 1 ? "local visitado" : "locais visitados"}
                </span>
              </div>
            </div>

            {isOwner ? (
              <button
                onClick={() => setIsEditingBio(!isEditingBio)}
                className="rounded-2xl border border-slate-700 bg-slate-950 px-5 py-3 font-bold text-white transition hover:bg-slate-800 self-start md:self-center"
              >
                {isEditingBio ? "Fechando..." : "Editar Bio"}
              </button>
            ) : (
              <button 
                onClick={toggleFollow}
                className={`rounded-2xl px-5 py-3 font-bold transition self-start md:self-center ${
                  isFollowing 
                    ? "border border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800" 
                    : "bg-teal-500 text-slate-950 hover:bg-teal-400"
                }`}
              >
                {isFollowing ? "Seguindo" : "Seguir"}
              </button>
            )}

          </div>
        </section>

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-teal-300">Publicações</p>
              <h2 className="text-2xl font-bold text-white">Experiências compartilhadas</h2>
            </div>

            {userPosts.length === 0 ? (
              <div className="text-center py-16 rounded-3xl border border-dashed border-slate-800 text-slate-500">
                📍 Nenhuma publicação realizada por este perfil ainda.
              </div>
            ) : (
              <div className="grid gap-5 md:grid-cols-2">
                {userPosts.map((post) => (
                  <article
                    key={post.postId}
                    className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm flex flex-col justify-between"
                  >
                    <div>
                      {/* 🎯 Imagem real renderizada aqui (ou a padrão caso não tenha enviado) */}
                      <img
                        src={post.imagem_url || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80"}
                        alt={post.nomelocal}
                        className="h-56 w-full object-cover"
                      />

                      <div className="space-y-3 p-4 text-slate-900">
                        
                        {/* 🎯 Título e botão de lixeira flexíveis */}
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-bold text-teal-700 block">📍 {post.nomelocal}</span>
                            <p className="text-xs text-slate-400 mt-0.5">{post.cidade}, {post.estado}</p>
                          </div>
                          
                          {isOwner && (
                            <button
                              onClick={() => handlePostDelete(post.postId)}
                              className="text-slate-400 hover:text-red-500 transition-colors p-1"
                              title="Excluir postagem"
                            >
                              <Trash2 size={16} />
                            </button>
                          )}
                        </div>

                        <p className="text-slate-700 text-sm leading-relaxed">{post.caption}</p>
                      </div>
                    </div>

                    <div className="mx-4 mb-4 flex gap-4 border-t border-slate-100 pt-3 text-sm font-medium text-slate-500">
                      <span>❤️ {post.likes || 0}</span>
                      <span>💬 {post.comments || 0}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">Locais visitados</h2>

              <div className="mt-4 space-y-3">
                {visitedPlaces.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Nenhum local mapeado.</p>
                ) : (
                  visitedPlaces.map((place) => (
                    <div
                      key={place.name}
                      className="block rounded-2xl border border-slate-200 p-4 transition"
                    >
                      <p className="font-semibold text-slate-950">{place.name}</p>
                      <p className="text-sm text-slate-500">{place.category}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-teal-400/30 bg-teal-500 p-5 text-slate-950 shadow-sm">
              <h2 className="text-lg font-bold">Sobre o perfil</h2>
              <p className="mt-2 text-sm">
                Usuários compartilham fotos, avaliações e experiências em
                locais cadastrados na plataforma.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}