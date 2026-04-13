import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
      <div className="text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-5xl font-bold text-orange-600">Smokey's QR System</h1>
          <p className="text-xl text-gray-400">
            Streamlined service request management
          </p>
        </div>

        <div className="flex gap-4 justify-center">
          <Link
            href="/admin"
            className="px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-colors"
          >
            Admin Dashboard
          </Link>
          <Link
            href="/staff"
            className="px-8 py-3 bg-gray-700 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
          >
            Staff Portal
          </Link>
        </div>
      </div>
    </main>
  )
}
