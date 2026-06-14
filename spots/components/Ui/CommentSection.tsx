'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client' // 🎯 Cliente do navegador!
import CommentItem from './CommentItem'
import toast from 'react-hot-toast'

interface Comment {
  id: string
  texto: string
  username: string
  avatarUrl?: string
  userId: string
  likes: number
  isLiked: boolean
  createdAt: string
}

interface CommentSectionProps {
  postId: string
  currentUserId?: string
}

export default function CommentSection({ postId, currentUserId }: CommentSectionProps) {
  const supabase = createClient()
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // 1. Carrega os comentários pelo navegador
  useEffect(() => {
    async function loadComments() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('Comentarios')
          .select(`
            id, texto, created_at, user_id, likes, 
            Perfis (username, avatar_url)
          `)
          .eq('post_id', postId)
          .order('created_at', { ascending: true })

        if (error) throw error

        let userLikedComments: string[] = []
        if (currentUserId) {
          const { data: likesData } = await supabase
            .from('Curtidas_Comentarios')
            .select('comentario_id')
            .eq('user_id', currentUserId)
          
          if (likesData) {
            userLikedComments = likesData.map(l => String(l.comentario_id))
          }
        }

        const formattedComments = (data || []).map((c: any) => ({
          id: c.id,
          texto: c.texto,
          createdAt: c.created_at,
          userId: c.user_id,
          likes: c.likes || 0,
          username: c.Perfis?.username || 'usuário',
          avatarUrl: c.Perfis?.avatar_url,
          isLiked: userLikedComments.includes(String(c.id))
        }))

        setComments(formattedComments)
      } catch (err) {
        console.error('Erro ao buscar comentários:', err)
      } finally {
        setLoading(false)
      }
    }
    
    if (postId) loadComments()
  }, [postId, currentUserId])

  // 2. Publica o comentário direto no banco pelo navegador
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || isSubmitting) return

    if (!currentUserId) {
      toast.error('Você precisa estar logado para comentar!')
      return
    }

    setIsSubmitting(true)
    
    try {
      // Insere o comentário
      const { data: insertedData, error: insertError } = await supabase
        .from('Comentarios')
        .insert({
          post_id: postId,
          user_id: currentUserId,
          texto: newComment.trim()
        })
        .select(`
          id, texto, created_at, user_id, likes, 
          Perfis (username, avatar_url)
        `)
        .single()

      if (insertError) throw insertError

      // Atualiza contador de comentários daquele post no banco
      const { count } = await supabase
        .from('Comentarios')
        .select('*', { count: 'exact', head: true })
        .eq('post_id', postId)

      await supabase
        .from('Posts')
        .update({ comments: count || 0 })
        .eq('postId', postId)

      // Atualiza a interface
      const formattedComment: Comment = {
        id: insertedData.id,
        texto: insertedData.texto,
        createdAt: insertedData.created_at,
        userId: insertedData.user_id,
        likes: insertedData.likes || 0,
        username: insertedData.Perfis?.username || 'usuário',
        avatarUrl: insertedData.Perfis?.avatar_url,
        isLiked: false
      }

      setComments(prev => [...prev, formattedComment])
      setNewComment('')
      toast.success('Comentário publicado!')

    } catch (err) {
      console.error('Erro ao comentar:', err)
      toast.error('Erro ao publicar comentário.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteLocally = (commentId: string) => {
    setComments(prev => prev.filter(c => c.id !== commentId))
  }

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