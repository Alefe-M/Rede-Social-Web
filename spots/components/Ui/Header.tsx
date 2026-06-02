'use client'; // Necessário para usar hooks e eventos de clique (onClick)

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signout } from "@/utils/supabase/auth";
import toast from "react-hot-toast";

export default function Header() {
  const router = useRouter();

  const handleSignOut = async () => {
    // Chama a função de logout do Supabase
    const result = await signout();

    if (result.success) {
      toast.success("Você saiu da sua conta.");
      
      // Redireciona para a página de login.
      // Ajuste o caminho abaixo se a sua página de login não for '/login' (ex: '/')
      router.push("/login"); 
    } else {
      toast.error("Erro ao sair da conta.");
    }
  };

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

          {/* NOVO: Botão de Sair com estilo integrado ao seu layout */}
          <button
            onClick={handleSignOut}
            className="ml-2 rounded-lg bg-slate-800/50 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-red-500/20 hover:text-red-400"
          >
            Sair
          </button>
        </nav>
      </div>
    </header>
  );
}