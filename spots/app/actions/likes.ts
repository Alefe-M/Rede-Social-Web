'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

// Função auxiliar para criar o cliente do servidor lendo os cookies de sessão
async function getSupabaseServer() {
  const cookieStore = await cookies()

  // Tenta buscar as duas variantes comuns de nome de chave anon do Supabase
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || ''

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // Ignora se for chamado de um Server Component estático
        }
      },
    },
  })
}

export async function toggleLike(postId: string) {
  // Instancia o cliente com segurança dentro do escopo da requisição
  const supabase = await getSupabaseServer()

  try {
    // 1. Recupera o usuário logado através dos cookies passados de forma automática
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error("Usuário não autenticado para curtir.")
      return { success: false, error: "Você precisa estar logado para curtir." }
    }

    // 2. Verifica se o usuário já curtiu este post na tabela 'Curtidas_Posts'
    const { data: existingLike, error: checkError } = await supabase
      .from('Curtidas_Posts')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    if (checkError) throw checkError

    let isLikedNow = false

    if (existingLike) {
      // Se já existe, remove a curtida
      const { error: deleteError } = await supabase
        .from('Curtidas_Posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      
      if (deleteError) throw deleteError
      isLikedNow = false
    } else {
      // Se não existe, insere a nova curtida
      const { error: insertError } = await supabase
        .from('Curtidas_Posts')
        .insert({ post_id: postId, user_id: user.id })
      
      if (insertError) throw insertError
      isLikedNow = true
    }

    // 3. Conta a quantidade total atualizada de registros na tabela 'Curtidas_Posts'
    const { count, error: countError } = await supabase
      .from('Curtidas_Posts')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    if (countError) throw countError
    const totalLikes = count || 0

    // 4. Sincroniza o contador dentro da tabela 'Posts'
    await supabase
      .from('Posts')
      .update({ curtidas: totalLikes }) 
      .eq('id', postId)

    // Atualiza o cache da página instantaneamente na interface
    revalidatePath('/', 'layout')

    return {
      success: true,
      isLiked: isLikedNow,
      likesCount: totalLikes
    }

  } catch (error) {
    console.error("Erro na action toggleLike:", error)
    return { success: false, error: "Erro interno ao processar a curtida." }
  }
}

export async function checkPostLikeStatus(postId: string) {
  const supabase = await getSupabaseServer()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return false

  const { data, error } = await supabase
    .from('Curtidas_Posts')
    .select('*')
    .eq('post_id', postId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (error) {
    console.error("Erro ao verificar status da curtida:", error)
    return false
  }

  return !!data
}