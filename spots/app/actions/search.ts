'use server'
import { cookies } from "next/headers"
import { createClient } from "@/utils/supabase/server"

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
  //  Garante o retorno padrão caso esteja vazio
  if (!cleanTerm) return { users: [], posts: [] }

  try {
    const cookieStore = await cookies()
    const supabase = await createClient()

    const searchOnlyUsers = cleanTerm.startsWith('@')

    if (searchOnlyUsers) {
      const usernameQuery = cleanTerm.slice(1)
      if (!usernameQuery) return { users: [], posts: [] }

      const { data: users, error } = await supabase
        .from('Perfis') 
        .select('id, username, avatar_url')
        .ilike('username', `%${usernameQuery}%`)
        .limit(10)

      if (error) throw error

      return { users: users || [], posts: [] }
    }

    //  Busca Geral
    const [resUsers, resPosts] = await Promise.all([
      supabase
        .from('Perfis') 
        .select('id, username, avatar_url')
        .ilike('username', `%${cleanTerm}%`)
        .limit(5),
      
      supabase
        .from('spots')
        .select(POST_SELECT_FIELDS)
        // 🎯 SINTAXE DO SUPABASE CORRIGIDA: Sem aspas internas e sem pontos extras artificiais
        .or(`conteudo.ilike.%${cleanTerm}%,endereco_detalhado.ilike.%${cleanTerm}%,cidade_estado.ilike.%${cleanTerm}%,categoria.ilike.%${cleanTerm}%`)
        .order('criado_em', { ascending: false })
        .limit(10)
    ])

    if (resUsers.error) console.error('Erro Perfis:', resUsers.error.message)
    if (resPosts.error) console.error('Erro Spots:', resPosts.error.message)

    return {
      users: resUsers.data || [],
      posts: (resPosts.data || []).map(mapearPost)
    }

  } catch (error) {
    //  Se o banco falhar catastroficamente, o site NÃO quebra a tela
    console.error('Erro crítico na busca:', error)
    return { users: [], posts: [] }
  }
}