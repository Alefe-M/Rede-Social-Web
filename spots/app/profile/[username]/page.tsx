import Header from "@/components/Ui/Header";

const visitedPlaces = [
  { name: "Café Aurora", url: "/places/cafe-aurora", category: "Cafeteria" },
  { name: "Bistrô Central", url: "/places/bistro-central", category: "Restaurante" },
  { name: "Studio Fit", url: "/places/studio-fit", category: "Academia" },
];

const posts = [
  {
    id: 1,
    place: "Café Aurora",
    url: "/places/cafe-aurora",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    text: "Café excelente e ambiente ótimo para trabalhar.",
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    place: "Bistrô Central",
    url: "/places/bistro-central",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    text: "Almoço muito bom e atendimento rápido.",
    likes: 58,
    comments: 11,
  },
  {
    id: 3,
    place: "Parque Vaca Brava",
    url: "/places/parque-vaca-brava",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    text: "Fim de tarde bonito e movimento tranquilo.",
    likes: 76,
    comments: 14,
  },
];

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-teal-100 text-4xl font-bold text-teal-700">
              M
            </div>

            <div className="flex-1">
              <p className="text-sm font-semibold text-teal-300">
                Perfil de usuário
              </p>

              <h1 className="mt-1 text-4xl font-bold">Mariana Alves</h1>
              <p className="mt-1 text-slate-400">@marianaalves</p>

              <p className="mt-4 max-w-2xl text-slate-300">
                Apaixonada por cafés, restaurantes e lugares diferentes para
                conhecer. Compartilhando experiências reais pela cidade.
              </p>

              <div className="mt-5 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200">
                  128 publicações
                </span>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200">
                  452 seguidores
                </span>
                <span className="rounded-full bg-slate-950 px-4 py-2 text-sm font-semibold text-slate-200">
                  38 locais visitados
                </span>
              </div>
            </div>

            <button className="rounded-2xl bg-teal-500 px-5 py-3 font-bold text-slate-950 transition hover:bg-teal-400">
              Seguir
            </button>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-5">
              <p className="text-sm font-semibold text-teal-300">
                Publicações
              </p>
              <h2 className="text-2xl font-bold text-white">
                Experiências compartilhadas
              </h2>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {posts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm"
                >
                  <img
                    src={post.image}
                    alt={post.place}
                    className="h-56 w-full object-cover"
                  />

                  <div className="space-y-3 p-4">
                    <a
                      href={post.url}
                      className="font-bold text-teal-700 hover:text-teal-900"
                    >
                      📍 {post.place}
                    </a>

                    <p className="text-slate-700">{post.text}</p>

                    <div className="flex gap-4 border-t border-slate-200 pt-3 text-sm font-medium text-slate-600">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Locais visitados
              </h2>

              <div className="mt-4 space-y-3">
                {visitedPlaces.map((place) => (
                  <a
                    key={place.name}
                    href={place.url}
                    className="block rounded-2xl border border-slate-200 p-4 transition hover:border-teal-400 hover:bg-teal-50"
                  >
                    <p className="font-semibold text-slate-950">
                      {place.name}
                    </p>
                    <p className="text-sm text-slate-500">{place.category}</p>
                  </a>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-teal-400/30 bg-teal-500 p-5 text-slate-950 shadow-sm">
              <h2 className="text-lg font-bold">Sobre o perfil</h2>
              <p className="mt-2 text-sm">
                Usuários PF compartilham fotos, avaliações e experiências em
                locais cadastrados na plataforma.
              </p>
            </div>
          </aside>
        </section>
      </main>
    </div>
  );
}