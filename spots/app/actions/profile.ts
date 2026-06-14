'use server'

import { Post } from './spots'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server' // CORREÇÃO: Mudado para o arquivo do server

export interface UserProfile {
  id: string;
  username: string;
  fullName?: string;     
  avatarUrl?: string;    
  bio?: string;
  followersCount: number;
  followingCount: number;
  visitedSpotsCount: number;
  isFollowing: boolean;   
}

// Busca os dados completos do perfil público de um usuário pelo 'username'
export async function getProfileByUsername(username: string): Promise<UserProfile | null> {
  const cookieStore = await cookies()
  const supabase = await createClient()

  const { data: currentAuth } = await supabase.auth.getUser()
  const currentUserId = currentAuth?.user?.id

  // 1. CORREÇÃO: Alterado de 'perfis' para 'Perfis'
  const { data: profile, error } = await supabase
    .from('Perfis')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !profile) {
    console.error('Profile not found:', error?.message)
    return null
  }

  // 2. CORREÇÃO: Ajustado para usar as tabelas reais do banco ('Seguidores' / 'Posts')
  const { count: followersCount } = await supabase.from('Seguidores').select('*', { count: 'exact', head: true }).eq('seguindo_id', profile.id)
  const { count: followingCount } = await supabase.from('Seguidores').select('*', { count: 'exact', head: true }).eq('seguidor_id', profile.id)

  const { data: spots } = await supabase.from('Posts').select('cidade_estado').eq('usuario_id', profile.id)
  const uniqueLocations = new Set(spots?.map(s => s.cidade_estado) || [])

  let isFollowing = false
  if (currentUserId) {
    const { data: followCheck } = await supabase
      .from('Seguidores')
      .select('id')
      .eq('seguidor_id', currentUserId)
      .eq('seguindo_id', profile.id)
      .maybeSingle()
    
    if (followCheck) isFollowing = true
  }

  return {
    id: profile.id,
    username: profile.username,
    fullName: profile.nome + " " + profile.sobrenome,
    avatarUrl: profile.avatar_url,
    bio: profile.bio,
    followersCount: followersCount || 0,
    followingCount: followingCount || 0,
    visitedSpotsCount: uniqueLocations.size,
    isFollowing
  }
}

// Busca apenas os posts criados por um usuário específico para o feed
export async function getUserPosts(userId: string): Promise<Post[] | null> {
  const cookieStore = await cookies()
  const supabase = await createClient()

  // CORREÇÃO: Alterado de 'spots' para 'Posts'
  const { data, error } = await supabase
    .from('Posts')
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