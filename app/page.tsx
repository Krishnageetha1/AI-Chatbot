'use client'

import { useState } from 'react'
import { HealthChat } from '@/components/health-chat'
import { BMICalculator } from '@/components/bmi-calculator'
import { cn } from '@/lib/utils'
import { MessageCircle, Calculator, Heart, Shield } from 'lucide-react'

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<'chat' | 'bmi'>('chat')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Heart className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">HealthAI</h1>
                <p className="text-xs text-muted-foreground">AI-Powered Health Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span className="hidden sm:inline">Your data is private and secure</span>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-4">
          <nav className="flex gap-1">
            <button
              onClick={() => setActiveTab('chat')}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'chat'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageCircle className="w-4 h-4" />
              Symptom Checker
            </button>
            <button
              onClick={() => setActiveTab('bmi')}
              className={cn(
                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                activeTab === 'bmi'
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Calculator className="w-4 h-4" />
              BMI Calculator
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="py-6">
        {activeTab === 'chat' ? <HealthChat /> : <BMICalculator />}
      </main>
    </div>
  )
}
