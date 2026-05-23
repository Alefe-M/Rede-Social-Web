'use server'
import { createClient } from '@supabase/supabase-js'

export interface Post{
    id?: string
    userId: string
    name: string
    imagem: string
    data: string
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!)

//Getters

export async function getPosts(): Promisse<Post[] | null> {
    const {data, error} = await supabase
    .from('Posts')
    .select('*')
    .order('name', {ascending: true})

    if (error){
        console.error('Erro ao buscar os Posts: ', error.message)
        return null
    }

    return data as Post[]
}

export async function getPostsById(id: string): Promise<Post[] | null> {
    const {data, error} = await supabase
    .from('Posts')
    .select('*')
    .eq('id', id)
    .single()

    if (error){
        console.error('Erro ao buscar o Post ${id}: ', error.message)
        return null
    }
    return data as Post[]
}

//Setters

export async function createPost(newPost: Post): Promise<Post[] | null> {
    const { data, error} = await supabase
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

export async function updatePost(id: string, updates: Partial<Post>): Promise<Post | null{
    const { data, error} = await supabase
    .from('Posts')
    .update(updates)
    .eq('id': id)
    .select()
    .single()

    if (error){
        console.error('Erro ao atualizar o Post: ', error.message)
        return null
    }
    return data as Post
}

//Delete

export async function deletePost(id: string): Promise<Boolean>{
    const {error} = await supabase
    .from('Posts')
    .delete()
    .eq('id', id)

    if (error){
        console.error('Erro ao deletar o Post ${id}: ', error.message);
        return false
        
    }
    return true
}