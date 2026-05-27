'use client';

import { useState } from 'react';
import { signin, signup } from '@/utils/supabase/auth';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // ESTADO NOVO: Controla se a tela é de Login (true) ou Cadastro (false)
  const [isLogin, setIsLogin] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    let result;

    // LÓGICA NOVA: Decide qual função chamar baseado na tela atual
    if (isLogin) {
      result = await signin({ email, password });
    } else {
      result = await signup({ email, password });
    }

    if (result.success) {
      setSuccess(true);
      setEmail('');
      setPassword('');
      console.log(isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!', result.user);
    } else {
      setError(result.error || (isLogin ? 'Erro ao fazer login' : 'Erro ao criar conta'));
    }

    setLoading(false);
  }

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', padding: '20px' }}>
      <form onSubmit={handleSubmit}>
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

        {success && (
          <div style={{ color: 'green', marginBottom: '15px', padding: '10px', backgroundColor: '#e0ffe0', borderRadius: '4px' }}>
            {isLogin ? 'Login realizado com sucesso!' : 'Conta criada com sucesso!'}
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

      {/* BOTÃO NOVO: Fica abaixo do formulário e alterna a tela */}
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <span style={{ fontSize: '14px', color: '#666' }}>
          {isLogin ? 'Ainda não tem uma conta? ' : 'Já tem uma conta? '}
        </span>
        <button
          type="button"
          onClick={() => {
            setIsLogin(!isLogin); // Inverte o valor de isLogin
            setError(null);       // Limpa erros ao trocar de tela
            setSuccess(false);    // Limpa mensagens de sucesso
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