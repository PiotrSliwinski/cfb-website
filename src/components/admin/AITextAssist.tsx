'use client';

import { useState } from 'react';
import { Sparkles, Loader2, Check, X, Copy, RotateCcw } from 'lucide-react';

interface AITextAssistProps {
  onApply: (text: string) => void;
  prompt: string;
  contextType?: 'treatment_title' | 'treatment_description' | 'team_bio' | 'faq_answer' | 'general';
  placeholder?: string;
  maxTokens?: number;
  buttonLabel?: string;
  className?: string;
}

export function AITextAssist({
  onApply,
  prompt,
  contextType = 'general',
  placeholder = 'Enter a prompt for AI to generate text...',
  maxTokens = 500,
  buttonLabel = 'Generate with AI',
  className = '',
}: AITextAssistProps) {
  const [userPrompt, setUserPrompt] = useState(prompt);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedText, setGeneratedText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleGenerate = async () => {
    if (!userPrompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setGeneratedText(null);

    try {
      const response = await fetch('/api/admin/ai/generate-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: userPrompt,
          context: { type: contextType },
          maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      const data = await response.json();
      setGeneratedText(data.text);
    } catch (err) {
      console.error('AI generation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate text');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApply = () => {
    if (generatedText) {
      onApply(generatedText);
      setGeneratedText(null);
      setShowPromptInput(false);
    }
  };

  const handleCopy = () => {
    if (generatedText) {
      navigator.clipboard.writeText(generatedText);
    }
  };

  const handleRegenerate = () => {
    handleGenerate();
  };

  const handleCancel = () => {
    setGeneratedText(null);
    setError(null);
    setShowPromptInput(false);
  };

  if (!showPromptInput) {
    return (
      <button
        type="button"
        onClick={() => setShowPromptInput(true)}
        className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg ${className}`}
      >
        <Sparkles className="w-4 h-4" />
        {buttonLabel}
      </button>
    );
  }

  return (
    <div className={`space-y-3 p-4 bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h4 className="font-semibold text-gray-900">AI Text Assistant</h4>
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
          What would you like to generate?
        </label>
        <textarea
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
          placeholder={placeholder}
          rows={3}
          disabled={isGenerating}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
        />
      </div>

      {/* Generate Button */}
      {!generatedText && (
        <div>
          <button
            type="button"
            onClick={handleGenerate}
            disabled={isGenerating || !userPrompt.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium rounded-lg hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate
              </>
            )}
          </button>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
          <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Generated Text */}
      {generatedText && (
        <div className="space-y-3">
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Generated Text:</p>
            <div className="prose prose-sm max-w-none">
              <p className="text-gray-900 whitespace-pre-wrap">{generatedText}</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleApply}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              Apply
            </button>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
              title="Copy to clipboard"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isGenerating}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
              title="Regenerate"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Helper Text */}
      <p className="text-xs text-gray-600">
        💡 Tip: Be specific in your prompt for better results. AI-generated content should be reviewed before publishing.
      </p>
    </div>
  );
}
