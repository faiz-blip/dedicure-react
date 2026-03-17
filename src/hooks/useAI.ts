import { useState } from 'react'
import { backendUrl } from '@/lib/config'

interface UseAIProps {
  systemInstruction?: string
}

export function useAI({ systemInstruction }: UseAIProps = {}) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generateContent = async (prompt: string): Promise<string | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const res = await fetch(backendUrl('/api/ai'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch AI response')
      }

      return data.result
    } catch (err: any) {
      console.error(err)
      setError(err.message || 'An unexpected error occurred')
      return null
    } finally {
      setIsLoading(false)
    }
  }

  return { generateContent, isLoading, error }
}
