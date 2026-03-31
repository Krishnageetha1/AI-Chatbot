'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Calculator, Scale, Ruler, AlertCircle, CheckCircle, Info } from 'lucide-react'

type BMICategory = 'underweight' | 'normal' | 'overweight' | 'obese' | null

interface BMIResult {
  bmi: number
  category: BMICategory
  message: string
  color: string
  recommendations: string[]
}

function calculateBMI(weight: number, height: number, unit: 'metric' | 'imperial'): BMIResult | null {
  let bmi: number
  
  if (unit === 'metric') {
    // Weight in kg, height in cm
    const heightInMeters = height / 100
    bmi = weight / (heightInMeters * heightInMeters)
  } else {
    // Weight in lbs, height in inches
    bmi = (weight / (height * height)) * 703
  }
  
  bmi = Math.round(bmi * 10) / 10
  
  if (bmi < 18.5) {
    return {
      bmi,
      category: 'underweight',
      message: 'Underweight',
      color: 'text-amber-600',
      recommendations: [
        'Consult a healthcare provider to rule out underlying conditions',
        'Focus on nutrient-dense foods with healthy fats',
        'Consider strength training to build muscle mass',
        'Eat smaller, more frequent meals if needed',
        'Track your caloric intake to ensure adequate nutrition'
      ]
    }
  } else if (bmi < 25) {
    return {
      bmi,
      category: 'normal',
      message: 'Normal Weight',
      color: 'text-green-600',
      recommendations: [
        'Maintain your current healthy lifestyle',
        'Continue regular physical activity (150+ min/week)',
        'Eat a balanced diet rich in fruits and vegetables',
        'Stay hydrated and get adequate sleep',
        'Schedule regular health check-ups'
      ]
    }
  } else if (bmi < 30) {
    return {
      bmi,
      category: 'overweight',
      message: 'Overweight',
      color: 'text-orange-600',
      recommendations: [
        'Aim for gradual weight loss (0.5-1 kg per week)',
        'Increase physical activity to 200-300 min/week',
        'Reduce processed foods and added sugars',
        'Practice portion control and mindful eating',
        'Consider consulting a dietitian for personalized advice'
      ]
    }
  } else {
    return {
      bmi,
      category: 'obese',
      message: 'Obese',
      color: 'text-red-600',
      recommendations: [
        'Consult your healthcare provider for a comprehensive plan',
        'Start with low-impact exercises like walking or swimming',
        'Focus on sustainable lifestyle changes, not crash diets',
        'Consider working with a registered dietitian',
        'Monitor blood pressure, cholesterol, and blood sugar regularly'
      ]
    }
  }
}

