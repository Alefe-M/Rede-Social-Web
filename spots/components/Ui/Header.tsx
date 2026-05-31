import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <img src="/map-icon.svg" alt="SpotS" className="h-8 w-8" />
          <span className="text-2xl font-bold text-white">SpotS</span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/feed"
            className="font-medium text-slate-200 transition hover:text-teal-300"
          >
            Feed
          </Link>

          <Link
            href="/places"
            className="font-medium text-slate-200 transition hover:text-teal-300"
          >
            Locais
          </Link>

          <Link
            href="/profile/marianaalves"
            className="font-medium text-slate-200 transition hover:text-teal-300"
          >
            Perfil
          </Link>
        </nav>
      </div>
    </header>
  );
}