'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client' // 🎯 Usando o client do navegador!
import toast from 'react-hot-toast'

interface LikeButtonProps {
  postId: string;
  initialLikes: number;
  initialIsLiked?: boolean;
  currentUserId?: string;       
}

export default function LikeButton({ 
  postId, 
  initialLikes, 
  initialIsLiked = false,
  currentUserId 
}: LikeButtonProps) {
  
  const supabase = createClient()
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked ?? false)
  const [likesCount, setLikesCount] = useState<number>(initialLikes)
  const [isPending, setIsPending] = useState(false)

  useEffect(() => {
    setIsLiked(initialIsLiked ?? false)
    setLikesCount(initialLikes)
  }, [initialIsLiked, initialLikes])

  const handleLike = async () => {
    if (!currentUserId) {
      toast.error("Você precisa estar logado para curtir.")
      return
    }

    if (isPending) return
    setIsPending(true)

    // Backup visual
    const previousIsLiked = isLiked
    const previousLikesCount = likesCount

    // Atualização otimista na tela (instantâneo)
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    try {
      if (isLiked) {
        // Já curtia, vamos deletar
        await supabase
          .from('Curtidas_Posts')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', currentUserId)
      } else {
        // Não curtia, vamos inserir
        await supabase
          .from('Curtidas_Posts')
          .insert({ post_id: postId, user_id: currentUserId })
      }

      // Conta o total real no banco
      const { count } = await supabase
        .from('Curtidas_Posts')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      const totalLikes = count || 0

      // Salva no post
      await supabase
        .from('Posts')
        .update({ likes: totalLikes })
        .eq('postId', postId)

      // Garante a sincronia final
      setLikesCount(totalLikes)

    } catch (err) {
      // Se a internet falhar
      setIsLiked(previousIsLiked)
      setLikesCount(previousLikesCount)
      toast.error("Erro ao curtir a publicação.")
    } finally {
      setIsPending(false)
    }
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-1 transition-transform active:scale-110 ${
        isLiked ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-red-500'
      } ${isPending ? 'opacity-50' : ''}`}
    >
      <span>{isLiked ? '❤️' : '🤍'}</span>
      <span>
        {likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}
      </span>
    </button>
  )
}