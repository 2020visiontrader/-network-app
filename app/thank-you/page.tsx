import HiveHexGrid from '@/components/HiveHexGrid'

export default function ThankYouPage() {
  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-6 py-20 relative overflow-hidden">
      <HiveHexGrid />

      <div className="relative z-10 max-w-2xl w-full bg-zinc-900 bg-opacity-60 border border-zinc-800 rounded-2xl shadow-xl p-10 backdrop-blur-md text-center">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-500 to-indigo-400 text-transparent bg-clip-text mb-4">
          You're on the List 🐝
        </h1>
        <p className="text-gray-400 text-base leading-relaxed">
          Your application to <span className="text-white font-medium">Network</span> has been received.
          <br />
          As we grow our Hive, we're reviewing each request manually to ensure alignment.
        </p>

        <div className="my-6 text-sm text-zinc-400 space-y-2">
          <p>🔍 We'll notify you when your profile is accepted.</p>
          <p>💡 Once approved, you'll be able to:</p>
          <ul className="list-disc list-inside text-left mx-auto max-w-md mt-2 text-zinc-400">
            <li>Access curated business connections by niche + city</li>
            <li>Join mastermind groups and in-person hives</li>
            <li>See smart intros and travel matches across the globe</li>
          </ul>
        </div>

        <p className="text-sm text-gray-500 mt-6">
          In the meantime, feel free to check your inbox or follow us on socials for updates.
        </p>
      </div>
    </main>
  )
}
