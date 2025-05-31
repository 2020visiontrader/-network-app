'use client'

interface OnboardingProgressProps {
  currentStep: number
  totalSteps: number
  stepTitle: string
}

export default function OnboardingProgress({ currentStep, totalSteps, stepTitle }: OnboardingProgressProps) {
  const progress = (currentStep / totalSteps) * 100

  return (
    <div className="w-full max-w-4xl mx-auto px-6 py-8">
      <div className="text-center mb-6">
        <p className="text-sm text-gray-400 mb-2">
          Step {currentStep} of {totalSteps}
        </p>
        <h2 className="text-xl font-semibold text-white">
          {stepTitle}
        </h2>
      </div>
      
      <div className="w-full bg-zinc-800 rounded-full h-2 mb-8">
        <div 
          className="bg-gradient-to-r from-purple-500 to-yellow-400 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}
