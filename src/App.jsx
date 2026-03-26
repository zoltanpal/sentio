import { useState } from 'react'
import { Heart } from 'lucide-react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-8 p-8">
          <div className="flex justify-center gap-4">
            <Heart className="w-12 h-12 text-red-500 fill-red-500" />
            <div className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Sentio
            </div>
          </div>
          
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
            Welcome to your React App
          </h1>
          
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-md mx-auto">
            Built with Vite, React, Tailwind CSS, shadcn/ui, ESLint, and Lucide Icons
          </p>
          
          <button
            onClick={() => setCount((count) => count + 1)}
            className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
          >
            Clicks: {count}
          </button>
          
          <div className="pt-8 text-sm text-slate-500 dark:text-slate-400">
            <p>✓ React 19</p>
            <p>✓ Vite 8</p>
            <p>✓ Tailwind CSS 4</p>
            <p>✓ shadcn/ui</p>
            <p>✓ ESLint configured</p>
            <p>✓ Lucide Icons</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
