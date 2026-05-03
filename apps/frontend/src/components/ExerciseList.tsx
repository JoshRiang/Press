// IMPORTANT: THIS CODE IS NOT USED IN THIS PROJECT

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Exercise } from '@/src/services/exerciseService'
import ExerciseCard from './ExerciseCard'

interface ExerciseListProps {
  exercises: Exercise[]
}

function useAuth() {
  const [token] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('accessToken')
  })
  return { isAuthenticated: !!token }
}

export default function ExerciseList({ exercises }: ExerciseListProps) {
  const { isAuthenticated } = useAuth()

  return (
    <div className="flex flex-col gap-4">
      <div className="sticky top-0 z-10 border-b border-slate-800/60 bg-slate-950/80 px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wider text-slate-400">
            Exercises
          </h2>
          {isAuthenticated ? (
            <span className="font-mono text-xs text-sky-400">Authenticated</span>
          ) : (
            <Link
              href="/auth/login"
              className="rounded-lg bg-sky-400 px-3 py-1.5 font-mono text-xs font-medium text-slate-950 transition-opacity hover:opacity-90"
            >
              Login to Log Workout
            </Link>
          )}
        </div>
      </div>
      <div className="flex flex-col gap-3 px-4 pb-8">
        {exercises.map((ex) => (
          <ExerciseCard key={ex.exercise_id} exercise={ex} isAuthenticated={isAuthenticated} />
        ))}
      </div>
    </div>
  )
}
