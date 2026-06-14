'use client'

import { useState, useTransition, useEffect } from 'react'
import { toggleLike } from '@/app/actions/likes' 

interface LikeButtonProps {
  postId: string;
  initialLikes: number;         // Total de likes que o post já tem
  initialIsLiked?: boolean;     // NOVO: Para o botão saber se o usuário logado já curtiu esse post
  currentUserId?: string;       
}

export default function LikeButton({ 
  postId, 
  initialLikes, 
  initialIsLiked = false, // Padrão é falso caso não seja enviado
  currentUserId 
}: LikeButtonProps) {
  
  // CORREÇÃO: Forçando o tipo boolean no useState e garantindo valor não-nulo
  const [isLiked, setIsLiked] = useState<boolean>(initialIsLiked ?? false)
  const [likesCount, setLikesCount] = useState<number>(initialLikes)
  const [isPending, startTransition] = useTransition()

  // Sincroniza o estado interno se as props mudarem (ex: após refresh)
  useEffect(() => {
    setIsLiked(initialIsLiked ?? false)
    setLikesCount(initialLikes)
  }, [initialIsLiked, initialLikes])

  const handleLike = async () => {
    // Backup para o caso de erro
    const previousIsLiked = isLiked
    const previousLikesCount = likesCount

    // Atualização otimista (instantânea na tela)
    setIsLiked(!isLiked)
    setLikesCount((prev) => (isLiked ? prev - 1 : prev + 1))

    startTransition(async () => {
      const result = await toggleLike(postId)

      if (!result || !result.success) {
        // Se falhar (ex: deslogado), reverte
        setIsLiked(previousIsLiked)
        setLikesCount(previousLikesCount)
        if (result && 'error' in result) alert(result.error)
        else alert('Você precisa estar logado para curtir!')
        return
      }

      // Garante o dado real vindo do banco, forçando boolean
      setIsLiked(!!result.isLiked)
      setLikesCount(result.likesCount ?? 0)
    })
  }

  return (
    <button
      onClick={handleLike}
      disabled={isPending}
      className={`flex items-center gap-1 transition-transform active:scale-110 ${
        isLiked ? 'text-red-500 font-bold' : 'text-slate-600 hover:text-red-500'
      }`}
    >
      {/* Troca entre o coração cheio e vazio dependendo do estado */}
      <span>{isLiked ? '❤️' : '🤍'}</span>
      
      {/* Pluralização simples: 1 curtida / 2 curtidas */}
      <span>
        {likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}
      </span>
    </button>
  )
}