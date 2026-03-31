'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Send, Bot, User, Loader2, Image as ImageIcon, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'

export function HealthChat() {
  const [input, setInput] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imageError, setImageError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleImageSelect = async (file: File | null) => {
    if (!file) return

    // Validate file size (max 4MB)
    if (file.size > 4 * 1024 * 1024) {
      setImageError('Image size must be less than 4MB')
      setSelectedImage(null)
      setImageFile(null)
      return
    }

    // Validate file type
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setImageError('Please upload a JPEG, PNG, or WebP image')
      setSelectedImage(null)
      setImageFile(null)
      return
    }

    setImageError(null)
    setImageFile(file)

    // Read and display preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.currentTarget.files?.[0]
    handleImageSelect(file || null)
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if ((!input.trim() && !selectedImage) || isLoading) return

    const messageContent: Array<{ type: 'text' | 'image'; text?: string; image?: string }> = []

    if (selectedImage) {
      messageContent.push({
        type: 'image',
        image: selectedImage,
      })
    }

    if (input.trim()) {
      messageContent.push({
        type: 'text',
        text: input,
      })
    }

    // If no text but there's an image, add a default message
    if (messageContent.length === 1 && messageContent[0].type === 'image') {
      messageContent.push({
        type: 'text',
        text: 'Please analyze this prescription image and provide medication instructions, dosages, frequency, and information about the condition.',
      })
    }

    sendMessage({ 
      text: input || 'Please analyze this prescription.',
      parts: messageContent.map((part) => ({
        type: part.type,
        ...(part.type === 'text' ? { text: part.text } : { image: part.image }),
      })),
    })

    setInput('')
    setSelectedImage(null)
    setImageFile(null)
    setImageError(null)
  }

  const suggestedQuestions = [
    "I have a headache and fever",
    "What are symptoms of diabetes?",
    "I feel tired all the time",
    "Chest pain when breathing deeply"
  ]

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-w-4xl mx-auto">
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center px-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-foreground mb-2">
              Welcome to HealthAI
            </h2>
            <p className="text-muted-foreground mb-6 max-w-md">
              Describe your symptoms and I&apos;ll help you understand what might be causing them, 
              along with precautions and when to seek medical care.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  className="text-sm text-left h-auto py-3 px-4 justify-start"
                  onClick={() => {
                    sendMessage({ text: question })
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === 'user' ? "justify-end" : "justify-start"
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
              <Card
                className={cn(
                  "max-w-[80%] p-4",
                  message.role === 'user'
                    ? "bg-primary text-primary-foreground"
                    : "bg-card"
                )}
              >
                <div className="text-sm leading-relaxed prose prose-sm dark:prose-invert max-w-none">
                  {message.parts.map((part, index) => {
                    if (part.type === 'text') {
                      return message.role === 'assistant' ? (
                        <ReactMarkdown
                          key={index}
                          components={{
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline hover:text-primary/80 font-medium"
                              >
                                {children}
                              </a>
                            ),
                            p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                            ul: ({ children }) => <ul className="list-disc pl-4 mb-2">{children}</ul>,
                            ol: ({ children }) => <ol className="list-decimal pl-4 mb-2">{children}</ol>,
                            li: ({ children }) => <li className="mb-1">{children}</li>,
                            strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          }}
                        >
                          {part.text}
                        </ReactMarkdown>
                      ) : (
                        <span key={index}>{part.text}</span>
                      )
                    } else if (part.type === 'image' && 'image' in part && typeof (part as any).image === 'string') {
                      return (
                        <img
                          key={index}
                          src={(part as any).image}
                          alt="Prescription"
                          className="max-w-full rounded-lg mt-2 max-h-64 object-contain"
                        />
                      )
                    }
                    return null
                  })}
                </div>
              </Card>
              {message.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        
        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === 'user' && (
          <div className="flex gap-3 justify-start">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary" />
            </div>
            <Card className="bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm">Analyzing your symptoms...</span>
              </div>
            </Card>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t bg-background p-4">
        {/* Image Preview */}
        {selectedImage && (
          <div className="mb-3 max-w-4xl mx-auto">
            <div className="relative inline-block">
              <img
                src={selectedImage}
                alt="Selected prescription"
                className="max-h-32 rounded-lg border border-muted"
              />
              <button
                onClick={() => {
                  setSelectedImage(null)
                  setImageFile(null)
                  setImageError(null)
                }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Error message */}
        {imageError && (
          <div className="mb-3 max-w-4xl mx-auto text-sm text-destructive bg-destructive/10 p-2 rounded">
            {imageError}
          </div>
        )}

        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Describe your symptoms or ask about prescription..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button 
              type="submit" 
              disabled={isLoading || (!input.trim() && !selectedImage)}
              size="lg"
              className="px-4"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>

          {/* Image Upload Buttons */}
          <div className="flex gap-2 justify-between items-center">
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileInputChange}
                disabled={isLoading}
                className="hidden"
                aria-label="Upload prescription image from file"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset input value to allow same file to be selected again
                  if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                    fileInputRef.current.click()
                  }
                }}
                disabled={isLoading}
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Image
              </Button>

              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileInputChange}
                disabled={isLoading}
                className="hidden"
                aria-label="Capture prescription image with camera"
                onClick={(e) => {
                  // Reset the input so the same camera can be opened multiple times
                  (e.target as HTMLInputElement).value = ''
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Reset input value to allow same file to be selected again
                  if (cameraInputRef.current) {
                    cameraInputRef.current.value = ''
                    cameraInputRef.current.click()
                  }
                }}
                disabled={isLoading}
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Take Photo
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              {selectedImage ? '✓ Image selected' : 'Max 4MB JPEG, PNG, WebP'}
            </p>
          </div>
        </form>

        <p className="text-xs text-muted-foreground text-center mt-3">
          This AI assistant is not a replacement for professional medical advice. 
          Always consult a healthcare provider for proper diagnosis.
        </p>
      </div>
    </div>
  )
}
