import HiveHexGrid from '@/components/HiveHexGrid'

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-purple-950 to-black text-white relative overflow-hidden">
      <HiveHexGrid />
      
      <div className="relative z-10 min-h-screen flex flex-col">
        {children}
      </div>
    </main>
  )
}
