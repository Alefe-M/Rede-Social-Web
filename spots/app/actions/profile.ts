'use server'
import { Post } from './spots'
import { createClient } from '@/utils/supabase/client' // Ajuste o caminho se necessário
import { SignInWithPasswordCredentials } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  username: string
  fullName?: string      // maps to full_name
  avatarUrl?: string     // maps to avatar_url
  bio?: string
  followersCount: number
  followingCount: number
  visitedSpotsCount: number
  isFollowing: boolean   // Helper para o estado do botão no Front-end
}

const supabase = createClient() // 🌟 Vazio! Ele já pega as chaves sozinho lá do client.ts

// Busca os dados completos do perfil público de um usuário pelo 'username'
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const { data: currentAuth } = await supabase.auth.getUser()
  const currentUserId = currentAuth?.user?.id

  // 1. Busca os dados do perfil
  const { data: profile, error } = await supabase
    .from('perfis')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    console.error('Profile not found:', error?.message)
    return null
  }

  // 2. Conta seguidores e seguindo
  const { count: followersCount } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('following_id', profile.id)
  const { count: followingCount } = await supabase.from('followers').select('*', { count: 'exact', head: true }).eq('follower_id', profile.id)

  // 3. Conta quantos locais únicos esse usuário postou (Locais Visitados)
  const { data: spots } = await supabase.from('spots').select('cidade_estado').eq('usuario_id', profile.id)
  const uniqueLocations = new Set(spots?.map(s => s.cidade_estado) || [])

  // 4. Verifica se o usuário logado atualmente segue este perfil
  let isFollowing = false
  if (currentUserId) {
    const { data: followCheck } = await supabase
      .from('followers')
      .select('id')
      .eq('follower_id', currentUserId)
      .eq('following_id', profile.id)
      .single()
    
    if (followCheck) isFollowing = true
  }

  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.full_name,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    visitedSpotsCount: uniqueLocations.size, // Total de cidades/locais distintos
    isFollowing
  }
}

// Busca apenas os posts criados por um usuário específico para preencher o feed do perfil
export async function getUserPosts(userId: string): Promise<Post[] | null> {
  const { data, error } = await supabase
    .from('spots')
    .select('*')
    .eq('usuario_id', userId)
    .order('criado_em', { ascending: false })

  if (error) {
    console.error('Error fetching user posts:', error.message)
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

// Action para o botão Seguir / Deixar de Seguir (Toggle)
export async function toggleFollow(targetUserId: string): Promise<{ success: boolean; action: 'followed' | 'unfollowed' } | null> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  if (user.id === targetUserId) {
    console.error('You cannot follow yourself')
    return null
  }

  // Verifica se já segue
  const { data: existingFollow } = await supabase
    .from('followers')
    .select('id')
    .eq('follower_id', user.id)
    .eq('following_id', targetUserId)
    .maybeSingle()

  if (existingFollow) {
    // Se já segue, deleta o registro (Unfollow)
    await supabase.from('followers').delete().eq('id', existingFollow.id)
    return { success: true, action: 'unfollowed' }
  } else {
    // Se não segue, insere o registro (Follow)
    await supabase.from('followers').insert([{ follower_id: user.id, following_id: targetUserId }])
    return { success: true, action: 'followed' }
  }
}