export function BMICalculator() {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric')
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [heightFeet, setHeightFeet] = useState('')
  const [heightInches, setHeightInches] = useState('')
  const [result, setResult] = useState<BMIResult | null>(null)
  const [error, setError] = useState('')

  const handleCalculate = () => {
    setError('')
    setResult(null)

    let weightNum: number
    let heightNum: number

    if (unit === 'metric') {
      weightNum = parseFloat(weight)
      heightNum = parseFloat(height)
      
      if (!weightNum || !heightNum || weightNum <= 0 || heightNum <= 0) {
        setError('Please enter valid weight and height values')
        return
      }
      
      if (weightNum < 20 || weightNum > 300) {
        setError('Please enter a weight between 20-300 kg')
        return
      }
      
      if (heightNum < 100 || heightNum > 250) {
        setError('Please enter a height between 100-250 cm')
        return
      }
    } else {
      weightNum = parseFloat(weight)
      const feet = parseFloat(heightFeet) || 0
      const inches = parseFloat(heightInches) || 0
      heightNum = (feet * 12) + inches
      
      if (!weightNum || heightNum <= 0 || weightNum <= 0) {
        setError('Please enter valid weight and height values')
        return
      }
      
      if (weightNum < 50 || weightNum > 660) {
        setError('Please enter a weight between 50-660 lbs')
        return
      }
      
      if (heightNum < 40 || heightNum > 100) {
        setError('Please enter a height between 3\'4" and 8\'4"')
        return
      }
    }

    const bmiResult = calculateBMI(weightNum, heightNum, unit)
    setResult(bmiResult)
  }

  const handleReset = () => {
    setWeight('')
    setHeight('')
    setHeightFeet('')
    setHeightInches('')
    setResult(null)
    setError('')
  }

  const getCategoryIcon = (category: BMICategory) => {
    switch (category) {
      case 'normal':
        return <CheckCircle className="w-6 h-6 text-green-600" />
      case 'underweight':
      case 'overweight':
        return <AlertCircle className="w-6 h-6 text-amber-600" />
      case 'obese':
        return <AlertCircle className="w-6 h-6 text-red-600" />
      default:
        return null
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-2">
            <Calculator className="w-6 h-6 text-primary" />
          </div>
          <CardTitle className="text-2xl">BMI Calculator</CardTitle>
          <CardDescription>
            Calculate your Body Mass Index and get personalized health recommendations
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Unit Toggle */}
          <div className="flex justify-center gap-2">
            <Button
              variant={unit === 'metric' ? 'default' : 'outline'}
              onClick={() => {
                setUnit('metric')
                handleReset()
              }}
              className="w-28"
            >
              Metric
            </Button>
            <Button
              variant={unit === 'imperial' ? 'default' : 'outline'}
              onClick={() => {
                setUnit('imperial')
                handleReset()
              }}
              className="w-28"
            >
              Imperial
            </Button>
          </div>

          {/* Input Fields */}
          <div className="grid gap-4">
            {/* Weight Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Scale className="w-4 h-4 text-muted-foreground" />
                Weight ({unit === 'metric' ? 'kg' : 'lbs'})
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder={unit === 'metric' ? 'e.g., 70' : 'e.g., 154'}
                className="w-full px-4 py-3 rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>

            {/* Height Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Ruler className="w-4 h-4 text-muted-foreground" />
                Height ({unit === 'metric' ? 'cm' : 'ft & in'})
              </label>
              {unit === 'metric' ? (
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="e.g., 175"
                  className="w-full px-4 py-3 rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={heightFeet}
                      onChange={(e) => setHeightFeet(e.target.value)}
                      placeholder="Feet"
                      className="w-full px-4 py-3 rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={heightInches}
                      onChange={(e) => setHeightInches(e.target.value)}
                      placeholder="Inches"
                      className="w-full px-4 py-3 rounded-lg border bg-input text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-destructive text-sm p-3 bg-destructive/10 rounded-lg">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button onClick={handleCalculate} className="flex-1" size="lg">
              Calculate BMI
            </Button>
            <Button onClick={handleReset} variant="outline" size="lg">
              Reset
            </Button>
          </div>

          {/* Result */}
          {result && (
            <div className="space-y-4 pt-4 border-t">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getCategoryIcon(result.category)}
                  <span className={cn("text-lg font-semibold", result.color)}>
                    {result.message}
                  </span>
                </div>
                <div className="text-4xl font-bold text-foreground">
                  {result.bmi}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Body Mass Index
                </p>
              </div>

              {/* BMI Scale */}
              <div className="space-y-2">
                <div className="h-3 rounded-full bg-gradient-to-r from-amber-400 via-green-400 via-orange-400 to-red-500 relative">
                  <div 
                    className="absolute w-3 h-5 bg-foreground rounded-sm -top-1 transform -translate-x-1/2 border-2 border-background"
                    style={{ 
                      left: `${Math.min(Math.max((result.bmi - 15) / 25 * 100, 0), 100)}%` 
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Underweight</span>
                  <span>Normal</span>
                  <span>Overweight</span>
                  <span>Obese</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <h4 className="font-semibold flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                BMI is a general indicator and may not apply to athletes, elderly, or pregnant individuals. 
                Consult a healthcare provider for personalized advice.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
