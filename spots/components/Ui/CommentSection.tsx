'use client'

import { useState, useEffect } from 'react'
import { getComments, createComment } from '@/app/actions/comments'
import CommentItem from './CommentItem'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  texto: string
  username: string
  likes: number
  isLiked: boolean
}

interface CommentSectionProps {
  postId: string
  currentUserId?: string
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAll, setShowAll] = useState(false)

  useEffect(() => {
    async function loadComments() {
      setLoading(true)
      const data = await getComments(postId)
      setComments(data as Comment[])
      setLoading(false)
    }
    loadComments()
  }, [postId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    setIsSubmitting(true)
    const result = await createComment(postId, newComment.trim())
    
    if (result.success && result.comment) {
      setComments(prev => [...prev, result.comment as Comment])
      setNewComment('')
      toast.success('Comentário enviado!')
    } else {
      toast.error(result.error || 'Erro ao comentar')
    }
    setIsSubmitting(false)
  }

  const handleDeleteLocally = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

  // Mostra apenas os 2 últimos ou todos se o usuário clicar para ver todos
  const visibleComments = showAll ? comments : comments.slice(-2)

  return (
    <div className="mt-3 border-t border-slate-100 pt-3">
      {comments.length > 2 && !showAll && (
        <button 
          onClick={() => setShowAll(true)}
          className="mb-2 text-sm text-slate-500 hover:text-slate-700 font-medium"
        >
          Ver todos os {comments.length} comentários
        </button>
      )}

      <div className="space-y-1">
        {loading ? (
          <p className="text-xs text-slate-400">Carregando comentários...</p>
        ) : comments.length === 0 ? (
          <p className="text-xs text-slate-400">Seja o primeiro a comentar!</p>
        ) : (
          visibleComments.map(comment => (
            <CommentItem 
              key={comment.id} 
              comment={comment} 
              postId={postId}
              currentUserId={currentUserId}
              onDelete={handleDeleteLocally}
            />
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Adicione um comentário..."
          className="flex-1 text-sm bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-400 text-slate-900"
        />
        <button
          type="submit"
          disabled={!newComment.trim() || isSubmitting}
          className="text-sm font-bold text-teal-600 disabled:opacity-50 hover:text-teal-700 transition"
        >
          {isSubmitting ? '...' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}
