'use client';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signout } from "@/utils/supabase/auth";
import { createClient } from "@/utils/supabase/client";
import toast from "react-hot-toast";
import { MapPin, User, LogOut } from "lucide-react";
import SearchInput from "@/components/Ui/SearchInput"; 

export default function Header() {
  const router = useRouter();
  const supabase = createClient();
  
  const [username, setUsername] = useState<string | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);

useEffect(() => {
  async function fetchUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        // 🎯 Agora volta a ser "id" pois corrigiste no banco de dados
        const { data, error } = await supabase
          .from("Perfis")
          .select("username")
          .eq("id", user.id) 
          .single();

        if (!error && data) {
          setUsername(data.username);
        }
      }
    } catch (err) {
      console.error("Erro ao buscar perfil:", err);
    } finally {
      setLoadingProfile(false);
    }
  }

  fetchUserProfile();
}, [supabase]);

  const handleSignOut = async () => {
    const result = await signout();
    if (result.success) {
      setUsername(null); // Limpa o estado para atualizar o header imediatamente
      toast.success("Você saiu da sua conta.");
      router.push("/login"); 
    } else {
      toast.error("Erro ao sair da conta.");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        
        {/* Lado Esquerdo: Logo */}
        <div className="flex-shrink-0">
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
        </div>

        {/* Centro: Barra de Busca */}
        <div className="flex-1 flex justify-center mx-4 max-w-md">
          <SearchInput />
        </div>

        {/* Lado Direito: Navegação e Controles */}
        <nav className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Link: Locais */}
          <Link
            href="/places"
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-teal-400 transition-all duration-200"
          >
            <MapPin size={18} />
            <span className="hidden sm:inline">Locais</span>
          </Link>

          {/* 🎯 CONTROLE DO BOTÃO DE PERFIL / LOGAR */}
          {loadingProfile ? (
            /* ESTADO 1: Carregando dados (Fica cinza escuro, sem clique e sem link) */
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-600 cursor-not-allowed select-none">
              <User size={18} className="animate-pulse" />
              <span className="hidden sm:inline">Carregando...</span>
            </div>
          ) : username ? (
            /* ESTADO 2: Usuário Logado (Abre estritamente o perfil dele) */
            <Link
              href={`/profile/${username}`}
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-300 hover:bg-slate-900 hover:text-teal-400 transition-all duration-200"
            >
              <User size={18} />
              <span className="hidden sm:inline">Perfil</span>
            </Link>
          ) : (
            /* ESTADO 3: Não Logado (Substitui por 'Logar' e redireciona para a página de login) */
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-teal-400 bg-teal-500/5 hover:bg-teal-500/10 border border-teal-500/20 transition-all duration-200"
            >
              <User size={18} />
              <span className="hidden sm:inline">Logar</span>
            </Link>
          )}

          {/* 🎯 CONTROLE DO BOTÃO SAIR (Só aparece se o usuário estiver logado de fato) */}
          {!loadingProfile && username && (
            <>
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
            </>
          )}
        </nav>

      </div>
    </header>
  );
}