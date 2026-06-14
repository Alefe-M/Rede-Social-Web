'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client' // 🎯 Cliente do navegador!
import toast from 'react-hot-toast'
import { Trash2 } from 'lucide-react' 

interface CommentItemProps {
  comment: any
  postId: string
  currentUserId?: string
  onDelete: (id: string) => void
}

export default function CommentItem({ comment, postId, currentUserId, onDelete }: CommentItemProps) {
  const supabase = createClient()
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [likesCount, setLikesCount] = useState(comment.likes)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)

  // Verifica se o usuário logado é o dono do comentário para exibir a lixeirinha
  const isOwner = currentUserId === comment.userId

  // 1. Função de curtir o comentário
  const handleLike = async () => {
    if (!currentUserId) {
      toast.error('Você precisa estar logado para curtir.')
      return
    }
    if (isLiking) return
    setIsLiking(true)

    const prevLiked = isLiked
    const prevCount = likesCount

    // Otimista
    setIsLiked(!isLiked)
    setLikesCount((prev: number) => isLiked ? prev - 1 : prev + 1)

    try {
      if (isLiked) {
        await supabase.from('Curtidas_Comentarios').delete()
          .eq('comentario_id', comment.id).eq('user_id', currentUserId)
      } else {
        await supabase.from('Curtidas_Comentarios').insert({
          comentario_id: comment.id, user_id: currentUserId
        })
      }

      const { count } = await supabase.from('Curtidas_Comentarios')
        .select('*', { count: 'exact', head: true })
        .eq('comentario_id', comment.id)

      const total = count || 0
      await supabase.from('Comentarios').update({ likes: total }).eq('id', comment.id)
      
      setLikesCount(total)

    } catch (err) {
      setIsLiked(prevLiked)
      setLikesCount(prevCount)
      toast.error('Erro ao curtir comentário.')
    } finally {
      setIsLiking(false)
    }
  }

  // 2. Função de deletar o comentário
  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return
    setIsDeleting(true)

    try {
      await supabase.from('Comentarios').delete().eq('id', comment.id)
      
      // Atualiza o contador de comentários do Post
      const { count } = await supabase.from('Comentarios')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)
      
      await supabase.from('Posts').update({ comments: count || 0 }).eq('postId', postId)

      onDelete(comment.id) // Remove da tela
      toast.success('Comentário excluído!')
    } catch (err) {
      toast.error('Erro ao excluir comentário.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="flex gap-2 py-2 items-start group">
      <a
        href={`/profile/${comment.username}`}
        className="flex h-7 w-7 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 shrink-0 mt-0.5 hover:bg-teal-200 transition-colors"
      >
        {comment.username ? comment.username.charAt(0).toUpperCase() : 'U'}
      </a>
      
      <div className="flex-1 text-sm">
        <p className="text-slate-700 leading-snug">
          <a
            href={`/profile/${comment.username}`}
            className="font-bold text-slate-900 mr-2 hover:text-teal-600 transition-colors"
          >
            {comment.username}
          </a>
          {comment.texto}
        </p>
        
        <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500 font-medium">
          <button 
            onClick={handleLike} 
            className={`flex items-center gap-1 hover:text-red-500 transition-colors ${isLiked ? 'text-red-500' : ''}`}
          >
            {isLiked ? '❤️' : '🤍'} {likesCount > 0 && likesCount}
          </button>
          
          {isOwner && (
            <button 
              onClick={handleDelete} 
              disabled={isDeleting} 
              className="opacity-0 group-hover:opacity-100 flex items-center gap-1 text-slate-400 hover:text-red-500 transition-all"
            >
              {isDeleting ? '...' : <Trash2 size={13} />}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}