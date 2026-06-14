"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/Ui/Header";
import { createClient } from "@/utils/supabase/client";

interface ProfileData {
  id: string;
  nome: string;
  sobrenome: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
}

// CORREÇÃO: Tipagem atualizada para bater com as colunas reais do banco
interface Post {
  postId: string;
  created_at: string;
  nomelocal: string;
  cidade: string;
  estado: string;
  caption: string;
  likes: number;
  comments: number;
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
  
  const [isOwner, setIsOwner] = useState(false);
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioInput, setBioInput] = useState("");

  useEffect(() => {
    // Alerta caso a pasta não esteja configurada como [username]
    if (!usernameUrl) {
      console.error("Username não encontrado na URL. Certifique-se de que a pasta está como app/profile/[username]/page.tsx");
      setLoading(false);
      return;
    }

    async function loadProfileData() {
      try {
        // 1. Busca os dados do perfil pelo username da URL
        const { data: profileData, error: profileError } = await supabase
          .from("Perfis")
          .select("id, nome, sobrenome, username, bio, avatar_url")
          .eq("username", usernameUrl)
          .single();

        if (profileError || !profileData) {
          console.error("Perfil não encontrado:", profileError?.message);
          setLoading(false);
          return;
        }

        setProfile(profileData as ProfileData);
        setBioInput(profileData.bio || "");

        // 2. Verifica se este perfil pertence ao usuário atualmente logado
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser && currentUser.id === profileData.id) {
          setIsOwner(true);
        }

        // 3. CORREÇÃO: Selecionando as colunas CORRETAS que existem no seu banco
        const { data: postsData, error: postsError } = await supabase
          .from("Posts")
          .select("postId, created_at, nomelocal, cidade, estado, caption, likes, comments")
          .eq("userId", profileData.id)
          .order("created_at", { ascending: false });

        if (!postsError && postsData) {
          setUserPosts(postsData as unknown as Post[]);
        } else if (postsError) {
          console.error("Erro ao buscar posts:", postsError.message);
        }

        // 4. Busca a contagem de seguidores
        const { count, error: followersError } = await supabase
          .from("Seguidores")
          .select("*", { count: "exact", head: true })
          .eq("seguindo_id", profileData.id);

        if (!followersError && count !== null) {
          setFollowersCount(count);
        }

      } catch (err) {
        console.error("Erro geral ao carregar perfil:", err);
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
      alert("Erro ao atualizar biografia: " + error.message);
    } else {
      setProfile({ ...profile, bio: bioInput });
      setIsEditingBio(false);
    }
  };

  // CORREÇÃO: Mapeando baseado na coluna correta do banco
  const visitedPlaces: VisitedPlace[] = Array.from(
    new Set(userPosts.map((p) => p.nomelocal))
  ).map((name) => {
    return { name, category: "Local Registrado" };
  });

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
              <button className="rounded-2xl bg-teal-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-teal-400 self-start md:self-center">
                Seguir
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
                      {/* CORREÇÃO: Usando um placeholder já que imagem_url não foi mapeada no select */}
                      <img
                        src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80"
                        alt={post.nomelocal}
                        className="h-56 w-full object-cover"
                      />

                      <div className="space-y-3 p-4 text-slate-900">
                        <span className="font-bold text-teal-700 block">
                          📍 {post.nomelocal}
                        </span>
                        <p className="text-xs text-slate-400 -mt-2">
                          {post.cidade}, {post.estado}
                        </p>

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