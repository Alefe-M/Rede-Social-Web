'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signin, signup } from '@/utils/supabase/auth';
import toast from 'react-hot-toast'; // <-- AQUI ESTÁ A CORREÇÃO! A importação que faltava.

export default function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nome, setNome] = useState('');
  const [sobrenome, setSobrenome] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let result;

    if (isLogin) {
      result = await signin({ email, password });
    } else {
      result = await signup({ email, password, nome, sobrenome });
    }

    if (result.success) {
      // Tenta pegar o nome do metadado do usuário. Se não achar, usa o estado local 'nome'. 
      // Se estiver vazio (ex: login direto), corta o e-mail antes do '@'.
      const nomeUsuario = result.user?.user_metadata?.name || nome || result.user?.email?.split('@')[0] || 'visitante';
      
      // As mensagens bonitinhas flutuantes usando o Toast
      if (isLogin) {
        toast.success(`Você entrou na sua conta, ${nomeUsuario}!`);
      } else {
        toast.success(`Conta criada com sucesso, ${nomeUsuario}!`);
      }

      // Limpa os campos após sucesso
      setEmail('');
      setPassword('');
      setNome('');
      setSobrenome('');
      
      // Direciona para a página principal (raiz)
      router.push('/'); 
      
    } else {
      setError(result.error || (isLogin ? 'Erro ao fazer login' : 'Erro ao criar conta'));
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
        
        {/* NOVOS CAMPOS: Só aparecem se NÃO for tela de login (!isLogin) */}
        {!isLogin && (
          <div style={{ display: 'flex', gap: '10px', marginBottom: '15px' }}>
            <div style={{ flex: 1 }}>
              <label htmlFor="nome" style={{ display: 'block', marginBottom: '5px' }}>
                Nome:
              </label>
              <input
                id="nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required={!isLogin} // Só exige se for criar conta
                placeholder="Seu nome"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ flex: 1 }}>
              <label htmlFor="sobrenome" style={{ display: 'block', marginBottom: '5px' }}>
                Sobrenome:
              </label>
              <input
                id="sobrenome"
                type="text"
                value={sobrenome}
                onChange={(e) => setSobrenome(e.target.value)}
                required={!isLogin} // Só exige se for criar conta
                placeholder="Seu sobrenome"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '4px',
                  border: '1px solid #ccc',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          </div>
        )}

        <div style={{ marginBottom: '15px' }}>
          <label htmlFor="email" style={{ display: 'block', marginBottom: '5px' }}>
            Email:
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="seu-email@exemplo.com"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label htmlFor="password" style={{ display: 'block', marginBottom: '5px' }}>
            Senha:
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="sua-senha"
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>

        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffe0e0', borderRadius: '4px' }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '10px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
        </button>
      </form>

      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>
          {isLogin ? 'Ainda não tem uma conta? ' : 'Já tem uma conta? '}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin);
            setError(null);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: '#007bff',
            cursor: 'pointer',
            fontWeight: 'bold',
            padding: 0,
            fontSize: '14px'
          }}
        >
          {isLogin ? 'Crie uma agora' : 'Faça login'}
        </button>
      </div>
    </div>
  );
}