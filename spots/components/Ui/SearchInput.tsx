"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export default function SearchInput() {
  const [searchTerm, setSearchTerm] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const query = searchTerm.trim();
    if (!query) return;

    // 1. Busca por Perfil: Se começar com "@", redireciona para a página do usuário
    if (query.startsWith("@")) {
      const username = query.substring(1); // Remove o "@" da string
      router.push(`/profile/${username}`);
    } 
    // 2. Busca por Local: Se não tiver "@", manda para a Home filtrando pelo local
    else {
      router.push(`/?q=${encodeURIComponent(query)}`);
    }

    setSearchTerm(""); // Limpa o campo após a busca
  };

  return (
    <form onSubmit={handleSearch} className="relative w-full max-w-md">
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="Busque @usuario ou Local..."
        className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-4 pr-10 text-sm text-white focus:border-teal-500 focus:outline-none transition-colors"
        aria-label="Buscar usuários ou locais"
      />
      <button 
        type="submit" 
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-teal-400 transition-colors"
        aria-label="Realizar busca"
      >
        <Search size={18} />
      </button>
    </form>
  );
}