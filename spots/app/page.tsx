"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Ui/Header";
import LikeButton from "@/components/Ui/likeButton";
import CommentSection from "@/components/Ui/CommentSection";
import { createClient } from "@/utils/supabase/client";
import { deletePost } from "@/app/actions/spots";
import { Trash2, Image as ImageIcon } from "lucide-react"; // 🎯 Importei um ícone de imagem
import toast from "react-hot-toast";

// ==========================================
// TIPAGENS
// ==========================================
interface Post {
  postId: string;
  created_at: string;
  userId: string;
  nomelocal: string;
  cidade: string;
  estado: string;
  caption: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  imagem_url?: string; // 🎯 Nossa nova coluna!
  Perfis: {
    nome: string;
    sobrenome: string;
    username: string;
    avatar_url: string | null;
  } | null;
}

interface UserProfile {
  id: string;
  nome: string;
  sobrenome: string;
  username: string;
  bio: string | null;
}

const featuredPlaces = [
  { name: "Café Aurora", url: "/places/cafe-aurora", category: "Cafeteria" },
  { name: "Bistrô Central", url: "/places/bistro-central", category: "Restaurante" },
  { name: "Studio Fit", url: "/places/studio-fit", category: "Academia" },
  { name: "Barber Club", url: "/places/barber-club", category: "Barbearia" },
];

