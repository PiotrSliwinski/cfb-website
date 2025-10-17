'use client'

import { useState, useEffect, useRef } from 'react'
import { MessageSquare, X, Send, Loader2, Copy, Check, Sparkles, ChevronDown } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface Model {
  id: string
  name: string
  description: string
  available: boolean
}

export function AIChat() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [models, setModels] = useState<Model[]>([
    { id: 'gpt-5-mini', name: 'GPT-5 Mini', description: 'Fast & lightweight', available: true },
    { id: 'gpt-5', name: 'GPT-5', description: 'Balanced performance', available: true },
    { id: 'gpt-5-pro', name: 'GPT-5 Pro', description: 'Advanced reasoning', available: true },
  ])
  const [selectedModel, setSelectedModel] = useState('gpt-5-mini')
  const [isLoadingModels, setIsLoadingModels] = useState(true)
  const [modelMessage, setModelMessage] = useState<string | null>(null)
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null)
  const [position, setPosition] = useState(() => {
    if (typeof window !== 'undefined') {
      return { x: window.innerWidth - 420, y: window.innerHeight - 600 }
    }
    return { x: 0, y: 0 }
  })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatRef = useRef<HTMLDivElement>(null)

  // Fetch available models
  useEffect(() => {
    const fetchModels = async () => {
      setIsLoadingModels(true)
      setModelMessage(null)
      try {
        const response = await fetch('/api/admin/ai/models')
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load models')
        }

        const fetchedModels: Model[] = Array.isArray(payload.models)
          ? payload.models.map((model: Model) => ({
              id: model.id,
              name: model.name ?? model.id,
              description: model.description ?? 'Available',
              available: model.available !== false,
            }))
          : []

        if (fetchedModels.length === 0) {
          throw new Error('No AI models available for this API key')
        }

        setModels(fetchedModels)
        setSelectedModel((current) => {
          if (fetchedModels.some((model) => model.id === current)) {
            return current
          }
          return fetchedModels[0]?.id ?? current
        })
        setModelMessage(payload.warning ?? null)
      } catch (error) {
        console.error('Failed to fetch models:', error)
        setModelMessage(
          error instanceof Error ? error.message : 'Unable to load models'
        )
      } finally {
        setIsLoadingModels(false)
      }
    }

    fetchModels()
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Handle dragging
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('.no-drag')) return
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Create a placeholder message for the assistant's response
    const assistantMessageId = (Date.now() + 1).toString()
    const assistantMessage: Message = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/admin/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
          model: selectedModel,
        }),
      })

      if (!response.ok) {
        let errorMessage = 'Failed to get AI response'
        try {
          const errorBody = await response.json()
          errorMessage =
            errorBody?.details ||
            errorBody?.error ||
            (typeof errorBody === 'string' ? errorBody : errorMessage)
        } catch {
          // Ignore JSON parsing errors and use default message
        }
        throw new Error(errorMessage)
      }

      // Handle streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let accumulatedText = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') {
              break
            }

            try {
              const parsed = JSON.parse(data)

              // Check for error in response
              if (parsed.error) {
                throw new Error(parsed.error)
              }

              if (parsed.text) {
                accumulatedText = parsed.text
                // Update the message content in real-time
                setMessages((prev) =>
                  prev.map((msg) =>
                    msg.id === assistantMessageId
                      ? { ...msg, content: accumulatedText }
                      : msg
                  )
                )
              }
            } catch (e) {
              if (e instanceof Error && e.message !== 'Unexpected end of JSON input') {
                throw e
              }
              // Ignore JSON parse errors for incomplete chunks
            }
          }
        }
      }

      if (!accumulatedText) {
        throw new Error('No response received from AI')
      }
    } catch (error) {
      console.error('Chat error:', error)
      const errorContent =
        error instanceof Error
          ? `Sorry, I encountered an error: ${error.message}`
          : 'Sorry, I encountered an error. Please try again.'

      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === assistantMessageId
            ? { ...msg, content: errorContent }
            : msg
        )
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content)
    setCopiedMessageId(messageId)
    setTimeout(() => setCopiedMessageId(null), 2000)
  }

  const clearChat = () => {
    if (confirm('Clear all messages?')) {
      setMessages([])
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group z-50"
        title="AI Assistant"
      >
        <Sparkles className="h-6 w-6 group-hover:scale-110 transition-transform" />
      </button>
    )
  }

  return (
    <div
      ref={chatRef}
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-50 flex flex-col"
      style={{
        left: position.x,
        top: position.y,
        width: isMinimized ? '320px' : '400px',
        height: isMinimized ? 'auto' : '600px',
        cursor: isDragging ? 'grabbing' : 'auto',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          <h3 className="font-semibold">AI Assistant</h3>
        </div>
        <div className="flex items-center gap-2 no-drag">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title={isMinimized ? 'Maximize' : 'Minimize'}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/20 rounded transition-colors"
            title="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Model Selector */}
          <div className="p-3 border-b border-gray-200 bg-gray-50 no-drag">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <label className="text-xs font-medium text-gray-700">Model:</label>
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  disabled={isLoadingModels || models.length === 0}
                  className="flex-1 text-sm px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                >
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                      {model.available === false ? ' (Not listed for this API key)' : ''}
                    </option>
                  ))}
                </select>
              </div>
              {isLoadingModels && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Loading models...
                </div>
              )}
              {modelMessage && !isLoadingModels && (
                <p className="text-xs text-gray-500">{modelMessage}</p>
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 no-drag">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm mt-8">
                <Sparkles className="h-12 w-12 mx-auto mb-3 text-purple-300" />
                <p className="font-medium">How can I help you today?</p>
                <p className="text-xs mt-2">Ask me anything about your content!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    {message.role === 'assistant' && (
                      <button
                        onClick={() => copyToClipboard(message.content, message.id)}
                        className="mt-2 text-xs flex items-center gap-1 text-gray-500 hover:text-gray-700"
                      >
                        {copiedMessageId === message.id ? (
                          <>
                            <Check className="h-3 w-3" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3" />
                            Copy
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3">
                  <Loader2 className="h-5 w-5 animate-spin text-purple-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 no-drag">
            {messages.length > 0 && (
              <button
                onClick={clearChat}
                className="text-xs text-gray-500 hover:text-gray-700 mb-2"
              >
                Clear chat
              </button>
            )}
            <div className="flex gap-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                rows={2}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
