import Header from "@/components/Ui/Header";

const places = [
  {
    id: "cafe-aurora",
    name: "Café Aurora",
    category: "Cafeteria",
    location: "Setor Bueno, Goiânia",
    rating: 4.8,
    image:
      "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "bistro-central",
    name: "Bistrô Central",
    category: "Restaurante",
    location: "Jardim Goiás, Goiânia",
    rating: 4.7,
    image:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "studio-fit",
    name: "Studio Fit",
    category: "Academia",
    location: "Setor Marista, Goiânia",
    rating: 4.9,
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "barber-club",
    name: "Barber Club",
    category: "Barbearia",
    location: "Setor Oeste, Goiânia",
    rating: 4.6,
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98d665033?auto=format&fit=crop&w=900&q=80",
  },
];

export default function PlacesPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8">
        <section className="rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white">
          <p className="text-sm font-semibold text-teal-300">
            Explorar locais
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Descubra lugares através da comunidade
          </h1>

          <p className="mt-3 max-w-2xl text-slate-300">
            Explore cafeterias, restaurantes, academias e outros locais
            avaliados pelos usuários do SpotS.
          </p>
        </section>

        <section className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {places.map((place) => (
            <a
              key={place.id}
              href={`/places/${place.id}`}
              className="overflow-hidden rounded-3xl bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <img
                src={place.image}
                alt={place.name}
                className="h-56 w-full object-cover"
              />

              <div className="p-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-950">
                    {place.name}
                  </h2>

                  <span className="font-semibold text-teal-600">
                    ⭐ {place.rating}
                  </span>
                </div>

                <p className="mt-2 text-sm text-slate-500">
                  {place.category}
                </p>

                <p className="mt-1 text-sm text-slate-600">
                  📍 {place.location}
                </p>
              </div>
            </a>
          ))}
        </section>
      </main>
    </div>
  );
}