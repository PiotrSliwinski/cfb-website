'use client'

import { useEffect, useState } from 'react'
import { Wand2, Image as ImageIcon, Loader2, Copy, Download, Trash2 } from 'lucide-react'

interface GeneratedItem {
  id: string
  type: 'text' | 'image'
  content: string
  prompt: string
  timestamp: Date
  model: string
  parameters?: Record<string, any>
}

interface TextModelOption {
  id: string
  name: string
  description: string
  available: boolean
}

export default function AIPlayground() {
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text')
  const [history, setHistory] = useState<GeneratedItem[]>([])

  // Text generation state
  const [textPrompt, setTextPrompt] = useState('')
  const [textModel, setTextModel] = useState('gpt-5-mini')
  const [textModels, setTextModels] = useState<TextModelOption[]>([
    {
      id: 'gpt-5-mini',
      name: 'GPT-5 Mini',
      description: 'Fast & lightweight',
      available: true,
    },
    {
      id: 'gpt-5',
      name: 'GPT-5',
      description: 'Balanced performance',
      available: true,
    },
    {
      id: 'gpt-5-pro',
      name: 'GPT-5 Pro',
      description: 'Advanced reasoning',
      available: true,
    },
  ])
  const [isLoadingTextModels, setIsLoadingTextModels] = useState(true)
  const [textModelMessage, setTextModelMessage] = useState<string | null>(null)
  const [textContext, setTextContext] = useState('general')
  const [maxTokens, setMaxTokens] = useState(500)
  const [temperature, setTemperature] = useState(0.7)
  const [isGeneratingText, setIsGeneratingText] = useState(false)
  const [generatedText, setGeneratedText] = useState('')

  // Image generation state
  const [imagePrompt, setImagePrompt] = useState('')
  const [imageModel, setImageModel] = useState<'dall-e-3' | 'dall-e-2'>('dall-e-3')
  const [imageSize, setImageSize] = useState<'1024x1024' | '1792x1024' | '1024x1792'>('1024x1024')
  const [imageQuality, setImageQuality] = useState<'standard' | 'hd'>('standard')
  const [imageStyle, setImageStyle] = useState<'natural' | 'vivid'>('natural')
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [generatedImage, setGeneratedImage] = useState('')
  const [revisedPrompt, setRevisedPrompt] = useState('')

  useEffect(() => {
    let isMounted = true

    const fetchModels = async () => {
      try {
        const response = await fetch('/api/admin/ai/models')
        const payload = await response.json()

        if (!response.ok) {
          throw new Error(payload.error || 'Failed to load models')
        }

        if (!Array.isArray(payload.models) || payload.models.length === 0) {
          throw new Error('No GPT-5 models returned for this API key')
        }

        const modelsFromApi: TextModelOption[] = payload.models.map((model: any) => ({
          id: model.id,
          name: typeof model.name === 'string' ? model.name : model.id,
          description:
            typeof model.description === 'string' ? model.description : 'Available',
          available: model.available !== false,
        }))

        if (isMounted) {
          setTextModels(modelsFromApi)

          setTextModel((current) => {
            if (modelsFromApi.some((model) => model.id === current)) {
              return current
            }
            return modelsFromApi[0]?.id ?? current
          })

          setTextModelMessage(payload.warning ?? null)
        }
      } catch (error) {
        if (isMounted) {
          const message =
            error instanceof Error ? error.message : 'Unable to load GPT-5 models'
          setTextModelMessage(message)
        }
      } finally {
        if (isMounted) {
          setIsLoadingTextModels(false)
        }
      }
    }

    fetchModels()

    return () => {
      isMounted = false
    }
  }, [])

  const handleGenerateText = async () => {
    if (!textPrompt.trim()) return
    setIsGeneratingText(true)
    setGeneratedText('')

    try {
      const response = await fetch('/api/admin/ai/generate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textPrompt,
          context: { type: textContext },
          maxTokens,
          temperature,
          model: textModel,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate text')
      }

      const data = await response.json()
      setGeneratedText(data.text)

      // Add to history
      const newItem: GeneratedItem = {
        id: Date.now().toString(),
        type: 'text',
        content: data.text,
        prompt: textPrompt,
        timestamp: new Date(),
        model: textModel,
        parameters: { maxTokens, temperature, context: textContext },
      }
      setHistory((prev) => [newItem, ...prev])
    } catch (error) {
      console.error('Text generation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate text')
    } finally {
      setIsGeneratingText(false)
    }
  }

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) return

    setIsGeneratingImage(true)
    setGeneratedImage('')
    setRevisedPrompt('')

    try {
      const response = await fetch('/api/admin/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: imagePrompt,
          size: imageSize,
          quality: imageQuality,
          style: imageStyle,
          model: imageModel,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to generate image')
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
      setRevisedPrompt(data.revisedPrompt || '')

      // Add to history
      const newItem: GeneratedItem = {
        id: Date.now().toString(),
        type: 'image',
        content: data.imageUrl,
        prompt: imagePrompt,
        timestamp: new Date(),
        model: imageModel,
        parameters: { size: imageSize, quality: imageQuality, style: imageStyle, revisedPrompt: data.revisedPrompt },
      }
      setHistory((prev) => [newItem, ...prev])
    } catch (error) {
      console.error('Image generation error:', error)
      alert(error instanceof Error ? error.message : 'Failed to generate image')
    } finally {
      setIsGeneratingImage(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const downloadImage = (url: string, prompt: string) => {
    const link = document.createElement('a')
    link.href = url
    link.download = `ai-generated-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id))
  }

  const clearHistory = () => {
    if (confirm('Clear all history?')) {
      setHistory([])
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Playground</h1>
          <p className="mt-1 text-sm text-gray-500">
            Experiment with OpenAI text and image generation APIs
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('text')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'text'
                ? 'border-purple-500 text-purple-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Wand2 className="h-5 w-5" />
            Text Generation
          </button>
          <button
            onClick={() => setActiveTab('image')}
            className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'image'
                ? 'border-pink-500 text-pink-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ImageIcon className="h-5 w-5" />
            Image Generation
          </button>
        </nav>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Panel */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'text' ? (
            <>
              {/* Text Generation Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-purple-600" />
                  Text Generation
                </h2>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={textModel}
                    onChange={(e) => setTextModel(e.target.value)}
                    disabled={isLoadingTextModels || textModels.length === 0}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100"
                  >
                    {textModels.map((model) => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.description}
                        {model.available === false ? ' - Not listed for this API key' : ''})
                      </option>
                    ))}
                  </select>
                  {textModelMessage && (
                    <p className="mt-2 text-xs text-gray-500">{textModelMessage}</p>
                  )}
                </div>

                {/* Context Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Context Type
                  </label>
                  <select
                    value={textContext}
                    onChange={(e) => setTextContext(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="treatment_title">Treatment Title</option>
                    <option value="treatment_subtitle">Treatment Subtitle</option>
                    <option value="treatment_description">Treatment Description</option>
                    <option value="team_bio">Team Biography</option>
                    <option value="team_credentials">Team Credentials</option>
                    <option value="faq_answer">FAQ Answer</option>
                  </select>
                </div>

                {/* Advanced Parameters */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Max Tokens: {maxTokens}
                    </label>
                    <input
                      type="range"
                      min="50"
                      max="2000"
                      step="50"
                      value={maxTokens}
                      onChange={(e) => setMaxTokens(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temperature: {temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={temperature}
                      onChange={(e) => setTemperature(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={textPrompt}
                    onChange={(e) => setTextPrompt(e.target.value)}
                    placeholder="Enter your prompt here..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateText}
                  disabled={isGeneratingText || !textPrompt.trim()}
                  className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  {isGeneratingText ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand2 className="h-5 w-5" />
                      Generate Text
                    </>
                  )}
                </button>
              </div>

              {/* Generated Text Output */}
              {generatedText && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Generated Text</h3>
                    <button
                      onClick={() => copyToClipboard(generatedText)}
                      className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy
                    </button>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{generatedText}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Image Generation Controls */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-pink-600" />
                  Image Generation
                </h2>

                {/* Model Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={imageModel}
                    onChange={(e) => setImageModel(e.target.value as typeof imageModel)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="dall-e-3">DALL-E 3 (High Quality - $0.04/image)</option>
                    <option value="dall-e-2">DALL-E 2 (Fast & Cheap - $0.02/image)</option>
                  </select>
                </div>

                {/* Image Parameters */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Size
                    </label>
                    <select
                      value={imageSize}
                      onChange={(e) => setImageSize(e.target.value as typeof imageSize)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="1024x1024">Square (1024x1024)</option>
                      <option value="1792x1024">Landscape (1792x1024)</option>
                      <option value="1024x1792">Portrait (1024x1792)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quality
                    </label>
                    <select
                      value={imageQuality}
                      onChange={(e) => setImageQuality(e.target.value as typeof imageQuality)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="standard">Standard</option>
                      <option value="hd">HD (Higher Cost)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Style
                    </label>
                    <select
                      value={imageStyle}
                      onChange={(e) => setImageStyle(e.target.value as typeof imageStyle)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    >
                      <option value="natural">Natural</option>
                      <option value="vivid">Vivid</option>
                    </select>
                  </div>
                </div>

                {/* Prompt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prompt
                  </label>
                  <textarea
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    placeholder="Describe the image you want to generate..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </div>

                {/* Generate Button */}
                <button
                  onClick={handleGenerateImage}
                  disabled={isGeneratingImage || !imagePrompt.trim()}
                  className="w-full px-4 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  {isGeneratingImage ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="h-5 w-5" />
                      Generate Image
                    </>
                  )}
                </button>
              </div>

              {/* Generated Image Output */}
              {generatedImage && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900">Generated Image</h3>
                    <button
                      onClick={() => downloadImage(generatedImage, imagePrompt)}
                      className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </button>
                  </div>
                  <div className="rounded-lg border border-gray-200 overflow-hidden">
                    <img
                      src={generatedImage}
                      alt="Generated"
                      className="w-full h-auto"
                    />
                  </div>
                  {revisedPrompt && (
                    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-1">Revised Prompt:</p>
                      <p className="text-sm text-gray-600">{revisedPrompt}</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* History Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4 sticky top-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">History</h3>
              {history.length > 0 && (
                <button
                  onClick={clearHistory}
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {history.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">
                  No history yet. Generate some content to get started!
                </p>
              ) : (
                history.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        {item.type === 'text' ? (
                          <Wand2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
                        ) : (
                          <ImageIcon className="h-4 w-4 text-pink-600 flex-shrink-0" />
                        )}
                        <span className="text-xs font-medium text-gray-900">{item.model}</span>
                      </div>
                      <button
                        onClick={() => deleteHistoryItem(item.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.prompt}</p>
                    {item.type === 'text' ? (
                      <p className="text-xs text-gray-500 line-clamp-3 bg-gray-50 p-2 rounded">
                        {item.content}
                      </p>
                    ) : (
                      <img
                        src={item.content}
                        alt="Generated"
                        className="w-full h-24 object-cover rounded"
                      />
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                      {item.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
