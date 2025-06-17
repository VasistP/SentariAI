import { mockVoiceEntries } from './mockData'
import processEntries from './sampleFunction'

console.log('🚀 Running Word Cloud Analysis...\n')

// Process the entries
const result = processEntries(mockVoiceEntries)

// Display summary
console.log('📊 Summary:')
console.log(result.summary)
console.log('\n')

// Display tag frequencies
console.log('🏷️  Tag Frequencies:')
console.table(result.tagFrequencies)
console.log('\n')

// Display time ranges
console.log('📅 Time Ranges:')
console.log(`Last 7 days: ${result.timeRanges.last7Days.entryCount} entries`)
console.log(`Last 30 days: ${result.timeRanges.last30Days.entryCount} entries`)
console.log(`All time: ${result.timeRanges.allTime.entryCount} entries`)
console.log('\n')

// Display word clouds
console.log('☁️  Word Cloud - Last 7 Days:')
if (result.wordClouds.last7Days.length > 0) {
  console.table(result.wordClouds.last7Days.slice(0, 10).map(item => ({
    word: item.text,
    frequency: item.value,
    percentage: `${item.percentage?.toFixed(1)}%`
  })))
} else {
  console.log('No entries in the last 7 days')
}
console.log('\n')

console.log('☁️  Word Cloud - Last 30 Days:')
if (result.wordClouds.last30Days.length > 0) {
  console.table(result.wordClouds.last30Days.slice(0, 10).map(item => ({
    word: item.text,
    frequency: item.value,
    percentage: `${item.percentage?.toFixed(1)}%`
  })))
} else {
  console.log('No entries in the last 30 days')
}
console.log('\n')

console.log('☁️  Word Cloud - All Time (Top 20):')
console.table(result.wordClouds.allTime.slice(0, 20).map(item => ({
  word: item.text,
  frequency: item.value,
  percentage: `${item.percentage?.toFixed(1)}%`
})))

// Display full JSON output (optional)
console.log('\n Full Result (JSON):')
console.log(JSON.stringify(result, null, 2))