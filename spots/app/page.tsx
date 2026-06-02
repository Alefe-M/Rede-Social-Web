import Header from "@/components/Ui/Header";

const posts = [
  {
    id: 1,
    user: "Mariana Alves",
    username: "@mari.alves",
    profileUrl: "/profile/marianaalves",
    place: "Café Aurora",
    placeUrl: "/places/cafe-aurora",
    category: "Cafeteria",
    location: "Setor Bueno, Goiânia",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    caption:
      "Café excelente, ambiente tranquilo e ótimo lugar para trabalhar por algumas horas.",
    likes: 42,
    comments: 8,
  },
  {
    id: 2,
    user: "Lucas Martins",
    username: "@lucasmartins",
    profileUrl: "/profile/lucasmartins",
    place: "Parque Vaca Brava",
    placeUrl: "/places/parque-vaca-brava",
    category: "Parque",
    location: "Setor Bueno, Goiânia",
    image:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80",
    caption:
      "Fim de tarde bonito e movimento tranquilo. Um dos melhores pontos para caminhar.",
    likes: 76,
    comments: 14,
  },
  {
    id: 3,
    user: "Ana Costa",
    username: "@anacosta",
    profileUrl: "/profile/anacosta",
    place: "Bistrô Central",
    placeUrl: "/places/bistro-central",
    category: "Restaurante",
    location: "Jardim Goiás, Goiânia",
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
    caption:
      "Almoço muito bom, atendimento rápido e espaço bem agradável para ir em casal.",
    likes: 58,
    comments: 11,
  },
];

const featuredPlaces = [
  { name: "Café Aurora", url: "/places/cafe-aurora", category: "Cafeteria" },
  { name: "Bistrô Central", url: "/places/bistro-central", category: "Restaurante" },
  { name: "Studio Fit", url: "/places/studio-fit", category: "Academia" },
  { name: "Barber Club", url: "/places/barber-club", category: "Barbearia" },
];

export default function FeedPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <Header />

      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-4 py-8 lg:grid-cols-[minmax(0,720px)_320px]">
        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-sm">
            <p className="text-sm font-semibold text-teal-300">Feed Spots</p>

            <h1 className="mt-2 text-3xl font-bold">
              Descubra lugares através das pessoas
            </h1>

            <p className="mt-3 max-w-2xl text-slate-300">
              Veja fotos, experiências e recomendações compartilhadas por
              usuários em locais comerciais próximos.
            </p>

            <div className="mt-5 rounded-2xl border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
              📍 Pessoas compartilham experiências reais em lugares cadastrados.
            </div>
          </div>

          <div className="space-y-5">
            {posts.map((post) => (
              <article
                key={post.id}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 p-4">
                  <a
                    href={post.profileUrl}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700"
                  >
                    {post.user.charAt(0)}
                  </a>

                  <div>
                    <a
                      href={post.profileUrl}
                      className="font-semibold text-slate-950 hover:text-teal-700"
                    >
                      {post.user}
                    </a>
                    <p className="text-sm text-slate-500">{post.username}</p>
                  </div>
                </div>

                <img
                  src={post.image}
                  alt={`Foto publicada em ${post.place}`}
                  className="h-80 w-full object-cover"
                />

                <div className="space-y-4 p-4">
                  <div>
                    <a
                      href={post.placeUrl}
                      className="text-base font-bold text-teal-700 hover:text-teal-900"
                    >
                      📍 {post.place}
                    </a>

                    <p className="mt-1 text-sm text-slate-500">
                      {post.category} • {post.location}
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
            ))}
          </div>
        </section>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-slate-800 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Locais em destaque
            </h2>

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