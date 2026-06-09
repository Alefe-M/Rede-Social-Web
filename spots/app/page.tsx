"use client";

import { useState, useEffect } from "react";
import Header from "@/components/Ui/Header";
import { createClient } from "@/utils/supabase/client";

// Tipagem alinhada estritamente com o seu banco de dados relacional
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
  const [feedPosts, setFeedPosts] = useState<Post[]>([]);
  const [myProfile, setMyProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Estados para edição da Bio
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [newBio, setNewBio] = useState("");

  const [newPostData, setNewPostData] = useState({
    nomelocal: "",
    cidade: "",
    estado: "",
    caption: "",
  });

  // Carrega os posts (com o Perfil do autor) e os dados do usuário logado
  useEffect(() => {
    async function loadData() {
      try {
        // 1. Busca posts trazendo os dados associados da tabela Perfis
        const { data: postsData, error: postsError } = await supabase
          .from("Posts")
          .select(`
            postId,
            created_at,
            userId,
            nomelocal,
            cidade,
            estado,
            caption,
            likes,
            comments,
            Perfis (
              nome,
              sobrenome,
              username,
              avatar_url
            )
          `)
          .order("created_at", { ascending: false });

        if (!postsError && postsData) {
          setFeedPosts(postsData as unknown as Post[]);
        }

        // 2. Busca o Perfil do usuário atualmente logado
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("Perfis")
            .select("id, nome, sobrenome, username, bio")
            .eq("id", user.id)
            .single();

          if (!profileError && profileData) {
            setMyProfile(profileData as UserProfile);
            setNewBio(profileData.bio || "");
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Salva a nova postagem vinculando o userId correto
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!myProfile) {
      alert("Você precisa estar autenticado para criar uma publicação!");
      return;
    }

    const postToSave = {
      userId: myProfile.id,
      nomelocal: newPostData.nomelocal,
      cidade: newPostData.cidade,
      estado: newPostData.estado,
      caption: newPostData.caption,
      likes: 0,
      comments: 0,
    };

    const { data, error } = await supabase
      .from("Posts")
      .insert([postToSave])
      .select(`
        postId,
        created_at,
        userId,
        nomelocal,
        cidade,
        estado,
        caption,
        likes,
        comments,
        Perfis (
          nome,
          sobrenome,
          username,
          avatar_url
        )
      `);

    if (error) {
      alert("Erro ao salvar postagem: " + error.message);
      return;
    }

    if (data && data[0]) {
      setFeedPosts([data[0] as unknown as Post, ...feedPosts]);
    }

    setIsModalOpen(false);
    setNewPostData({ nomelocal: "", cidade: "", estado: "", caption: "" });
  };

  // Atualiza a biografia no banco de dados
  const handleUpdateBio = async () => {
    if (!myProfile) return;

    const { error } = await supabase
      .from("Perfis")
      .update({ bio: newBio })
      .eq("id", myProfile.id);

    if (error) {
      alert("Erro ao salvar biografia: " + error.message);
    } else {
      setMyProfile({ ...myProfile, bio: newBio });
      setIsEditingBio(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <Header />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,720px)_320px]">
        <section className="space-y-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
            <div>
              <h1 className="text-3xl font-bold">
                Descubra lugares através das pessoas
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Veja fotos, experiências e recomendações compartilhadas por
                usuários em locais comerciais próximos.
              </p>
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="whitespace-nowrap rounded-xl bg-teal-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
            >
              + Criar Post
            </button>
          </div>

          {/* Modal de Nova Postagem */}
          {isModalOpen && (
            <div className="rounded-3xl border border-teal-500/30 bg-slate-900 p-6 shadow-md text-white">
              <h2 className="mb-4 text-xl font-bold">Nova Postagem</h2>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <label className="mb-1 block text-sm text-slate-300">Nome do Local</label>
                  <input
                    type="text"
                    value={newPostData.nomelocal}
                    onChange={(e) => setNewPostData({ ...newPostData, nomelocal: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="Ex: Café Aurora"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Cidade</label>
                    <input
                      type="text"
                      value={newPostData.cidade}
                      onChange={(e) => setNewPostData({ ...newPostData, cidade: e.target.value })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="Ex: Goiânia"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm text-slate-300">Estado (UF)</label>
                    <input
                      type="text"
                      maxLength={2}
                      value={newPostData.estado}
                      onChange={(e) => setNewPostData({ ...newPostData, estado: e.target.value.toUpperCase() })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                      placeholder="Ex: GO"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm text-slate-300">Sua experiência</label>
                  <textarea
                    value={newPostData.caption}
                    onChange={(e) => setNewPostData({ ...newPostData, caption: e.target.value })}
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 p-3 text-white focus:border-teal-500 focus:outline-none"
                    placeholder="O que você achou desse lugar?"
                    rows={3}
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="rounded-xl px-4 py-2 font-medium text-slate-300 hover:bg-slate-800"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="rounded-xl bg-teal-500 px-4 py-2 font-bold text-slate-950 hover:bg-teal-400"
                  >
                    Publicar
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Listagem com os Perfis Reais vindos do Join do Banco */}
          <div className="space-y-5">
            {loading ? (
              <p className="text-center text-slate-400 py-10">Carregando feed...</p>
            ) : feedPosts.length === 0 ? (
              <p className="text-center text-slate-400 py-10">Nenhuma postagem encontrada.</p>
            ) : (
              feedPosts.map((post) => (
                <article
                  key={post.postId}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm"
                >
                  <div className="flex items-center gap-3 p-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                      {post.Perfis?.nome ? post.Perfis.nome.charAt(0) : "U"}
                    </div>

                    <div>
                      <span className="font-semibold text-slate-950">
                        {post.Perfis ? `${post.Perfis.nome} ${post.Perfis.sobrenome}` : "Usuário SpotS"}
                      </span>
                      <p className="text-sm text-slate-500">
                        {post.Perfis?.username ? `@${post.Perfis.username}` : "@usuario"}
                      </p>
                    </div>
                  </div>

                  <img
                    src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80"
                    alt={`Foto em ${post.nomelocal}`}
                    className="h-80 w-full object-cover"
                  />

                  <div className="space-y-4 p-4">
                    <div>
                      <span className="text-base font-bold text-teal-700">
                        📍 {post.nomelocal}
                      </span>
                      <p className="mt-1 text-sm text-slate-500">
                        {post.cidade}, {post.estado}
                      </p>
                    </div>

                    <p className="text-slate-700">{post.caption}</p>

                    <div className="flex items-center gap-5 border-t border-slate-200 pt-4 text-sm font-medium text-slate-600">
                      <span>❤️ {post.likes} curtidas</span>
                      <span>💬 {post.comments} comentários</span>
                      <span>🔖 Salvar</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Barra Lateral Modificada com Card do Usuário Logado */}
        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          
          {/* CARD DINÂMICO DE PERFIL E EDICÃO DE BIO */}
          {myProfile && (
            <div className="rounded-3xl border border-slate-800 bg-white p-5 shadow-sm text-slate-900">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700 text-lg">
                  {myProfile.nome.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-slate-950">{myProfile.nome} {myProfile.sobrenome}</h3>
                  <p className="text-sm text-slate-500">@{myProfile.username}</p>
                </div>
              </div>

              <div className="mt-4 border-t border-slate-100 pt-3">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sobre mim (Bio)</p>
                
                {isEditingBio ? (
                  <div className="mt-2 space-y-2">
                    <textarea
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-slate-50 p-2 text-sm text-slate-900 focus:border-teal-500 focus:outline-none"
                      rows={2}
                      placeholder="Fale um pouco sobre você..."
                    />
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setIsEditingBio(false)}
                        className="text-xs font-medium text-slate-500 hover:underline"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleUpdateBio}
                        className="rounded-lg bg-teal-500 px-3 py-1 text-xs font-bold text-slate-950 hover:bg-teal-400"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex items-start justify-between gap-2">
                    <p className="text-sm text-slate-700 italic">
                      {myProfile.bio || "Nenhuma biografia informada ainda."}
                    </p>
                    <button
                      onClick={() => setIsEditingBio(true)}
                      className="text-xs text-teal-600 hover:text-teal-700 font-medium shrink-0"
                    >
                      Editar
                    </button>
                  </div>
                )}
              </div>
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