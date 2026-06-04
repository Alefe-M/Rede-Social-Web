'use client'

import { useState } from 'react'
import { createPost, deletePost, getPosts, updatePost, Post } from '@/app/actions/spots'

export default function TesteFormularioPost() {
  // 1. Estados para os campos do Formulário Híbrido (Criar / Editar)
  const [place, setPlace] = useState('')
  const [category, setCategory] = useState('Restaurante')
  const [location, setLocation] = useState('Goiânia, GO')
  const [caption, setCaption] = useState('')
  const [image, setImage] = useState('https://picsum.photos/400/300')

  // 🌟 O ESTADO CHAVE: Se tiver um ID aqui, o formulário vira "Modo Edição". Se for null, "Modo Criação".
  const [idSendoEditado, setIdSendoEditado] = useState<string | null>(null)

  // 2. Estado para DELETAR o Post
  const [idParaDeletar, setIdParaDeletar] = useState('')

  // 3. Estado para LISTAR os Posts
  const [listaDePosts, setListaDePosts] = useState<Post[]>([])

  // 4. Estados de aviso/status
  const [statusFormulario, setStatusFormulario] = useState('') // Status do formulário principal
  const [statusDeletar, setStatusDeletar] = useState('')
  const [statusListar, setStatusListar] = useState('')

  // --- ESTILOS COMPARTILHADOS ---
  const cardStyle: React.CSSProperties = {
    color: '#222222',
    background: '#ffffff',
    padding: '25px',
    border: '1px solid #e3e0e0',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px',
    border: '1px solid #cccccc',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box'
  }

  const labelStyle: React.CSSProperties = {
    fontWeight: 'bold',
    fontSize: '14px',
    color: '#444444',
    marginBottom: '2px',
    display: 'block'
  }

  const buttonStyle = (bgColor: string): React.CSSProperties => ({
    width: '100%',
    padding: '12px',
    background: bgColor,
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '15px',
    marginTop: '10px'
  })

  // --- FUNÇÃO PARA PEGAR OS DADOS DA LISTA E JOGAR NO FORMULÁRIO ---
  const handleCarregarParaEdicao = (post: Post) => {
    if (!post.id) return
    
    setIdSendoEditado(post.id) // Banco agora sabe quem estamos editando
    setPlace(post.place)
    setCategory(post.category)
    setLocation(post.location)
    setCaption(post.caption)
    setImage(post.image)
    setStatusFormulario(`✏️ Editando o post ID: ${post.id}`)

    // Faz a tela rolar suavemente de volta para o topo (onde está o formulário)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // --- FUNÇÃO PARA LIMPAR O FORMULÁRIO ---
  const limparFormulario = () => {
    setIdSendoEditado(null)
    setPlace('')
    setCategory('Restaurante')
    setLocation('Goiânia, GO')
    setCaption('')
    setImage('https://picsum.photos/400/300')
  }

  // --- FUNÇÃO DO SUBMIT (CRIA OU EDITA) ---
  const handleSubmeterFormulario = async (e: React.FormEvent) => {
    e.preventDefault()

    if (idSendoEditado) {
      // 📝 MODO EDIÇÃO (UPDATE)
      setStatusFormulario('Atualizando dados no Supabase...')
      
      const camposAlterados: Partial<Post> = {
        place,
        category,
        location,
        caption,
        image
      }

      const resultado = await updatePost(idSendoEditado, camposAlterados)
      if (resultado) {
        setStatusFormulario(`✨ Sucesso! O post ${idSendoEditado} foi atualizado!`)
        limparFormulario()
        handleListar() // Recarrega a lista lá embaixo automaticamente com os dados novos!
      } else {
        setStatusFormulario('❌ Erro ao atualizar o post.')
      }

    } else {
      // ➕ MODO CRIAÇÃO (INSERT)
      setStatusFormulario('Enviando para o banco...')

      const dadosDoPost: Post = {
        id: Math.floor(Math.random() * 1000000).toString(),
        userId: "1",
        user: "Testador CodeWave",
        username: "testador_codewave",
        profileUrl: "https://avatar.iran.liara.run/public/30",
        place: place,
        placeUrl: "https://maps.google.com",
        category: category,
        location: location,
        image: image,
        caption: caption,
        likes: 0,
        comments: 0
      }

      const resultado = await createPost(dadosDoPost)
      if (resultado) {
        setStatusFormulario(`✅ Criado com sucesso! ID: ${resultado.id}`)
        limparFormulario()
        handleListar() // Atualiza a lista na hora
      } else {
        setStatusFormulario('❌ Erro ao criar post no Supabase.')
      }
    }
  }

  // --- FUNÇÃO DE DELETAR ---
  const handleDeletar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!idParaDeletar) {
      setStatusDeletar('⚠️ Digite um ID primeiro!')
      return
    }

    setStatusDeletar('Apagando do banco...')
    const deuCerto = await deletePost(idParaDeletar)

    if (deuCerto) {
      setStatusDeletar(`💥 Sucesso! O post ${idParaDeletar} foi apagado!`)
      setIdParaDeletar('')
      handleListar() // Atualiza a lista tirando o post deletado
    } else {
      setStatusDeletar('❌ Erro ao deletar. Verifique se o ID existe.')
    }
  }

  // --- FUNÇÃO DE LISTAR ---
  const handleListar = async () => {
    setStatusListar('Buscando dados no Supabase...')
    const posts = await getPosts()

    if (posts) {
      setListaDePosts(posts)
      setStatusListar(`✅ Sucesso! Encontrados ${posts.length} posts no banco.`)
    } else {
      setStatusListar('❌ Erro ao buscar os posts do banco.')
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '50px auto', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '35px', padding: '0 20px' }}>
      
      {/* CARD 1: FORMULÁRIO DINÂMICO (CRIAR OU EDITAR) */}
      <div style={{ ...cardStyle, border: idSendoEditado ? '2px solid #f59e0b' : '1px solid #e3e0e0' }}>
        
        {/* O título muda dinamicamente baseando-se no modo atual */}
        <h2 style={{ margin: '0 0 10px 0', color: idSendoEditado ? '#f59e0b' : '#0070f3' }}>
          {idSendoEditado ? '✏️ Modo Edição: Alterar Post' : '➕ Testar: Criar Post'}
        </h2>
        
        <form onSubmit={handleSubmeterFormulario} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Nome do Lugar:</label>
            <input type="text" placeholder="Ex: Café Central" value={place} onChange={(e) => setPlace(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Categoria:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              <option value="Restaurante">Restaurante</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Parque">Parque</option>
              <option value="Bar">Bar</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Localização (Cidade/Estado):</label>
            <input type="text" placeholder="Ex: Goiânia, GO" value={location} onChange={(e) => setLocation(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Legenda / Comentário:</label>
            <input type="text" placeholder="O que você achou do espaço?" value={caption} onChange={(e) => setCaption(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>URL da Imagem:</label>
            <input type="text" value={image} onChange={(e) => setImage(e.target.value)} required style={inputStyle} />
          </div>

          {/* O botão também muda de cor e texto dependendo do que estamos fazendo */}
          <button type="submit" style={buttonStyle(idSendoEditado ? '#f59e0b' : '#0070f3')}>
            {idSendoEditado ? 'Atualizar no Supabase' : 'Salvar no Supabase'}
          </button>

          {/* Se estiver editando, mostra um botão extra para desistir e voltar ao modo de criar */}
          {idSendoEditado && (
            <button type="button" onClick={limparFormulario} style={{ ...buttonStyle('#6b7280'), marginTop: '0' }}>
              Cancelar Edição
            </button>
          )}
        </form>
        
        {statusFormulario && (
          <p style={{ background: '#f4f4f5', padding: '12px', fontSize: '13px', borderRadius: '6px', margin: '10px 0 0 0', border: '1px solid #e4e4e7', wordBreak: 'break-word' }}>
            {statusFormulario}
          </p>
        )}
      </div>

      {/* CARD 2: DELETAR POST */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 10px 0', color: '#e03131' }}>🗑️ Testar: Deletar Post</h2>
        
        <form onSubmit={handleDeletar} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>ID do Post no Banco:</label>
            <input type="text" placeholder="Cole aqui o ID" value={idParaDeletar} onChange={(e) => setIdParaDeletar(e.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" style={buttonStyle('#e03131')}>Deletar do Supabase</button>
        </form>
        
        {statusDeletar && (
          <p style={{ background: '#f4f4f5', padding: '12px', fontSize: '13px', borderRadius: '6px', margin: '10px 0 0 0', border: '1px solid #e4e4e7', wordBreak: 'break-word' }}>
            {statusDeletar}
          </p>
        )}
      </div>

      {/* CARD 3: LISTAR POSTS + BOTÃO EDITAR INTEGRADO */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 10px 0', color: '#10b981' }}>🔍 Testar: Listar Posts</h2>
        
        <p style={{ margin: 0, fontSize: '14px', color: '#666666' }}>
          Clique no botão abaixo para rodar sua função <strong>getPosts()</strong>.
        </p>

        <button type="button" onClick={handleListar} style={buttonStyle('#10b981')}>
          Buscar Dados do Banco
        </button>
        
        {statusListar && (
          <p style={{ background: '#f4f4f5', padding: '12px', fontSize: '13px', borderRadius: '6px', margin: '10px 0 0 0', border: '1px solid #e4e4e7', wordBreak: 'break-word' }}>
            {statusListar}
          </p>
        )}

        {listaDePosts.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
            <label style={labelStyle}>Resultados da Tabela ({listaDePosts.length}):</label>
            {listaDePosts.map((post) => (
              <div 
                key={post.id} 
                style={{ 
                  padding: '12px', 
                  border: '1px solid #e4e4e7', 
                  borderRadius: '6px', 
                  fontSize: '13px', 
                  background: '#fafafa',
                  lineHeight: '1.4',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '5px'
                }}
              >
                <div>
                  <span style={{ color: '#0070f3', fontWeight: 'bold' }}>ID:</span> {post.id} <br />
                  <span style={{ fontWeight: 'bold' }}>Lugar:</span> {post.place} ({post.category}) <br />
                  <span style={{ fontWeight: 'bold' }}>Legenda:</span> {post.caption}
                </div>

                {/* ✨ O BOTÃO DE EDITAR QUE VOCÊ QUERIA AQUI NO MAP ✨ */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleCarregarParaEdicao(post)}
                    style={{
                      background: '#f59e0b',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      marginTop: '5px'
                    }}
                  >
                    ✏️ Editar este Post
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}