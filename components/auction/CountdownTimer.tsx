'use client'

import { useEffect, useState, useRef } from 'react'
import { Timer } from 'lucide-react'

interface CountdownTimerProps {
  seconds: number
  isActive: boolean
  onExpire?: () => void
  resetKey?: string | number
}

export function CountdownTimer({ seconds, isActive, onExpire, resetKey }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(seconds)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const expiredRef = useRef(false)

  useEffect(() => {
    setTimeLeft(seconds)
    expiredRef.current = false
  }, [seconds, resetKey])

  useEffect(() => {
    if (!isActive) {
      if (intervalRef.current) clearInterval(intervalRef.current)
      return
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          if (!expiredRef.current) {
            expiredRef.current = true
            onExpire?.()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isActive, onExpire])

  const percentage = seconds > 0 ? (timeLeft / seconds) * 100 : 0
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference * (1 - percentage / 100)

  const getColor = () => {
    if (percentage > 50) return '#3b82f6'
    if (percentage > 25) return '#f59e0b'
    return '#ef4444'
  }

  const color = getColor()

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="relative w-36 h-36">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
          />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <Timer
            className="h-5 w-5 mb-1"
            style={{ color }}
          />
          <span
            className="text-3xl font-bold tabular-nums"
            style={{ color }}
          >
            {timeLeft}
          </span>
          <span className="text-xs text-slate-500">seconds</span>
        </div>
      </div>

      {!isActive && (
        <p className="text-xs text-slate-500 text-center">
          {timeLeft === 0 ? 'Time expired' : 'Paused'}
        </p>
      )}
    </div>
  )
}
