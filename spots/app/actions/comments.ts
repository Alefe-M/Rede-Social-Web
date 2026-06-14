'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function getComments(postId: string) {
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
      Perfis (
        username,
        avatar_url
      )
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Error fetching comments:', error)
    return []
  }

  // Busca quais comentários o usuário logado curtiu
  let userLikedComments: string[] = []
  if (user) {
    const { data: likesData } = await supabase
      .from('Curtidas_Comentarios')
      .select('cometario_id')
      .eq('user_id', user.id)
    
    if (likesData) {
      userLikedComments = likesData.map(l => l.cometario_id)
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
    isLiked: userLikedComments.includes(comment.id)
  }))
}

export async function createComment(postId: string, texto: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Não autenticado' }

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
      Perfis (
        username,
        avatar_url
      )
    `)
    .single()

  if (error) {
    console.error('Error creating comment:', error)
    return { success: false, error: 'Erro ao criar comentário' }
  }

  // Incrementa o contador de comentários no Post (tabela 'Posts')
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

  revalidatePath('/')

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
}

export async function toggleCommentLike(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Não autenticado' }

  // Verifica se já existe a curtida (cometario_id conforme sua tabela)
  const { data: existingLike } = await supabase
    .from('Curtidas_Comentarios')
    .select('*')
    .eq('cometario_id', commentId)
    .eq('user_id', user.id)
    .maybeSingle()

  let isLikedNow = false

  if (existingLike) {
    await supabase
      .from('Curtidas_Comentarios')
      .delete()
      .eq('cometario_id', commentId)
      .eq('user_id', user.id)
    isLikedNow = false
  } else {
    await supabase
      .from('Curtidas_Comentarios')
      .insert({
        cometario_id: commentId,
        user_id: user.id
      })
    isLikedNow = true
  }

  // Atualiza o contador de likes na tabela 'Comentarios'
  const { count } = await supabase
    .from('Curtidas_Comentarios')
    .select('*', { count: 'exact', head: true })
    .eq('cometario_id', commentId)

  const totalLikes = count || 0

  await supabase
    .from('Comentarios')
    .update({ likes: totalLikes })
    .eq('id', commentId)

  return { success: true, isLiked: isLikedNow, likesCount: totalLikes }
}

export async function deleteComment(commentId: string, postId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Não autenticado' }

  // 1. Verifica se o comentário pertence ao usuário
  const { data: comment, error: fetchError } = await supabase
    .from('Comentarios')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (fetchError || !comment) {
    return { success: false, error: 'Comentário não encontrado' }
  }

  if (comment.user_id !== user.id) {
    return { success: false, error: 'Não autorizado' }
  }

  // 2. Deleta o comentário
  const { error: deleteError } = await supabase
    .from('Comentarios')
    .delete()
    .eq('id', commentId)

  if (deleteError) {
    console.error('Error deleting comment:', deleteError)
    return { success: false, error: 'Erro ao deletar comentário' }
  }

  // 3. Decrementa o contador de comentários no Post
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

  revalidatePath('/')

  return { success: true }
}
