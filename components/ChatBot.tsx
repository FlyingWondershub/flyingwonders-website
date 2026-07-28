'use client'

import React, { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface ChatBotProps {
  hideChatbot?: boolean
}

export default function ChatBot({ hideChatbot = false }: ChatBotProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hi! 👋 I am FlyBot, your Flying Wonders AI assistant. Ask me anything about Singapore attractions, hotels, or custom packages!'
    }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  if (hideChatbot) return null

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input
    if (!query.trim() || loading) return

    const userMessage: Message = { role: 'user', content: query.trim() }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    if (!textToSend) setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages })
      })
      const data = await res.json()
      const botMessage: Message = {
        role: 'assistant',
        content: data.reply || 'I am having trouble answering right now. Please try again!'
      }
      setMessages([...updatedMessages, botMessage])
    } catch (err) {
      console.error(err)
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Oops, I encountered a network connection error. Please try again or reach out to us via WhatsApp!'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  const suggestionChips = [
    'Suggest 4D3N Itinerary 🗓️',
    'Universal Studios Tickets 🎟️',
    'Best Singapore Hotels 🏨'
  ]

  return (
    <>
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open AI Travel Assistant"
          style={{
            position: 'fixed',
            bottom: '160px',
            right: '24px',
            zIndex: 9999,
            background: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '50px',
            padding: '12px 20px',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.9rem',
            fontWeight: 700,
            transition: 'transform 0.2s ease, boxShadow 0.2s ease'
          }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        >
          <span style={{ fontSize: '1.2rem' }}>🤖</span>
          <span>Ask FlyBot AI</span>
          <span
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#34D399',
              boxShadow: '0 0 8px #34D399'
            }}
          />
        </button>
      )}

      {/* Floating Chat Drawer Container */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            zIndex: 9999,
            width: 'calc(100vw - 32px)',
            maxWidth: '380px',
            height: '520px',
            maxHeight: 'calc(100vh - 48px)',
            background: '#0F172A',
            color: '#F8FAFC',
            borderRadius: '20px',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
            border: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            fontFamily: 'system-ui, -apple-system, sans-serif'
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)',
              padding: '1rem 1.25rem',
              borderBottom: '1px solid #334155',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '1.1rem',
                  boxShadow: '0 2px 10px rgba(16, 185, 129, 0.3)'
                }}
              >
                🤖
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#F8FAFC' }}>
                  FlyBot Assistant
                </h4>
                <span style={{ fontSize: '0.7rem', color: '#10B981', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#10B981' }} />
                  Online • Flying Wonders AI
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close Chat"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94A3B8',
                fontSize: '1.25rem',
                cursor: 'pointer',
                padding: '4px 8px',
                borderRadius: '6px'
              }}
            >
              ✕
            </button>
          </div>

          {/* Quick Suggestion Chips */}
          <div
            style={{
              padding: '0.65rem 0.85rem',
              background: '#1E293B',
              borderBottom: '1px solid #334155',
              display: 'flex',
              gap: '0.4rem',
              overflowX: 'auto',
              whiteSpace: 'nowrap'
            }}
          >
            {suggestionChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                style={{
                  background: '#0F172A',
                  color: '#34D399',
                  border: '1px solid #059669',
                  borderRadius: '12px',
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.7rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Messages Stream */}
          <div
            style={{
              flex: 1,
              padding: '1rem',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: '#0F172A'
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  background: m.role === 'user' ? '#10B981' : '#1E293B',
                  color: m.role === 'user' ? '#FFFFFF' : '#E2E8F0',
                  padding: '0.65rem 0.9rem',
                  borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '0.82rem',
                  lineHeight: '1.45',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.content}
              </div>
            ))}

            {loading && (
              <div
                style={{
                  alignSelf: 'flex-start',
                  background: '#1E293B',
                  color: '#94A3B8',
                  padding: '0.5rem 0.8rem',
                  borderRadius: '16px 16px 16px 4px',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <span>FlyBot is thinking</span>
                <span className="typing-dot">.</span>
                <span className="typing-dot">.</span>
                <span className="typing-dot">.</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault()
              handleSend()
            }}
            style={{
              padding: '0.75rem',
              background: '#1E293B',
              borderTop: '1px solid #334155',
              display: 'flex',
              gap: '0.5rem'
            }}
          >
            <input
              type="text"
              placeholder="Ask about packages, attractions..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{
                flex: 1,
                background: '#0F172A',
                border: '1px solid #475569',
                borderRadius: '10px',
                padding: '0.5rem 0.75rem',
                color: '#F8FAFC',
                fontSize: '0.82rem',
                outline: 'none'
              }}
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              style={{
                background: input.trim() && !loading ? '#10B981' : '#334155',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '10px',
                padding: '0.5rem 0.9rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: input.trim() && !loading ? 'pointer' : 'default',
                transition: 'background 0.2s ease'
              }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  )
}
