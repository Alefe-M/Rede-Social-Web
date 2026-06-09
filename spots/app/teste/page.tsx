'use client'

import { useState } from 'react'
import { createPost, deletePost, getPosts, updatePost, Post } from '@/app/actions/spots'

export default function TesteFormularioPost() {
  const [place, setPlace] = useState('')
  const [category, setCategory] = useState('Restaurante')
  const [location, setLocation] = useState('Goiânia, GO')
  const [content, setContent] = useState('')
  const [imageUrl, setImageUrl] = useState('https://picsum.photos/400/300')
  const [rating, setRating] = useState<number>(5) // 🌟 Estado da avaliação (Padrão 5 estrelas)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState('')
  const [postsList, setPostsList] = useState<Post[]>([])
  
  const [formStatus, setFormStatus] = useState('')
  const [deleteStatus, setDeleteStatus] = useState('')
  const [listStatus, setListStatus] = useState('')

  const [registeredLocations] = useState<string[]>([
    'Goiânia, GO',
    'Aparecida de Goiânia, GO',
    'Senador Canedo, GO',
    'Brasília, DF',
    'São Paulo, SP',
    'Rio de Janeiro, RJ'
  ])

  const [searchLocation, setSearchLocation] = useState('Goiânia, GO')
  const [showDropdown, setShowDropdown] = useState(false)

  const filteredLocations = registeredLocations.filter(local =>
    local.toLowerCase().includes(searchLocation.toLowerCase())
  )

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

  const handleLoadForEdit = (post: Post) => {
    if (!post.id) return
    
    setEditingId(post.id)
    setPlace(post.place)
    setCategory(post.category)
    setLocation(post.location)
    setContent(post.content)     
    setImageUrl(post.imageUrl)   
    setRating(post.rating)       // Carrega a nota para edição
    setSearchLocation(post.location) 
    
    setFormStatus(`✏️ Editing post ID: ${post.id}`)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleClearForm = () => {
    setEditingId(null)
    setPlace('')
    setCategory('Restaurante')
    setLocation('Goiânia, GO')
    setContent('')
    setImageUrl('https://picsum.photos/400/300')
    setRating(5)
    setSearchLocation('Goiânia, GO')
  }

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault()

    const postData = {
      place,
      category,
      location,
      content,
      imageUrl,
      rating // Incluído no payload de envio
    }

    if (editingId) {
      setFormStatus('Updating data on Supabase...')
      const result = await updatePost(editingId, postData)
      if (result) {
        setFormStatus(`✨ Success! Post ${editingId} updated!`)
        handleClearForm()
        handleList()
      } else {
        setFormStatus('❌ Error updating post.')
      }
    } else {
      setFormStatus('Sending to database...')
      const result = await createPost(postData)
      if (result) {
        setFormStatus(`✅ Created successfully! ID: ${result.id}`)
        handleClearForm()
        handleList()
      } else {
        setFormStatus('❌ Error creating post. Make sure you are logged in.')
      }
    }
  }

  const handleDelete = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!deleteId) {
      setDeleteStatus('⚠️ Type an ID first!')
      return
    }
    setDeleteStatus('Deleting from database...')
    const success = await deletePost(deleteId)
    if (success) {
      setDeleteStatus(`💥 Success! Post ${deleteId} deleted!`)
      if (deleteId === editingId) handleClearForm()
      setDeleteId('')
      handleList()
    } else {
      setDeleteStatus('❌ Error deleting post.')
    }
  }

  const handleList = async () => {
    setListStatus('Fetching data from Supabase...')
    const posts = await getPosts()
    if (posts) {
      setPostsList(posts)
      setListStatus(`✅ Success! Found ${posts.length} posts.`)
    } else {
      setListStatus('❌ Error fetching posts.')
    }
  }

  return (
    <div style={{ maxWidth: '480px', margin: '50px auto', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', gap: '35px', padding: '0 20px' }}>
      
      {/* CARD 1: CREATE / EDIT */}
      <div style={{ ...cardStyle, border: editingId ? '2px solid #f59e0b' : '1px solid #e3e0e0' }}>
        <h2 style={{ margin: '0 0 10px 0', color: editingId ? '#f59e0b' : '#0070f3' }}>
          {editingId ? '✏️ Edit Mode: Change Post' : '➕ Test: Create Post'}
        </h2>
        
        <form onSubmit={handleSubmitForm} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Place Name / Address:</label>
            <input type="text" placeholder="Ex: Central Café - Av. T-10, Setor Bueno" value={place} onChange={(e) => setPlace(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Category:</label>
            <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
              <option value="Restaurante">Restaurante</option>
              <option value="Cafeteria">Cafeteria</option>
              <option value="Parque">Parque</option>
              <option value="Bar">Bar</option>
            </select>
          </div>

          <div style={{ position: 'relative' }}>
            <label style={labelStyle}>City / State:</label>
            <input 
              type="text" 
              placeholder="Type to filter..." 
              value={searchLocation} 
              onChange={(e) => {
                setSearchLocation(e.target.value)
                setLocation(e.target.value)
                setShowDropdown(true)
              }} 
              onFocus={() => setShowDropdown(true)} 
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
              required 
              style={inputStyle} 
            />

            {showDropdown && filteredLocations.length > 0 && (
              <ul style={{
                position: 'absolute', top: '100%', left: 0, right: 0,
                background: 'white', border: '1px solid #cccccc', borderRadius: '6px',
                maxHeight: '150px', overflowY: 'auto', margin: '4px 0 0 0', padding: 0,
                listStyle: 'none', zIndex: 10, boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {filteredLocations.map((item, index) => (
                  <li 
                    key={index}
                    onClick={() => {
                      setSearchLocation(item)
                      setLocation(item)
                      setShowDropdown(false)
                    }}
                    style={{ padding: '10px', borderBottom: '1px solid #f0f0f0', cursor: 'pointer', fontSize: '14px', color: '#444' }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f4f4f5'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                  >
                    {item}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* 🌟 SISTEMA DE RATING (ESTRELAS) */}
          <div>
            <label style={labelStyle}>Your Rating:</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  onClick={() => setRating(star)}
                  style={{
                    fontSize: '28px',
                    cursor: 'pointer',
                    color: star <= rating ? '#f59e0b' : '#d1d5db',
                    transition: 'color 0.1s ease'
                  }}
                >
                  ★
                </span>
              ))}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Content (Caption):</label>
            <input type="text" placeholder="What did you think of the place?" value={content} onChange={(e) => setContent(e.target.value)} required style={inputStyle} />
          </div>

          <div>
            <label style={labelStyle}>Image URL:</label>
            <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} required style={inputStyle} />
          </div>

          <button type="submit" style={buttonStyle(editingId ? '#f59e0b' : '#0070f3')}>
            {editingId ? 'Update on Supabase' : 'Save to Supabase'}
          </button>

          {editingId && (
            <button type="button" onClick={handleClearForm} style={{ ...buttonStyle('#6b7280'), marginTop: '0' }}>
              Cancel Edit
            </button>
          )}
        </form>
        
        {formStatus && (
          <p style={{ background: '#f4f4f5', padding: '12px', fontSize: '13px', borderRadius: '6px', margin: '10px 0 0 0', border: '1px solid #e4e4e7', wordBreak: 'break-word' }}>
            {formStatus}
          </p>
        )}
      </div>

      {/* CARD 2: DELETE */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 10px 0', color: '#e03131' }}>🗑️ Test: Delete Post</h2>
        <form onSubmit={handleDelete} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={labelStyle}>Post ID:</label>
            <input type="text" placeholder="Paste ID here" value={deleteId} onChange={(e) => setDeleteId(e.target.value)} required style={inputStyle} />
          </div>
          <button type="submit" style={buttonStyle('#e03131')}>Delete from Supabase</button>
        </form>
        {deleteStatus && (
          <p style={{ background: '#f4f4f5', padding: '12px', fontSize: '13px', borderRadius: '6px', margin: '10px 0 0 0', border: '1px solid #e4e4e7', wordBreak: 'break-word' }}>
            {deleteStatus}
          </p>
        )}
      </div>

      {/* CARD 3: LIST */}
      <div style={cardStyle}>
        <h2 style={{ margin: '0 0 10px 0', color: '#10b981' }}>🔍 Test: List Posts</h2>
        <button type="button" onClick={handleList} style={buttonStyle('#10b981')}>
          Fetch Database Records
        </button>
        {listStatus && (
          <p style={{ background: '#f4f4f5', padding: '12px', fontSize: '13px', borderRadius: '6px', margin: '10px 0 0 0', border: '1px solid #e4e4e7', wordBreak: 'break-word' }}>
            {listStatus}
          </p>
        )}
        {postsList.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '350px', overflowY: 'auto', paddingRight: '5px' }}>
            {postsList.map((post) => (
              <div key={post.id} style={{ padding: '12px', border: '1px solid #e4e4e7', borderRadius: '6px', fontSize: '13px', background: '#fafafa', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <div>
                  <span style={{ color: '#0070f3', fontWeight: 'bold' }}>ID:</span> {post.id} <br />
                  <span style={{ fontWeight: 'bold' }}>Place:</span> {post.place} ({post.category}) <br />
                  {/* 🌟 Renderizando as estrelas salvas do banco de dados */}
                  <span style={{ fontWeight: 'bold' }}>Rating:</span> <span style={{ color: '#f59e0b', fontSize: '14px' }}>{'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}</span> ({post.rating}/5) <br />
                  <span style={{ fontWeight: 'bold' }}>Content:</span> {post.content}
                </div>
                <button
                  type="button"
                  onClick={() => handleLoadForEdit(post)}
                  style={{ background: '#f59e0b', color: 'white', border: 'none', borderRadius: '4px', padding: '6px 12px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', width: 'fit-content' }}
                >
                  ✏️ Edit Post
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}