import type { CSVPlayer } from '@/types'

const REQUIRED_COLUMNS = ['name', 'gender', 'skill_category']

export function parseCSV(text: string): CSVPlayer[] {
  const lines = text.trim().split('\n')

  if (lines.length < 2) {
    throw new Error('CSV must have a header row and at least one data row.')
  }

  const headers = lines[0]
    .split(',')
    .map((h) => h.trim().toLowerCase().replace(/\s+/g, '_'))

  for (const required of REQUIRED_COLUMNS) {
    if (!headers.includes(required)) {
      throw new Error(`CSV is missing required column: "${required}"`)
    }
  }

  const players: CSVPlayer[] = []

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue

    const values = parseCSVLine(line)

    if (values.length !== headers.length) {
      throw new Error(`Row ${i + 1} has ${values.length} columns, expected ${headers.length}`)
    }

    const row: Record<string, string> = {}
    headers.forEach((header, idx) => {
      row[header] = values[idx]?.trim() ?? ''
    })

    if (!row.name) {
      throw new Error(`Row ${i + 1}: Player name is required`)
    }

    const genderRaw = row.gender?.trim().toLowerCase()
    let gender: 'male' | 'female'
    if (genderRaw === 'male' || genderRaw === 'm') {
      gender = 'male'
    } else if (genderRaw === 'female' || genderRaw === 'f' || genderRaw === 'w') {
      gender = 'female'
    } else {
      throw new Error(`Row ${i + 1}: Gender must be Male/M or Female/F/W, got "${row.gender}"`)
    }

    players.push({
      name: row.name,
      gender,
      skill_category: row.skill_category ?? '',
    })
  }

  return players
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)
  return result
}

export function generateCSVTemplate(): string {
  const headers = ['name', 'gender', 'skill_category']
  const example = ['John Doe', 'Male', 'Advanced']
  return [headers.join(','), example.join(',')].join('\n')
}

export function downloadCSVTemplate(): void {
  const csv = generateCSVTemplate()
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'players_template.csv'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
