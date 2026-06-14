'use server'

import { cookies } from 'next/headers' // 1. IMPORTANTE: Importar os cookies do Next.js
import { createClient } from '@/utils/supabase/server' 

export interface Post {
  id?: string
  userId: string        
  username?: string      
  avatarUrl?: string    
  location: string      
  place: string         
  category: string      
  imageUrl: string      
  content: string       
  rating: number        
  likes: number
  comments: number
  createdAt?: string    
}

// ==========================================
// Getters
// ==========================================

export async function getPosts(): Promise<Post[] | null> {
  const cookieStore = await cookies() // 2. Pega os cookies do navegador
  const supabase = await createClient() // 3. Passa os cookies aqui (sem o await antes do createClient)

  const { data, error } = await supabase
    .from('Posts') 
    .select('*')
    .order('criado_em', { ascending: false }) 

  if (error) {
    console.error('Error fetching posts: ', error.message)
    return null
  }

  return data.map((item: any) => ({
    id: item.id,
    userId: item.usuario_id,
    location: item.cidade_estado,
    place: item.endereco_detalhado,
    category: item.categoria,
    imageUrl: item.imagem_url,
    content: item.conteudo,
    rating: item.nota || 5, 
    likes: item.likes,
    comments: item.comments,
    createdAt: item.criado_em
  }))
}

export async function getPostById(id: string): Promise<Post | null> {
  const cookieStore = await cookies()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error fetching post ${id}: `, error.message)
    return null
  }

  return {
    id: data.id,
    userId: data.usuario_id,
    location: data.cidade_estado,
    place: data.endereco_detalhado,
    category: data.categoria,
    imageUrl: data.imagem_url,
    content: data.conteudo,
    rating: data.nota || 5,
    likes: data.likes,
    comments: data.comments,
    createdAt: data.criado_em
  }
}

// ==========================================
// Setters
// ==========================================

export async function createPost(newPost: Omit<Post, 'userId' | 'likes' | 'comments'>): Promise<Post | null> {
  const cookieStore = await cookies()
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    console.error('User not authenticated')
    return null
  }

  const dbRow = {
    endereco_detalhado: newPost.place,
    categoria: newPost.category,
    cidade_estado: newPost.location,
    conteudo: newPost.content,   
    imagem_url: newPost.imageUrl, 
    nota: newPost.rating,         
    usuario_id: user.id, 
    likes: 0,
    comments: 0
  }

  const { data, error } = await supabase
    .from('Posts')
    .insert([dbRow])
    .select()
    .single()

  if (error) {
    console.error('Error creating post: ', error.message)
    return null
  }

  return {
    id: data.id,
    userId: data.usuario_id,
    location: data.cidade_estado,
    place: data.endereco_detalhado,
    category: data.categoria,
    imageUrl: data.imagem_url,
    content: data.conteudo,
    rating: data.nota,
    likes: data.likes,
    comments: data.comments,
    createdAt: data.criado_em
  }
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const cookieStore = await cookies()
  const supabase = await createClient()
  
  const dbUpdates: any = {}
  if (updates.place !== undefined) dbUpdates.endereco_detalhado = updates.place
  if (updates.category !== undefined) dbUpdates.categoria = updates.category
  if (updates.location !== undefined) dbUpdates.cidade_estado = updates.location
  if (updates.content !== undefined) dbUpdates.conteudo = updates.content
  if (updates.imageUrl !== undefined) dbUpdates.imagem_url = updates.imageUrl
  if (updates.rating !== undefined) dbUpdates.nota = updates.rating 

  const { data, error } = await supabase
    .from('Posts')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating post: ', error.message)
    return null
  }

  return {
    id: data.id,
    userId: data.usuario_id,
    location: data.cidade_estado,
    place: data.endereco_detalhado,
    category: data.categoria,
    imageUrl: data.imagem_url,
    content: data.conteudo,
    rating: data.nota,
    likes: data.likes,
    comments: data.comments,
    createdAt: data.criado_em
  }
}

import { revalidatePath } from 'next/cache'

// ... existing code ...

// ==========================================
// Delete
// ==========================================

export async function deletePost(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Não autenticado' }

  // Verifica se o post pertence ao usuário
  const { data: post, error: fetchError } = await supabase
    .from('Posts')
    .select('userId')
    .eq('postId', id)
    .single()

  if (fetchError || !post) {
    return { success: false, error: 'Postagem não encontrada' }
  }

  if (post.userId !== user.id) {
    return { success: false, error: 'Não autorizado' }
  }
  
  const { error } = await supabase
    .from('Posts')
    .delete()
    .eq('postId', id)

  if (error) {
    console.error(`Error deleting post ${id}: `, error.message)
    return { success: false, error: 'Erro ao deletar postagem' }
  }

  revalidatePath('/')
  return { success: true }
}

export async function getPostsWithProfiles(): Promise<Post[] | null> {
  const cookieStore = await cookies()
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Posts')
    .select(`
      id,
      cidade_estado,
      endereco_detalhado,
      categoria,
      imagem_url,
      conteudo,
      nota,
      likes,
      comments,
      criado_em,
      usuario_id,
      Perfis (
        username,
        avatar_url
      )
    `)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Error fetching posts with profiles:', error.message)
    return null
  }

  return data.map((item: any) => ({
    id: item.id,
    userId: item.usuario_id,
    location: item.cidade_estado,
    place: item.endereco_detalhado,
    category: item.categoria,
    imageUrl: item.imagem_url,
    content: item.conteudo,
    rating: item.nota || 5,
    likes: item.likes,
    comments: item.comments,
    createdAt: item.criado_em,
    username: item.Perfis?.username,
    avatarUrl: item.Perfis?.avatar_url
  }))
}