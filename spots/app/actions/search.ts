'use server'
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

// 💡 Certifique-se de que o relacionamento aqui está com 'perfis' minúsculo
const POST_SELECT_FIELDS = `
  id,
  usuario_id,
  cidade_estado,
  endereco_detalhado,
  categoria,
  imagem_url,
  conteudo,
  nota,
  likes,
  comments,
  criado_em,
  perfis (
    username,
    avatar_url
  )
`

// Função de mapeamento idêntica à que você já usa
function mapearPost(item: any) {
  return {
    id: item.id,
    userId: item.usuario_id,
    location: item.cidade_estado,
    place: item.endereco_detalhado,
    category: item.categoria,
    imageUrl: item.imagem_url,
    content: item.conteudo,
    rating: item.nota || 5,
    likes: item.likes || 0,
    comments: item.comments || 0,
    createdAt: item.criado_em,
    username: item.perfis?.username,
    avatarUrl: item.perfis?.avatar_url
  }
}

export async function searchSpotsAndUsers(searchTerm: string) {
  const cleanTerm = searchTerm.trim()
  if (!cleanTerm) return { users: [], posts: [] }

  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const searchOnlyUsers = cleanTerm.startsWith('@')

  if (searchOnlyUsers) {
    const usernameQuery = cleanTerm.slice(1)
    if (!usernameQuery) return { users: [], posts: [] }

    const { data: users, error } = await supabase
      .from('Perfis') 
      .select('id, username, avatar_url')
      .ilike('username', `%${usernameQuery}%`)
      .limit(10)

    if (error) console.error('Erro na busca por @:', error.message)

    return { users: users || [], posts: [] }
  }

  // 🏠 Busca Geral (Quando não tem @)
  const [resUsers, resPosts] = await Promise.all([
    supabase
      .from('Perfim') // Garanta se o nome no seu banco é Perfis ou Perfim
      .select('id, username, avatar_url')
      .ilike('username', `%${cleanTerm}%`)
      .limit(5),
    
    supabase
      .from('spots')
      .select(POST_SELECT_FIELDS)
      // 🎯 STRING BLINDADA: Tudo junto, sem espaços antes ou depois das vírgulas
      .or(`conteudo.ilike.%${cleanTerm}%,endereco_detalhado.ilike.%${cleanTerm}%,cidade_estado.ilike.%${cleanTerm}%,categoria.ilike.%${cleanTerm}%`)
      .order('criado_em', { ascending: false })
      .limit(10)
  ])

  if (resUsers.error) console.error('Erro ao buscar usuários:', resUsers.error.message)
  if (resPosts.error) console.error('Erro ao buscar spots:', resPosts.error.message)

  return {
    users: resUsers.data || [],
    posts: (resPosts.data || []).map(mapearPost)
  }
}