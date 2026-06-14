'use server'

import { createClient } from '@/utils/supabase/server' // 🎯 Usando a sua conexão oficial
import { revalidatePath } from 'next/cache'

// Busca de comentários
export async function getComments(postId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const { data, error } = await supabase
      .from('Comentarios')
      .select(`
        id,
        texto,
        created_at,
        user_id,
        likes,
        Perfis (username, avatar_url)
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Erro ao buscar comentarios:', error)
      return []
    }

    let userLikedComments: string[] = []
    if (user) {
      const { data: likesData } = await supabase
        .from('Curtidas_Comentarios')
        .select('comentario_id')
        .eq('user_id', user.id)
      
      if (likesData) {
        userLikedComments = likesData.map(l => String(l.comentario_id))
      }
    }

    return data.map((comment: any) => ({
      id: comment.id,
      texto: comment.texto,
      createdAt: comment.created_at,
      userId: comment.user_id,
      likes: comment.likes || 0,
      username: comment.Perfis?.username || 'usuário',
      avatarUrl: comment.Perfis?.avatar_url,
      isLiked: userLikedComments.includes(String(comment.id))
    }))
  } catch (err) {
    console.error('Falha geral no getComments:', err)
    return []
  }
}

// Criação de comentário
export async function createComment(postId: string, texto: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    // Insere o comentário
    const { data: newComment, error } = await supabase
      .from('Comentarios')
      .insert({
        post_id: postId,
        user_id: user.id,
        texto
      })
      .select(`
        id,
        texto,
        created_at,
        user_id,
        likes,
        Perfis (username, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Erro ao criar comentário no banco:', error)
      return { success: false, error: 'Erro ao registrar no banco de dados.' }
    }

    // Atualiza a tabela de Posts
    const { data: postData } = await supabase
      .from('Posts')
      .select('comments')
      .eq('postId', postId)
      .single()
    
    const newCount = (postData?.comments || 0) + 1

    await supabase
      .from('Posts')
      .update({ comments: newCount })
      .eq('postId', postId)

    revalidatePath('/', 'layout')

    return { 
      success: true, 
      comment: {
        id: newComment.id,
        texto: newComment.texto,
        createdAt: newComment.created_at,
        userId: newComment.user_id,
        likes: newComment.likes || 0,
        username: newComment.Perfis?.username || 'usuário',
        avatarUrl: newComment.Perfis?.avatar_url,
        isLiked: false
      }
    }
  } catch (err) {
    console.error('Crash no servidor ao criar comentário:', err)
    return { success: false, error: 'Ocorreu um erro inesperado no servidor.' }
  }
}

// Curtir Comentário
export async function toggleCommentLike(commentId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    const { data: existingLike } = await supabase
      .from('Curtidas_Comentarios')
      .select('*')
      .eq('comentario_id', commentId)
      .eq('user_id', user.id)
      .maybeSingle()

    let isLikedNow = false

    if (existingLike) {
      await supabase
        .from('Curtidas_Comentarios')
        .delete()
        .eq('comentario_id', commentId)
        .eq('user_id', user.id)
      isLikedNow = false
    } else {
      await supabase
        .from('Curtidas_Comentarios')
        .insert({ comentario_id: commentId, user_id: user.id })
      isLikedNow = true
    }

    const { count } = await supabase
      .from('Curtidas_Comentarios')
      .select('*', { count: 'exact', head: true })
      .eq('comentario_id', commentId)

    const totalLikes = count || 0

    await supabase
      .from('Comentarios')
      .update({ likes: totalLikes })
      .eq('id', commentId)

    return { success: true, isLiked: isLikedNow, likesCount: totalLikes }
  } catch (err) {
    console.error('Crash no curtir comentário:', err)
    return { success: false, error: 'Erro no servidor' }
  }
}

// Excluir Comentário
export async function deleteComment(commentId: string, postId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return { success: false, error: 'Não autenticado' }

    const { data: comment, error: fetchError } = await supabase
      .from('Comentarios')
      .select('user_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment || comment.user_id !== user.id) {
      return { success: false, error: 'Não autorizado ou comentário não encontrado' }
    }

    const { error: deleteError } = await supabase
      .from('Comentarios')
      .delete()
      .eq('id', commentId)

    if (deleteError) return { success: false, error: 'Erro ao deletar comentário' }

    const { data: postData } = await supabase
      .from('Posts')
      .select('comments')
      .eq('postId', postId)
      .single()
    
    const newCount = Math.max(0, (postData?.comments || 0) - 1)

    await supabase
      .from('Posts')
      .update({ comments: newCount })
      .eq('postId', postId)

    revalidatePath('/', 'layout')

    return { success: true }
  } catch (err) {
    console.error('Crash ao deletar comentário:', err)
    return { success: false, error: 'Erro no servidor' }
  }
}