export default function FeedPage() {
  const supabase = createClient();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q");

  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);

        const { data: { user } } = await supabase.auth.getUser();
        let currentUserId = "";
        let filterUserIds: string[] = []; 

        if (user) {
          currentUserId = user.id;

          const { data: profileData, error: profileError } = await supabase
            .from("Perfis")
            .select("id, nome, sobrenome, username, bio")
            .eq("id", currentUserId)
            .single();

          if (!profileError && profileData) {
            setMyProfile(profileData as UserProfile);
            setNewBio(profileData.bio || "");
          }

          const { data: follows } = await supabase
            .from("Seguidores")
            .select("seguindo_id")
            .eq("seguidor_id", currentUserId);

          if (follows && follows.length > 0) {
            const followedIds = follows.map((f) => f.seguindo_id);
            filterUserIds = [currentUserId, ...followedIds];
          } else {
            filterUserIds = [currentUserId];
          }
        }

        // 🎯 Adicionei a imagem_url no select do banco
        let postQuery = supabase
          .from("Posts")
          .select(`
            postId, created_at, userId, nomelocal, cidade, estado, caption, likes, comments, imagem_url,
            Perfis (nome, sobrenome, username, avatar_url)
          `)
          .order("created_at", { ascending: false });

        if (currentUserId && filterUserIds.length > 0) {
          postQuery = postQuery.in("userId", filterUserIds);
        }

        if (searchQuery) {
          postQuery = postQuery.ilike("nomelocal", `%${searchQuery}%`);
        }

        const { data: postsData, error: postsError } = await postQuery;

        if (!postsError && postsData) {
          let userLikes: string[] = [];
          if (currentUserId) {
            const { data: likesData } = await supabase
              .from("Curtidas_Posts")
              .select("post_id")
              .eq("user_id", currentUserId);

            if (likesData) {
              userLikes = likesData.map((l) => l.post_id);
            }
          }

          const postsWithLikeStatus = (postsData as any[]).map((post) => ({
            ...post,
            isLiked: userLikes.includes(post.postId),
          }));

          setFeedPosts(postsWithLikeStatus as Post[]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar o feed.");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [searchQuery]); 

  // ==========================================
  // HANDLERS (AÇÕES)
  // ==========================================
  
  

  const handleUpdateBio = async () => {
    if (!myProfile) return;

    const { error } = await supabase
      .from("Perfis")
      .update({ bio: newBio })
      .eq("id", myProfile.id);

    if (error) {
      toast.error("Erro ao salvar biografia: " + error.message);
    } else {
      setMyProfile({ ...myProfile, bio: newBio });
      setIsEditingBio(false);
      toast.success("Biografia atualizada!");
    }
  };

  const handlePostDelete = async (postId: string) => {
    if (!confirm("Tem certeza que deseja excluir esta postagem?")) return;

    try {
      // Deleta diretamente pelo cliente do navegador (bypass no firewall)
      const { error } = await supabase
        .from("Posts")
        .delete()
        .eq("postId", postId);

      if (error) {
        throw error;
      }

      // Se deu certo, remove da tela instantaneamente
      toast.success("Postagem excluída com sucesso!");
      setFeedPosts((prev) => prev.filter((p) => p.postId !== postId));

    } catch (err: any) {
      console.error("Erro ao excluir:", err);
      toast.error("Erro ao excluir postagem. Verifique sua conexão.");
    }
  };

  const formatPostDate = (date: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <Header />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,720px)_320px]">
        
        <section className="space-y-6">
          
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8 text-white shadow-sm">

  <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

    <div>
      <span className="text-sm font-medium uppercase tracking-wider text-teal-400">
        Comunidade Spots
      </span>

      <h1 className="mt-4 text-4xl font-bold leading-tight">
        Olá, {myProfile?.nome || "Visitante"} 👋
      </h1>

      <p className="mt-3 max-w-xl text-lg text-slate-300">
        Descubra novos lugares e compartilhe experiências reais.
      </p>
    </div>

    <a
    href="/create-post"
    className="rounded-xl bg-teal-500 px-6 py-3 text-base font-semibold text-slate-950 transition hover:bg-teal-400"
  >
    ✨ Compartilhar Experiência
  </a>

  </div>

</div>

          {searchQuery && (
            <div className="flex items-center justify-between rounded-xl bg-teal-500/10 p-4 border border-teal-500/20 text-slate-300">
              <p>
                Resultados para locais contendo: <span className="text-teal-400 font-bold">"{searchQuery}"</span>
              </p>
              <a href="/" className="text-sm font-medium text-teal-500 hover:text-teal-400">
                Limpar Busca
              </a>
            </div>
          )}

            {/* Modal de Nova Postagem */}
            

          {/* Listagem de Posts do Feed */}
          <div className="space-y-5">
            {loading ? (
              <p className="text-center text-slate-400 py-10">Carregando feed...</p>
            ) : feedPosts.length === 0 ? (
              <p className="text-center text-slate-400 py-10">
                {searchQuery ? "Nenhuma postagem encontrada para essa busca." : "Nenhuma postagem encontrada."}
              </p>
            ) : (
              feedPosts.map((post) => (
                <article
                  key={post.postId}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm"
                >
                  <div className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-3">
                      <a
                        href={post.Perfis?.username ? `/profile/${post.Perfis.username}` : "#"}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 text-lg font-bold text-teal-700 transition hover:bg-teal-200"
                      >
                        {post.Perfis?.nome ? post.Perfis.nome.charAt(0) : "U"}
                      </a>

                      <div>
                        <a
                          href={post.Perfis?.username ? `/profile/${post.Perfis.username}` : "#"}
                          className="font-semibold text-slate-950 transition hover:text-teal-700"
                        >
                          {post.Perfis
                            ? `${post.Perfis.nome} ${post.Perfis.sobrenome}`
                            : "Usuário SpotS"}
                        </a>

                        <p className="text-sm text-slate-500">
                          {post.Perfis?.username ? `@${post.Perfis.username}` : "@usuario"} ·{" "}
                          {formatPostDate(post.created_at)}
                        </p>
                      </div>
                    </div>

                    {myProfile?.id === post.userId && (
                      <button
                        onClick={() => handlePostDelete(post.postId)}
                        className="rounded-full p-2 text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                        title="Excluir postagem"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>

                  <div className="border-y border-slate-100 bg-slate-50 px-5 py-3">

                    <div className="mt-1 flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold text-slate-950">
                          📍 {post.nomelocal}
                        </h2>

                        <p className="text-sm text-slate-500">
                          {post.cidade}, {post.estado}
                        </p>
                      </div>

                      <span className="rounded-full bg-teal-100 px-2.5 py-1 text-[11px] font-medium text-teal-700">
                        Experiência compartilhada
                      </span>
                    </div>
                  </div>

                  <img
                    src={
                      post.imagem_url ||
                      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80"
                    }
                    alt={`Foto em ${post.nomelocal}`}
                    className="h-80 w-full object-cover"
                  />

                  <div className="space-y-5 p-5">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        Experiência
                      </p>

                      <p className="mt-2 text-base leading-relaxed text-slate-700">
                        {post.caption}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <CommentSection postId={post.postId} currentUserId={myProfile?.id} />
                    </div>

                    <div className="flex items-center gap-5 border-t border-slate-200 pt-4 text-sm font-medium text-slate-600">
                      <LikeButton
                        postId={post.postId}
                        initialLikes={post.likes}
                        initialIsLiked={post.isLiked}
                        currentUserId={myProfile?.id}
                      />

                      <span className="cursor-pointer transition hover:text-slate-900">
                        🔖 Salvar
                      </span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* LADO DIREITO */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          
          {myProfile && (
          <div className="rounded-3xl border border-slate-800 bg-white p-5 shadow-sm text-slate-900">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-teal-100 text-xl font-bold text-teal-700">
                {myProfile.nome.charAt(0)}
              </div>

              <div className="min-w-0">
                <h3 className="truncate text-lg font-bold text-slate-950">
                  {myProfile.nome} {myProfile.sobrenome}
                </h3>
                <p className="text-sm text-slate-500">@{myProfile.username}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-3 text-center">
              <div>
                <p className="font-bold text-slate-950">1</p>
                <p className="text-[11px] font-medium text-slate-500">post</p>
              </div>

              <div>
                <p className="font-bold text-slate-950">1</p>
                <p className="text-[11px] font-medium text-slate-500">seguidor</p>
              </div>

              <div>
                <p className="font-bold text-slate-950">1</p>
                <p className="text-[11px] font-medium text-slate-500">local</p>
              </div>
            </div>

            <div className="mt-4 border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Bio
                </p>

                {!isEditingBio && (
                  <button
                    onClick={() => setIsEditingBio(true)}
                    className="text-xs font-semibold text-teal-600 hover:text-teal-700"
                  >
                    Editar
                  </button>
                )}
              </div>

              {isEditingBio ? (
                <div className="mt-3 space-y-3">
                  <textarea
                    value={newBio}
                    onChange={(e) => setNewBio(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                    rows={3}
                    placeholder="Fale um pouco sobre você..."
                  />

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setIsEditingBio(false)}
                      className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                    >
                      Cancelar
                    </button>

                    <button
                      onClick={handleUpdateBio}
                      className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-teal-400"
                    >
                      Salvar
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-2 text-sm leading-relaxed text-slate-600">
                  {myProfile.bio ||
                    "Conte um pouco sobre você e seus lugares favoritos."}
                </p>
              )}
            </div>

          <a
            href={`/profile/${myProfile.username}`}
            className="mt-5 block rounded-xl border border-slate-200 px-4 py-3 text-center text-sm font-bold text-slate-700 transition hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
          >
            Ver Perfil
          </a>
        </div>
      )}

          <div className="rounded-3xl border border-slate-800 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">Locais em destaque</h2>
            <div className="mt-4 space-y-3">
              {featuredPlaces.map((place) => (
                <a
                  key={place.name}
                  href={place.url}
                  className="block rounded-2xl border border-slate-200 p-3 transition hover:border-teal-400 hover:bg-teal-50"
                >
                  <p className="font-semibold text-slate-950">{place.name}</p>
                  <p className="text-sm text-slate-500">{place.category}</p>
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-teal-400/30 bg-teal-500 p-5 text-slate-950 shadow-sm">
            <h2 className="text-lg font-bold">Como funciona?</h2>
            <p className="mt-2 text-sm">
              Usuários compartilham fotos em locais cadastrados. Assim, outras
              pessoas descobrem negócios, experiências e pontos interessantes.
            </p>
          </div>
        </aside>
      </main>
    </div>
  );
}