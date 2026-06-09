'use server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface LikeStatus {
  likesCount: number
  isLiked: boolean
}

// Lógica de curtir / descurtir (Toggle)
export async function toggleLike(postId: string): Promise<LikeStatus | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  // 1. Verifica se a curtida já existe no banco
  const { data: existingLike } = await supabase
    .from('likes')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  if (existingLike) {
    // Se já existia, o usuário quer descurtir -> Remove do banco
    await supabase.from('likes').delete().eq('id', existingLike.id)
  } else {
    // Se não existia, o usuário quer curtir -> Adiciona no banco
    await supabase.from('likes').insert([{ usuario_id: user.id, post_id: postId }])
  }

  // 2. Conta quantas curtidas REAIS o post tem agora na tabela 'likes'
  const { count: totalLikes } = await supabase
    .from('likes')
    .select('*', { count: 'exact', head: true })
    .eq('post_id', postId)

  const finalLikesCount = totalLikes || 0

  // 3. Atualiza a coluna estática 'likes' na tabela 'spots' para manter sincronizado e rápido
  await supabase
    .from('spots')
    .update({ likes: finalLikesCount })
    .eq('id', postId)

  return {
    likesCount: finalLikesCount,
    isLiked: !existingLike // Se existia, agora é false. Se não existia, agora é true.
  }
}

// Função auxiliar para quando renderizar o post na tela sabermos se ele inicia curtido ou não
export async function checkPostLikeStatus(postId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('likes')
    .select('id')
    .eq('usuario_id', user.id)
    .eq('post_id', postId)
    .maybeSingle()

  return !!data
}