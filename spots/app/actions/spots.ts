'use server'
import { createClient } from '@supabase/supabase-js'

export interface Post {
  id?: string
  userId: string
  user: string,
  username: string,
  profileUrl: string,
  place: string,
  placeUrl: string,
  category: string,
  location: string,
  image: string,
  caption: string,
  likes: number,
  comments: number,
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rnxehjgzbpfcyrurtpba.supabase.co',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'sb_publishable_h5rHJoyNwaAi7cHnJj-F3g_-Z6-VoRw'
)

// ==========================================
// Getters
// ==========================================

export async function getPosts(): Promise<Post[] | null> {
  const { data, error } = await supabase
    .from('Posts')
    .select('*')
    .order('createdAt', { ascending: true })

  if (error) {
    console.error('Erro ao buscar os Posts: ', error.message)
    return null
  }

  return data as Post[]
}

// Corrigido para retornar apenas um Post (ou null), já que usa .single()
export async function getPostsById(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from('Posts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Erro ao buscar o Post ${id}: `, error.message)
    return null
  }
  return data as Post
}

// ==========================================
// Setters
// ==========================================

// Corrigido para retornar um único Post em vez de uma lista (Post[]), já que usa .single()
export async function createPost(newPost: Post): Promise<Post | null> {
  const { data, error } = await supabase
    .from('Posts')
    .insert([newPost])
    .select()
    .single()

  if (error) {
    console.error('Erro ao criar novo Post: ', error.message)
    return null
  }
  return data as Post
}

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null> {
  const { data, error } = await supabase
    .from('Posts')
    .update(updates)
    .eq('id', id) // Corrigida a sintaxe do .eq()
    .select()
    .single()

  if (error) {
    console.error('Erro ao atualizar o Post: ', error.message)
    return null
  }
  return data as Post
}

// ==========================================
// Delete
// ==========================================

// Ajustado "Boolean" para "boolean" minúsculo (padrão do TypeScript)
export async function deletePost(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('Posts')
    .delete()
    .eq('id', id)

  if (error) {
    console.error(`Erro ao deletar o Post ${id}: `, error.message)
    return false
  }
  return true
}