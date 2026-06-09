'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, MapPin, User as UserIcon } from 'lucide-react'
import { searchSpotsAndUsers } from "@/app/actions/search" // Busca a função direto de app/actions/search.ts

export default function SearchInput() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<{ users: any[]; posts: any[] }>({ users: [], posts: [] })
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce: Aguarda 300ms após o usuário parar de digitar para chamar o banco
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (query.trim().length > 0) {
        setLoading(true)
        const res = await searchSpotsAndUsers(query)
        setResults(res)
        setIsOpen(true)
        setLoading(false)
      } else {
        setResults({ users: [], posts: [] })
        setIsOpen(false)
      }
    }, 300)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  // Fecha a caixinha de resultados se clicar fora da barra de busca
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const temResultados = results.users.length > 0 || results.posts.length > 0

  return (
    <div ref={containerRef} className="relative w-full z-50">
      {/* Input de Busca estilo Dark (Combina com seu slate-950) */}
      <div className="relative flex items-center w-full h-9 rounded-xl bg-slate-900 border border-slate-800 focus-within:border-slate-700 transition duration-200">
        <Search className="absolute left-3 w-4 h-4 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim().length > 0 && setIsOpen(true)}
          placeholder="Pesquisar..."
          className="w-full h-full pl-9 pr-4 text-sm bg-transparent outline-none text-slate-200 placeholder-slate-500"
        />
      </div>

      {/* Dropdown de resultados suspensos */}
      {isOpen && (
        <div className="absolute top-11 left-0 w-full max-h-96 overflow-y-auto rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 flex flex-col gap-3 scrollbar-none">
          
          {loading && (
            <p className="text-xs text-center text-slate-500 py-2 animate-pulse">Buscando...</p>
          )}

          {!loading && !temResultados && (
            <p className="text-xs text-center text-slate-500 py-2">Nenhum resultado encontrado.</p>
          )}

          {/* Seção: Pessoas */}
          {!loading && results.users.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-1">
                Pessoas
              </h3>
              <div className="flex flex-col gap-0.5">
                {results.users.map((user) => (
                  <a
                    key={user.id}
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition group"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.username}
                        className="w-7 h-7 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-zinc-500">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span className="text-sm font-medium text-slate-300 group-hover:text-teal-400 transition-colors">
                      @{user.username}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Seção: Spots / Publicações */}
          {!loading && results.posts.length > 0 && (
            <div>
              <h3 className="text-[10px] font-bold tracking-wider text-slate-500 uppercase px-2 mb-1">
                Spots encontrados
              </h3>
              <div className="flex flex-col gap-0.5">
                {results.posts.map((post) => (
                  <a
                    key={post.id}
                    href={`/places/${post.id}`}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-800/60 transition group"
                  >
                    {post.imageUrl ? (
                      <img
                        src={post.imageUrl}
                        alt={post.place}
                        className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-800"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-slate-200 group-hover:text-teal-400 transition-colors truncate">
                        {post.place}
                      </span>
                      <span className="text-xs text-slate-400 truncate">
                        {post.location} • {post.content}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}