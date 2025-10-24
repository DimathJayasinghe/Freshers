'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function Home() {
  const [faculties, setFaculties] = useState([])

  useEffect(() => {
    fetchFaculties()
  }, [])

  async function fetchFaculties() {
    const { data, error } = await supabase.from('faculties').select('*')
    if (error) console.error(error)
    else setFaculties(data)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">🏆 UCSC Sports Meet Scoreboard</h1>
      <ul>
        {faculties.map(f => (
          <li key={f.id} className="p-2 bg-gray-100 mb-2 rounded">{f.name}</li>
        ))}
      </ul>
    </div>
  )
}
