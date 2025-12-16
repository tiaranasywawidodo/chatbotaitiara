'use client';

import { useState, useRef, useEffect } from 'react';
import './globals.css';

// Komponen Utama Halaman
export default function Home() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const [sakuraStyles, setSakuraStyles] = useState([]);
  const messagesEndRef = useRef(null);

  // Fungsi untuk scroll ke bawah
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Generate blue sakura styles on client side only
  useEffect(() => {
    // Generate 15 kelopak bunga
    const styles = [...Array(15)].map(() => ({
      left: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 10}s`,
      animationDuration: `${10 + Math.random() * 10}s`
    }));
    setSakuraStyles(styles);
  }, []);

  // Handler Submit Pesan
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Panggil API untuk mendapatkan balasan AI
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })) })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const assistantMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // Handler CRUD Pesan
  const handleDelete = (id) => setMessages(prev => prev.filter(msg => msg.id !== id));
  const handleEdit = (id, content) => { setEditingId(id); setEditText(content); };
  const handleCancelEdit = () => { setEditingId(null); setEditText(''); };

  const handleSaveEdit = async (id) => {
    if (!editText.trim()) return;

    const messageIndex = messages.findIndex(msg => msg.id === id);
    if (messageIndex === -1) return;

    const messagesBeforeEdit = messages.slice(0, messageIndex);
    const editedMessage = { ...messages[messageIndex], content: editText.trim() };
    
    // Perbarui state lokal dan panggil API lagi
    setMessages([...messagesBeforeEdit, editedMessage]);
    setEditingId(null);
    setEditText('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messagesBeforeEdit, editedMessage].map(m => ({ role: m.role, content: m.content })) })
      });

      const data = await response.json();

      if (data.error) throw new Error(data.error);

      const assistantMessage = {
        id: Date.now(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = {
        id: Date.now(),
        role: 'assistant',
        content: 'Maaf, terjadi kesalahan. Silakan coba lagi.',
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  // ====================================
  // RENDER JSX
  // ====================================
  return (
    <div className="container">
      <div className="chat-wrapper">
        
        {/* HEADER */}
        <div className="chat-header">
          <div className="header-content">
            <div className="avatar-wrapper">
              <div className="avatar">💠</div>
              <div className="status-dot"></div>
            </div>
            <div className="header-text">
              {/* Di screenshot tertulis Aitiara, saya gunakan Angelina Salim sesuai kode */}
              <h1>Aitiara</h1>
              <p className="status-text">Online • Ready to Help (❄️´◡`❄️)</p>
            </div>
          </div>
          <div className="decorative-stars">
            <span className="star">💠</span>
            <span className="star">⚡</span>
            <span className="star">✨</span>
          </div>
        </div>

        {/* AREA PESAN */}
        <div className="chat-messages">
          {messages.length === 0 && (
            <div className="welcome-message">
              <div className="welcome-icon">💠</div>
              <h2>Welcome !</h2>
              <p>Kirim pesan untuk memulai percakapan ✨</p>
            </div>
          )}
          
          {messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-avatar">
                {message.role === 'user' ? '👤' : '⚡'}
              </div>
              <div className="message-content">
                {editingId === message.id ? (
                  /* EDIT MODE */
                  <div className="edit-container">
                    <textarea
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-textarea"
                      autoFocus
                    />
                    <div className="edit-buttons">
                      <button onClick={() => handleSaveEdit(message.id)} className="btn-save">💾 Simpan</button>
                      <button onClick={handleCancelEdit} className="btn-cancel">✖ Batal</button>
                    </div>
                  </div>
                ) : (
                  /* DISPLAY MODE */
                  <>
                    <div className="message-bubble"><p>{message.content}</p></div>
                    <div className="message-footer">
                      <span className="timestamp">{message.timestamp}</span>
                      <div className="message-actions">
                        {message.role === 'user' && (
                          <button onClick={() => handleEdit(message.id, message.content)} className="btn-action" title="Edit pesan">✏️</button>
                        )}
                        <button onClick={() => handleDelete(message.id)} className="btn-action" title="Hapus pesan">🗑️</button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}

          {/* LOADING INDICATOR */}
          {loading && (
            <div className="message assistant">
              <div className="message-avatar">⚡</div>
              <div className="message-content">
                <div className="message-bubble loading">
                  <div className="typing-indicator">
                    <span style={{backgroundColor:'#60a5fa'}}></span>
                    <span style={{backgroundColor:'#3b82f6'}}></span>
                    <span style={{backgroundColor:'#1e40af'}}></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* INPUT FORM */}
        <form onSubmit={handleSubmit} className="chat-input-form">
          <div className="input-wrapper">
            <input 
              type="text" 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ketik pesan... 💬" 
              className="chat-input" 
              disabled={loading} 
            />
            <button type="submit" className="send-button" disabled={loading || !input.trim()}>
              {loading ? '⏳' : '🚀'}
            </button>
          </div>
        </form>
      </div>

      {/* SAKURA EFFECT */}
      {sakuraStyles.length > 0 && (
        <div className="sakura-container">
          {sakuraStyles.map((style, i) => (
            <div key={i} className="sakura" style={style}>💠</div>
          ))}
        </div>
      )}
    </div>
  );
}