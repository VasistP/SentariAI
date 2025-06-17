import { readFileSync } from 'fs'
import { join } from 'path'
import { VoiceEntry } from './types'

/**
 * Parse CSV row to VoiceEntry
 * Assumes CSV headers match VoiceEntry field names
 */
function parseCSVRow(row: Record<string, string>): VoiceEntry {
  return {
    id: row.id,
    user_id: row.user_id,
    audio_url: row.audio_url || null,
    transcript_raw: row.transcript_raw,
    transcript_user: row.transcript_user,
    language_detected: row.language_detected,
    language_rendered: row.language_rendered,
    tags_model: row.tags_model ? JSON.parse(row.tags_model) : [],
    tags_user: row.tags_user ? JSON.parse(row.tags_user) : [],
    category: row.category || null,
    created_at: row.created_at,
    updated_at: row.updated_at,
    emotion_score_score: row.emotion_score_score ? parseFloat(row.emotion_score_score) : null,
    embedding: row.embedding ? JSON.parse(row.embedding) : null,
    
    // Optional fields
    emotion_score_log: row.emotion_score_log || null,
    tags_log: row.tags_log || null,
    tags_log_user_original: row.tags_log_user_original || null,
    entry_emoji: row.entry_emoji || null,
    emoji_source: row.emoji_source || null,
    emoji_log: row.emoji_log || null,
    reminder_date: row.reminder_date || null,
    idea_status: row.idea_status || null,
  }
}

/**
 * Load and parse the CSV file
 */
function loadMockEntries(): VoiceEntry[] {
  try {
    // Read CSV file from project root
    const csvPath = join(process.cwd(), 'Expanded_Diary_Entries.csv')
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    // Simple CSV parsing (you might want to use a library like papaparse for production)
    const lines = csvContent.split('\n').filter(line => line.trim())
    const headers = lines[0].split(',').map(h => h.trim())
    
    const entries: VoiceEntry[] = []
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      const row: Record<string, string> = {}
      
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim() || ''
      })
      
      entries.push(parseCSVRow(row))
    }
    
    return entries
  } catch (error) {
    console.error('Error loading mock entries:', error)
    // Return sample data if CSV loading fails
    return [
      {
        id: 'sample-1',
        user_id: 'user1',
        audio_url: null,
        transcript_raw: 'This is a sample reflection entry about my day.',
        transcript_user: 'This is a sample reflection entry about my day.',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: ['reflection'],
        tags_user: ['reflection', 'daily'],
        category: 'personal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        emotion_score_score: 0.5,
        embedding: null
      }
    ]
  }
}

export const mockVoiceEntries = loadMockEntries()