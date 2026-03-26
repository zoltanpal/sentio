import { useState } from 'react'
import { Heart } from 'lucide-react'
import './App.css'

export default function App() {
  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">
        What is the news saying right now?
      </h1>
      <h4 className="text-lg text-gray-600">
        Search any topic and instantly see the tone of recent news coverage.
      </h4>
      <div className="mt-4">

      </div>
      <div className="mt-6">
        <label>Waiting for the good stuff ...</label>
        
      </div>
    </div>
  );
}