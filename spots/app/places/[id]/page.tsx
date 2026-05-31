import Header from "@/components/Ui/Header";

const communityPosts = [
  {
    user: "Mariana Alves",
    username: "@mari.alves",
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
    text: "Café excelente, ambiente tranquilo e ótimo lugar para trabalhar por algumas horas.",
  },
  {
    user: "Renato Lima",
    username: "@renatolima",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=900&q=80",
    text: "Lugar aconchegante, atendimento rápido e uma ótima opção para reuniões informais.",
  },
];

const reviews = [
  {
    user: "Ana Costa",
    rating: "★★★★★",
    text: "Ótima experiência. Ambiente bonito, café muito bom e atendimento cuidadoso.",
  },
  {
    user: "Lucas Martins",
    rating: "★★★★☆",
    text: "Lugar bem localizado e agradável. Voltaria outras vezes.",
  },
  {
    user: "Bianca Souza",
    rating: "★★★★★",
    text: "Excelente para trabalhar, conversar e conhecer pessoas.",
  },
];

export default function PlacePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-900">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm">
          <div className="relative h-72">
            <img
              src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1400&q=80"
              alt="Café Aurora"
              className="h-full w-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />

            <div className="absolute bottom-6 left-6 text-white">
              <p className="text-sm font-semibold text-teal-300">Cafeteria</p>
              <h1 className="mt-1 text-4xl font-bold">Café Aurora</h1>
              <p className="mt-2 text-slate-200">Setor Bueno, Goiânia - GO</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 lg:grid-cols-[1fr_320px]">
            <div>
              <div className="flex flex-wrap gap-3">
                <span className="rounded-full bg-teal-100 px-4 py-2 text-sm font-semibold text-teal-800">
                  ⭐ 4.8 avaliações
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  124 publicações
                </span>
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                  Aberto agora
                </span>
              </div>

              <p className="mt-5 max-w-2xl text-slate-600">
                Cafeteria local conhecida pelo ambiente tranquilo, cafés
                especiais e espaço confortável para encontros, estudos e
                trabalho remoto.
              </p>
            </div>

            <aside className="rounded-2xl border border-slate-200 p-4">
              <h2 className="font-bold text-slate-950">Informações do local</h2>
              <div className="mt-3 space-y-2 text-sm text-slate-600">
                <p>📍 Av. T-10, Setor Bueno</p>
                <p>🕒 Aberto até 21h</p>
                <p>📞 (62) 99999-0000</p>
                <p>💬 86 avaliações públicas</p>
              </div>
            </aside>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            <div>
              <p className="text-sm font-semibold text-teal-300">
                Comunidade
              </p>
              <h2 className="text-2xl font-bold text-white">
                Fotos compartilhadas neste local
              </h2>
            </div>

            {communityPosts.map((post) => (
              <article
                key={post.user}
                className="overflow-hidden rounded-3xl border border-slate-800 bg-white shadow-sm"
              >
                <div className="flex items-center gap-3 p-4">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-teal-100 font-bold text-teal-700">
                    {post.user.charAt(0)}
                  </div>

                  <div>
                    <p className="font-semibold text-slate-950">{post.user}</p>
                    <p className="text-sm text-slate-500">{post.username}</p>
                  </div>
                </div>

                <img
                  src={post.image}
                  alt="Foto compartilhada no local"
                  className="h-80 w-full object-cover"
                />

                <div className="p-4">
                  <p className="text-slate-700">{post.text}</p>
                </div>
              </article>
            ))}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl bg-white p-5 shadow-sm">
              <h2 className="text-xl font-bold text-slate-950">
                Avaliações
              </h2>

              <div className="mt-4 space-y-4">
                {reviews.map((review) => (
                  <div
                    key={review.user}
                    className="rounded-2xl border border-slate-200 p-4"
                  >
                    <p className="font-semibold text-slate-950">
                      {review.user}
                    </p>
                    <p className="mt-1 text-sm text-teal-600">
                      {review.rating}
                    </p>
                    <p className="mt-2 text-sm text-slate-600">
                      {review.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <button className="w-full rounded-2xl bg-teal-500 px-5 py-4 font-bold text-slate-950 transition hover:bg-teal-400">
              Avaliar este local
            </button>
          </aside>
        </section>
      </main>
    </div>
  );
}