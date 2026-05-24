'use client'

import { useState, useRef, useCallback } from 'react'
import { Upload, FileText, X, AlertCircle, CheckCircle, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { parseCSV } from '@/utils/csv'
import type { CSVPlayer } from '@/types'
import { cn } from '@/lib/utils'

interface CSVUploadProps {
  onUpload: (players: CSVPlayer[]) => Promise<void>
  isLoading?: boolean
}

const TEMPLATE_ROWS = [
  'name,gender,skill_category',
  'John Doe,Male,Advanced',
  'Jane Smith,Female,Intermediate',
  'Alex Kumar,M,Beginner',
]

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_ROWS.join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'players_template.csv'
  a.click()
  URL.revokeObjectURL(url)
}

export function CSVUpload({ onUpload, isLoading }: CSVUploadProps) {
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [parsedPlayers, setParsedPlayers] = useState<CSVPlayer[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback((file: File) => {
    setError(null)
    setSuccess(false)
    setParsedPlayers(null)

    if (!file.name.endsWith('.csv')) {
      setError('Please upload a CSV file.')
      return
    }

    setFileName(file.name)
    const reader = new FileReader()

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string
        const players = parseCSV(text)
        if (players.length === 0) {
          setError('No valid players found in the CSV file.')
          return
        }
        setParsedPlayers(players)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse CSV file.')
      }
    }

    reader.onerror = () => setError('Failed to read the file.')
    reader.readAsText(file)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault()
      setDragOver(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const handleUpload = async () => {
    if (!parsedPlayers) return
    try {
      await onUpload(parsedPlayers)
      setSuccess(true)
      setParsedPlayers(null)
      setFileName(null)
      if (inputRef.current) inputRef.current.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload players.')
    }
  }

  const handleClear = () => {
    setParsedPlayers(null)
    setFileName(null)
    setError(null)
    setSuccess(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={downloadTemplate} type="button">
          <Download className="h-3.5 w-3.5 mr-2" />
          Download Template
        </Button>
      </div>

      {!parsedPlayers && (
        <div
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer',
            dragOver
              ? 'border-blue-500 bg-blue-500/10'
              : 'border-slate-700 hover:border-slate-600 hover:bg-slate-900/50'
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <Upload className="h-8 w-8 text-slate-500 mx-auto mb-3" />
          <p className="text-slate-300 font-medium">Drop your CSV file here</p>
          <p className="text-slate-500 text-sm mt-1">or click to browse</p>
          <p className="text-slate-600 text-xs mt-3">
            Required columns: name, gender, skill_category
          </p>
          <p className="text-slate-600 text-xs">
            Gender: Male/M or Female/F/W
          </p>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Players uploaded successfully!</AlertDescription>
        </Alert>
      )}

      {parsedPlayers && (
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-slate-700">
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">{fileName}</p>
                <p className="text-xs text-slate-400">{parsedPlayers.length} players detected</p>
              </div>
            </div>
            <button
              onClick={handleClear}
              className="text-slate-500 hover:text-slate-300 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="max-h-48 overflow-y-auto rounded-md border border-slate-800">
            <table className="w-full text-sm">
              <thead className="bg-slate-900 sticky top-0">
                <tr>
                  <th className="px-3 py-2 text-left text-xs text-slate-400 font-medium">Name</th>
                  <th className="px-3 py-2 text-left text-xs text-slate-400 font-medium">Gender</th>
                  <th className="px-3 py-2 text-left text-xs text-slate-400 font-medium">Category</th>
                </tr>
              </thead>
              <tbody>
                {parsedPlayers.map((player, i) => (
                  <tr key={i} className="border-t border-slate-800 hover:bg-slate-800/30">
                    <td className="px-3 py-2 text-white">{player.name}</td>
                    <td className="px-3 py-2 text-slate-300 capitalize">{player.gender}</td>
                    <td className="px-3 py-2 text-slate-300">{player.skill_category}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleClear}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleUpload} loading={isLoading}>
              Upload {parsedPlayers.length} Players
            </Button>
          </div>
        </div>
      )}

      <div className="p-3 bg-slate-900/50 rounded-md border border-slate-800">
        <p className="text-xs font-medium text-slate-400 mb-1">Required columns:</p>
        <p className="text-xs text-slate-500">name, gender (Male/M or Female/F/W), skill_category</p>
        <p className="text-xs text-slate-600 mt-1">skill_category must match the category names set in the tournament. Base price is taken from the category.</p>
      </div>
    </div>
  )
}
