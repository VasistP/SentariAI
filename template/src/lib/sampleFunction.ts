import { VoiceEntry, ProcessedResult, WordCloudItem } from './types.js'

// Common stop words to filter out
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your',
  'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she',
  'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that',
  'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'have', 'has', 'had', 'having', 'do', 'does', 'did', 'a', 'an',
  'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of',
  'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through',
  'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down',
  'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then',
  'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'both',
  'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not',
  'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will',
  'just', 'don', 'should', 'now', 've', 'll', 'm', 're', 'd', 'didn', 'doesn',
  'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan',
  'shouldn', 'wasn', 'weren', 'won', 'wouldn'
])

/**
 * Extract keywords from text by removing stop words and normalizing
 */
function extractKeywords(text: string): string[] {
  // Convert to lowercase and extract words
  const words = text.toLowerCase()
    .replace(/[^\w\s]/g, ' ') // Remove punctuation
    .split(/\s+/)              // Split by whitespace
    .filter(word => word.length > 2) // Filter short words
    .filter(word => !STOP_WORDS.has(word)) // Remove stop words
    .filter(word => !/^\d+$/.test(word)) // Remove pure numbers
  
  return words
}

/**
 * Calculate word frequencies from entries
 */
function calculateWordFrequencies(entries: VoiceEntry[]): Record<string, number> {
  const frequencies: Record<string, number> = {}
  
  for (const entry of entries) {
    // Extract keywords from transcript
    const keywords = extractKeywords(entry.transcript_user)
    
    // Also include user tags as keywords
    const tagKeywords = entry.tags_user.flatMap(tag => 
      extractKeywords(tag)
    )
    
    // Count frequencies
    for (const keyword of [...keywords, ...tagKeywords]) {
      frequencies[keyword] = (frequencies[keyword] || 0) + 1
    }
  }
  
  return frequencies
}

/**
 * Convert frequencies to word cloud items (top N words)
 */
function frequenciesToWordCloud(
  frequencies: Record<string, number>, 
  topN: number = 50
): WordCloudItem[] {
  // Sort by frequency and take top N
  const sortedWords = Object.entries(frequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, topN)
  
  // Calculate total for percentages
  const total = sortedWords.reduce((sum, [, freq]) => sum + freq, 0)
  
  // Convert to WordCloudItem format
  return sortedWords.map(([text, value]) => ({
    text,
    value,
    percentage: (value / total) * 100
  }))
}

/**
 * Filter entries by date range
 */
function filterEntriesByDate(
  entries: VoiceEntry[], 
  startDate: Date, 
  endDate: Date
): VoiceEntry[] {
  return entries.filter(entry => {
    const entryDate = new Date(entry.created_at)
    return entryDate >= startDate && entryDate <= endDate
  })
}

/**
 * processEntries
 * --------------
 * PURE function — no IO, no mutation, deterministic.
 * Extracts keywords and creates word clouds for different time periods
 */
export function processEntries(entries: VoiceEntry[]): ProcessedResult {
  // Calculate current date for time ranges
  const now = new Date()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
  
  // Get earliest and latest entry dates for all-time range
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const earliestDate = sortedEntries.length > 0 
    ? new Date(sortedEntries[0].created_at)
    : now
  
  // Filter entries by time periods
  const last7DaysEntries = filterEntriesByDate(entries, sevenDaysAgo, now)
  const last30DaysEntries = filterEntriesByDate(entries, thirtyDaysAgo, now)
  
  // Calculate word frequencies for each period
  const last7DaysFreq = calculateWordFrequencies(last7DaysEntries)
  const last30DaysFreq = calculateWordFrequencies(last30DaysEntries)
  const allTimeFreq = calculateWordFrequencies(entries)
  
  // Convert to word clouds
  const wordClouds = {
    last7Days: frequenciesToWordCloud(last7DaysFreq),
    last30Days: frequenciesToWordCloud(last30DaysFreq),
    allTime: frequenciesToWordCloud(allTimeFreq)
  }
  
  // Calculate tag frequencies (keeping original functionality)
  const tagFrequencies: Record<string, number> = {}
  for (const entry of entries) {
    for (const tag of entry.tags_user) {
      tagFrequencies[tag] = (tagFrequencies[tag] || 0) + 1
    }
  }
  
  return {
    summary: `Analysed ${entries.length} entries: ${last7DaysEntries.length} from last 7 days, ${last30DaysEntries.length} from last 30 days`,
    tagFrequencies,
    wordClouds,
    timeRanges: {
      last7Days: {
        start: sevenDaysAgo,
        end: now,
        entryCount: last7DaysEntries.length
      },
      last30Days: {
        start: thirtyDaysAgo,
        end: now,
        entryCount: last30DaysEntries.length
      },
      allTime: {
        start: earliestDate,
        end: now,
        entryCount: entries.length
      }
    }
  }
}

export default processEntries