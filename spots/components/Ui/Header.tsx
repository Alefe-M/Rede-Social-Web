'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signout } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/client"; // Importado para consultar o banco
import toast from "react-hot-toast";
import { MapPin, User, LogOut } from "lucide-react";

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  
  // Estados para guardar o username do usuário logado e controlar o carregamento
  const [username, setUsername] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    async function fetchUserProfile() {
      // 1. Busca o usuário autenticado no Supabase Auth
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 2. Busca o 'username' na sua tabela 'Perfis' onde o id é igual ao id do auth
        const { data, error } = await supabase
          .from("Perfis") // Nome exato da sua tabela com P maiúsculo
          .select("username")
          .eq("id", user.id)
          .single(); // Traz apenas um único registro

        if (!error && data) {
          setUsername(data.username);
        }
      }
      setLoadingProfile(false);
    }

    fetchUserProfile();
  }, []);

  const handleSignOut = async () => {
    const result = await signout();
    if (result.success) {
      toast.success("Você saiu da sua conta.");
      router.push("/login"); 
    } else {
      toast.error("Erro ao sair da conta.");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 group">
          <img 
            src="/map-icon.svg" 
            alt="SpotS" 
            className="h-7 w-7 transition-transform duration-200 group-hover:scale-105" 
          />
          <span className="text-xl font-bold text-white tracking-tight transition-colors duration-200 group-hover:text-teal-400">
            SpotS
          </span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {/* Link: Locais */}
          <Link
            href="/places"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-teal-400 transition-all duration-200"
          >
            <MapPin size={18} />
            <span className="hidden sm:inline">Locais</span>
          </Link>

          {/* Link: Perfil (Agora Dinâmico) */}
          <Link
            href={username ? `/profile/${username}` : "#"}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              loadingProfile 
                ? "text-slate-600 cursor-not-allowed pointer-events-none" 
                : "text-slate-300 hover:bg-slate-900 hover:text-teal-400"
            }`}
          >
            <User size={18} />
            <span className="hidden sm:inline">
              {loadingProfile ? "Carregando..." : "Perfil"}
            </span>
          </Link>

          {/* Divisor sutil */}
          <div className="w-[1px] h-5 bg-slate-800 mx-1 sm:mx-2" />

          {/* Botão Sair */}
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-400 transition-all duration-200 border border-transparent hover:border-red-500/20"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </nav>

      </div>
    </header>
  );
}