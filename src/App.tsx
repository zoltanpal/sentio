import { useState } from 'react'
import { Heart } from 'lucide-react'
import './App.css'

export default function App() {
  return (
    <div className="App">
      <h1 className="text-3xl font-bold underline">
        Hello world!
      </h1>
      <Heart className="text-red-500" />
    </div>
  );
}