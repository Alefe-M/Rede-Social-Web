import { createClient } from './client'; // 1. CORREÇÃO: Importa o createClient do seu arquivo client.ts

// 2. CORREÇÃO: Garante que a interface de Login existe no arquivo
export interface SignInCredentials {
  email: string;
  password: string;
}

// Interface de Cadastro estendendo a de Login + os campos do plano do Spots
export interface SignUpCredentials extends SignInCredentials {
  nome: string;
  sobrenome: string;
  username: string; // Essencial para as rotas dinâmicas do perfil
}

export interface SignInResponse {
  success: boolean;
  error?: string;
  user?: any; 
  session?: any;
}

/**
 * Realiza login com email e senha no Supabase
 */
export async function signin(credentials: SignInCredentials): Promise<SignInResponse> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: errorMessage };
  }
}

/**
 * Cria um novo usuário no Supabase com email, senha, nome, sobrenome e username
 */
export async function signup(credentials: SignUpCredentials): Promise<SignInResponse> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          name: credentials.nome, 
          sobrenome: credentials.sobrenome,
          username: credentials.username.toLowerCase().trim(), // Limpa espaços e joga pra minúsculo
        }
      }
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: data.user, session: data.session };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: errorMessage };
  }
}

/**
 * Realiza logout do usuário
 */
export async function signout(): Promise<SignInResponse> {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
    return { success: false, error: errorMessage };
  }
}

/**
 * Obtém a sessão atual do usuário
 */
export async function getSession() {
  try {
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return null;
  }
}

/**
 * Obtém o usuário autenticado atual
 */
export async function getCurrentUser() {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    return null;
  }
}