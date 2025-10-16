'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X, RotateCcw, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface AIImageGenerateProps {
  onApply: (url: string) => void;
  bucket?: 'team' | 'treatments' | 'general';
  defaultPrompt?: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  quality?: 'standard' | 'hd';
  className?: string;
}

export function AIImageGenerate({
  onApply,
  bucket = 'general',
  defaultPrompt = '',
  size = '1024x1024',
  quality = 'standard',
  className = '',
}: AIImageGenerateProps) {
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [revisedPrompt, setRevisedPrompt] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedSize, setSelectedSize] = useState(size);
  const [selectedQuality, setSelectedQuality] = useState(quality);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedImageUrl(null);

    try {
      const response = await fetch('/api/admin/ai/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          bucket,
          size: selectedSize,
          quality: selectedQuality,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image');
      }

      const data = await response.json();
      setGeneratedImageUrl(data.url);
      setRevisedPrompt(data.revisedPrompt);
    } catch (err) {
      console.error('AI image generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedImageUrl) {
      onApply(generatedImageUrl);
      setGeneratedImageUrl(null);
      setShowGenerator(false);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCancel = () => {
    setGeneratedImageUrl(null);
    setError(null);
    setShowGenerator(false);
  };

  if (!showGenerator) {
    return (
      <button
        type="button"
        onClick={() => setShowGenerator(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${className}`}
        title="Generate image with AI"
      >
        <Sparkles className="w-4 h-4" />
        Generate with AI
      </button>
    );
  }

  return (
    <div className={`space-y-4 p-4 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center">
            <ImageIcon className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">AI Image Generator</h4>
        </div>
        <button
          type="button"
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Prompt Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe the image you want to generate
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="E.g., 'A modern dental clinic interior with natural lighting, professional and welcoming atmosphere'"
          rows={3}
          disabled={isGenerating}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Size
          </label>
          <select
            value={selectedSize}
            onChange={(e) => setSelectedSize(e.target.value as typeof selectedSize)}
            disabled={isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="1024x1024">Square (1024x1024)</option>
            <option value="1792x1024">Landscape (1792x1024)</option>
            <option value="1024x1792">Portrait (1024x1792)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quality
          </label>
          <select
            value={selectedQuality}
            onChange={(e) => setSelectedQuality(e.target.value as typeof selectedQuality)}
            disabled={isGenerating}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
          >
            <option value="standard">Standard</option>
            <option value="hd">HD (Higher cost)</option>
          </select>
        </div>
      </div>

      {/* Generate Button */}
      {!generatedImageUrl && (
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-medium rounded-lg hover:from-pink-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating image... (this may take 10-30 seconds)
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              Generate Image
            </>
          )}
        </button>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generated Image */}
      {generatedImageUrl && (
        <div className="space-y-3">
          {/* Image Preview */}
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-gray-300 bg-gray-100">
            <Image
              src={generatedImageUrl}
              alt="AI Generated"
              fill
              className="object-contain"
            />
          </div>

          {/* Revised Prompt */}
          {revisedPrompt && revisedPrompt !== prompt && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-xs font-medium text-blue-800 mb-1">AI-Revised Prompt:</p>
              <p className="text-xs text-blue-700">{revisedPrompt}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Use This Image
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              title="Generate again"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-600">
        💡 Tip: Be descriptive and specific. DALL-E 3 works best with detailed prompts. Standard quality is usually sufficient.
      </p>
      <p className="text-xs text-amber-600">
        ⚠️ Note: Image generation uses OpenAI credits and may take 10-30 seconds.
      </p>
    </div>
  );
}
