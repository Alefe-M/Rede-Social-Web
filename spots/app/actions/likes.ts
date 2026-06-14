'use server'

import { createClient } from '@/utils/supabase/server' // 🎯 Voltando para a sua conexão oficial!
import { revalidatePath } from 'next/cache'

export async function toggleLike(postId: string) {
  try {
    const supabase = await createClient()
    
    // 1. Valida o usuário
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return { success: false, error: "Você precisa estar logado para curtir." }
    }

    // 2. Verifica curtida existente
    const { data: existingLike } = await supabase
      .from('Curtidas_Posts')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    let isLikedNow = false

    if (existingLike) {
      await supabase
        .from('Curtidas_Posts')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', user.id)
      isLikedNow = false
    } else {
      await supabase
        .from('Curtidas_Posts')
        .insert({ post_id: postId, user_id: user.id })
      isLikedNow = true
    }

    // 3. Atualiza a contagem
    const { count } = await supabase
      .from('Curtidas_Posts')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    const totalLikes = count || 0

    // 4. Salva a nova contagem no Post
    const { error: updateError } = await supabase
      .from('Posts')
      .update({ likes: totalLikes }) 
      .eq('postId', postId)

    if (updateError) {
      console.error("Erro UPDATE do banco:", updateError.message)
      return { success: false, error: "Erro ao atualizar curtida no servidor." }
    }

    // 5. Manda atualizar a tela principal
    revalidatePath('/', 'layout')

    return {
      success: true,
      isLiked: isLikedNow,
      likesCount: totalLikes
    }

  } catch (error) {
    console.error("Crash geral no toggleLike:", error)
    return { success: false, error: "Falha na comunicação com o banco." }
  }
}

export async function checkPostLikeStatus(postId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false

    const { data } = await supabase
      .from('Curtidas_Posts')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user.id)
      .maybeSingle()

    return !!data
  } catch {
    return false
  }
}