'use server'
import { createClient } from '@supabase/supabase-js'

export interface Post {
  id?: string
  userId: string        
  username?: string      
  avatarUrl?: string    
  location: string      // cidade_estado
  place: string         // endereco_detalhado (Nome do local/endereço digitado)
  category: string      // categoria
  imageUrl: string      // imagem_url 
  content: string       // conteudo 
  rating: number        // nota (🌟 Nova propriedade de 1 a 5 estrelas)
  likes: number
  comments: number
  createdAt?: string    // criado_em
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

// ==========================================
// Getters
// ==========================================

export async function getPosts(): Promise<Post[] | null> {
  const { data, error } = await supabase
    .from('spots') 
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
    rating: item.nota || 5, // Garante um fallback caso a coluna esteja nula
    likes: item.likes,
    comments: item.comments,
    createdAt: item.criado_em
  }))
}

export async function getPostById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('spots')
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
    nota: newPost.rating,         // 🌟 Enviando a nota para a coluna do banco
    usuario_id: user.id, 
    likes: 0,
    comments: 0
  }

  const { data, error } = await supabase
    .from('spots')
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
  const dbUpdates: any = {}
  if (updates.place !== undefined) dbUpdates.endereco_detalhado = updates.place
  if (updates.category !== undefined) dbUpdates.categoria = updates.category
  if (updates.location !== undefined) dbUpdates.cidade_estado = updates.location
  if (updates.content !== undefined) dbUpdates.conteudo = updates.content
  if (updates.imageUrl !== undefined) dbUpdates.imagem_url = updates.imageUrl
  if (updates.rating !== undefined) dbUpdates.nota = updates.rating // Permite atualizar a nota

  const { data, error } = await supabase
    .from('spots')
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

// ==========================================
// Delete
// ==========================================

export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('spots')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Error deleting post ${id}: `, error.message)
    return false
  }
  return true
}

export async function getPostsWithProfiles(): Promise<Post[] | null> {
  const { data, error } = await supabase
    .from('spots')
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
      perfis (
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
    username: item.perfis?.username,
    avatarUrl: item.perfis?.avatar_url
  }))
}