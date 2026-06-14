'use client'

import { useState, useTransition, useEffect } from 'react'
import Link from 'next/link'
import { Heart, Trash2 } from 'lucide-react'
import { toggleCommentLike, deleteComment } from '@/app/actions/comments'
import toast from 'react-hot-toast'

interface CommentItemProps {
  comment: {
    id: string
    texto: string
    username: string
    userId: string
    likes: number
    isLiked: boolean
  }
  postId: string
  currentUserId?: string
  onDelete?: (id: string) => void
}

export default function CommentItem({ comment, postId, currentUserId, onDelete }: CommentItemProps) {
  const [isLiked, setIsLiked] = useState(comment.isLiked)
  const [likesCount, setLikesCount] = useState(comment.likes)
  const [isPending, startTransition] = useTransition()
  const [isDeleting, setIsDeleting] = useState(false)

  const isOwner = currentUserId === comment.userId

  // Sincroniza o estado interno se as props mudarem (ex: após refresh ou revalidação)
  useEffect(() => {
    setIsLiked(comment.isLiked)
    setLikesCount(comment.likes)
  }, [comment.isLiked, comment.likes])

  const handleLike = async () => {
    // Backup para reverter em caso de erro
    const previousIsLiked = isLiked
    const previousLikesCount = likesCount

    // Atualização otimista
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)

    startTransition(async () => {
      const result = await toggleCommentLike(comment.id)
      if (!result.success) {
        setIsLiked(previousIsLiked)
        setLikesCount(previousLikesCount)
      } else {
        setIsLiked(result.isLiked)
        setLikesCount(result.likesCount)
      }
    })
  }

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir este comentário?')) return

    setIsDeleting(true)
    const result = await deleteComment(comment.id, postId)

    if (result.success) {
      toast.success('Comentário excluído')
      if (onDelete) onDelete(comment.id)
    } else {
      toast.error(result.error || 'Erro ao excluir')
      setIsDeleting(false)
    }
  }

  return (
    <div className={`group flex items-start justify-between gap-2 py-1 ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="text-sm flex-1">
        <Link 
          href={`/profile/${comment.username}`} 
          className="font-bold text-slate-900 hover:underline mr-2"
        >
          {comment.username}
        </Link>
        <span className="text-slate-700">{comment.texto}</span>
        
        {likesCount > 0 && (
          <div className="mt-0.5 text-[10px] text-slate-400 font-medium">
            {likesCount} {likesCount === 1 ? 'curtida' : 'curtidas'}
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        {isOwner && (
          <button 
            onClick={handleDelete}
            disabled={isDeleting}
            className="mt-1 text-slate-300 hover:text-red-500 transition-colors"
            title="Excluir comentário"
          >
            <Trash2 size={14} />
          </button>
        )}

        <button 
          onClick={handleLike}
          disabled={isPending || isDeleting}
          className={`mt-1 transition-transform active:scale-125 ${
            isLiked ? 'text-red-500' : 'text-slate-300 hover:text-slate-400'
          }`}
        >
          <Heart size={14} fill={isLiked ? "currentColor" : "none"} />
        </button>
      </div>
    </div>
  )
}
