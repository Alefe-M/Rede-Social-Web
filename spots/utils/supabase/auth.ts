import { createClient } from './client';

export interface SignInCredentials {
  email: string;
  password: string;
}

// 1. MUDANÇA: Criamos uma interface nova para o Cadastro, que inclui nome e sobrenome
export interface SignUpCredentials extends SignInCredentials {
  nome?: string;
  sobrenome?: string;
}

export interface SignInResponse {
  success: boolean;
  error?: string;
  user?: any; // Usando any ou o tipo correto do Supabase User no lugar de unknown facilita acessar os metadados depois
  session?: any;
}

/**
 * Realiza login com email e senha no Supabase
 * @param credentials - Email e senha do usuário
 * @returns Resposta com sucesso ou erro
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
 * Cria um novo usuário no Supabase com email, senha, nome e sobrenome
 * @param credentials - Dados de cadastro
 * @returns Resposta com sucesso ou erro
 */
// 2. MUDANÇA: Usamos SignUpCredentials aqui
export async function signup(credentials: SignUpCredentials): Promise<SignInResponse> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      // 3. MUDANÇA: Salvando nome e sobrenome nos metadados do Supabase!
      options: {
        data: {
          name: credentials.nome, 
          sobrenome: credentials.sobrenome,
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
 * @returns Resposta com sucesso ou erro
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
 * @returns Dados da sessão ou nulo
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
 * @returns Dados do usuário ou nulo
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