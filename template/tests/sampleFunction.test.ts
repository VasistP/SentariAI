// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-expect-error vitest types are provided via tsconfig "types"
import { describe, it, expect } from 'vitest'
import { mockVoiceEntries } from '../src/lib/mockData.ts'
import processEntries from '../src/lib/sampleFunction.js'

// describe('processEntries', () => {
//   it('counts reflection tag correctly', () => {
//     const result = processEntries(mockVoiceEntries)
//     expect(result.tagFrequencies.reflection).toBe(mockVoiceEntries.length)
//   })
// }) 

// eslint-disable-next-line import/no-extraneous-dependencies
// @ts-expect-error vitest types are provided via tsconfig "types"
import { describe, it, expect, beforeEach } from 'vitest'
// import { mockVoiceEntries } from '../src/lib/mockData.js'
// import processEntries from '../src/lib/sampleFunction.js'
import { VoiceEntry } from '../src/lib/types.js'

describe('processEntries', () => {
  it('counts reflection tag correctly', () => {
    // Create mock entries with reflection tag
    const mockEntries: VoiceEntry[] = [
      {
        id: '1',
        user_id: 'user1',
        audio_url: null,
        transcript_raw: 'Reflecting on my day',
        transcript_user: 'Reflecting on my day',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['reflection'],
        category: 'personal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        emotion_score_score: 0.5,
        embedding: null
      },
      {
        id: '2',
        user_id: 'user1',
        audio_url: null,
        transcript_raw: 'Another reflection',
        transcript_user: 'Another reflection',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['reflection'],
        category: 'personal',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        emotion_score_score: 0.5,
        embedding: null
      }
    ]
    
    const result = processEntries(mockEntries)
    expect(result.tagFrequencies.reflection).toBe(2)
  })
})

describe('processEntries - Word Cloud Feature', () => {
  let mockEntries: VoiceEntry[]
  const now = new Date()
  
  beforeEach(() => {
    // Create mock entries with different timestamps
    mockEntries = [
      // Entry from 3 days ago
      {
        id: '1',
        user_id: 'user1',
        audio_url: null,
        transcript_raw: 'Today I went running in the park. Running makes me feel happy and healthy.',
        transcript_user: 'Today I went running in the park. Running makes me feel happy and healthy.',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['exercise', 'wellness'],
        category: 'health',
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        emotion_score_score: 0.8,
        embedding: null
      },
      // Entry from 10 days ago
      {
        id: '2',
        user_id: 'user1',
        audio_url: null,
        transcript_raw: 'Work project completed successfully. Team collaboration was excellent.',
        transcript_user: 'Work project completed successfully. Team collaboration was excellent.',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['work', 'success'],
        category: 'professional',
        created_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        emotion_score_score: 0.9,
        embedding: null
      },
      // Entry from 40 days ago
      {
        id: '3',
        user_id: 'user1',
        audio_url: null,
        transcript_raw: 'Started learning piano. Music brings joy to my life.',
        transcript_user: 'Started learning piano. Music brings joy to my life.',
        language_detected: 'en',
        language_rendered: 'en',
        tags_model: [],
        tags_user: ['music', 'learning'],
        category: 'personal',
        created_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 40 * 24 * 60 * 60 * 1000).toISOString(),
        emotion_score_score: 0.7,
        embedding: null
      }
    ]
  })
  
  describe('Basic functionality', () => {
    it('processes entries and returns correct structure', () => {
      const result = processEntries(mockEntries)
      
      expect(result).toHaveProperty('summary')
      expect(result).toHaveProperty('tagFrequencies')
      expect(result).toHaveProperty('wordClouds')
      expect(result).toHaveProperty('timeRanges')
    })
    
    it('counts tag frequencies correctly', () => {
      const result = processEntries(mockEntries)
      
      expect(result.tagFrequencies).toEqual({
        'exercise': 1,
        'wellness': 1,
        'work': 1,
        'success': 1,
        'music': 1,
        'learning': 1
      })
    })
  })
  
  describe('Word cloud generation', () => {
    it('generates word clouds for all time periods', () => {
      const result = processEntries(mockEntries)
      
      expect(result.wordClouds).toHaveProperty('last7Days')
      expect(result.wordClouds).toHaveProperty('last30Days')
      expect(result.wordClouds).toHaveProperty('allTime')
      
      // Each should be an array
      expect(Array.isArray(result.wordClouds.last7Days)).toBe(true)
      expect(Array.isArray(result.wordClouds.last30Days)).toBe(true)
      expect(Array.isArray(result.wordClouds.allTime)).toBe(true)
    })
    
    it('filters entries correctly by time period', () => {
      const result = processEntries(mockEntries)
      
      // Last 7 days should only include the entry from 3 days ago
      expect(result.timeRanges.last7Days.entryCount).toBe(1)
      
      // Last 30 days should include entries from 3 and 10 days ago
      expect(result.timeRanges.last30Days.entryCount).toBe(2)
      
      // All time should include all entries
      expect(result.timeRanges.allTime.entryCount).toBe(3)
    })
    
    it('extracts keywords correctly excluding stop words', () => {
      const result = processEntries(mockEntries)
      
      // Check that common words like "the", "I", "to" are filtered out
      const allKeywords = result.wordClouds.allTime.map(item => item.text)
      
      expect(allKeywords).toContain('running')
      expect(allKeywords).toContain('park')
      expect(allKeywords).toContain('happy')
      expect(allKeywords).not.toContain('the')
      expect(allKeywords).not.toContain('i')
      expect(allKeywords).not.toContain('to')
    })
    
    it('includes tag keywords in word cloud', () => {
      const result = processEntries(mockEntries)
      
      const allKeywords = result.wordClouds.allTime.map(item => item.text)
      
      expect(allKeywords).toContain('exercise')
      expect(allKeywords).toContain('wellness')
      expect(allKeywords).toContain('music')
    })
    
    it('calculates word frequencies correctly', () => {
      const result = processEntries(mockEntries)
      
      // "running" appears twice in the first entry
      const runningItem = result.wordClouds.allTime.find(item => item.text === 'running')
      expect(runningItem?.value).toBe(2)
    })
    
    it('calculates percentages correctly', () => {
      const result = processEntries(mockEntries)
      
      // Check that percentages add up to 100 (or close due to rounding)
      const totalPercentage = result.wordClouds.allTime
        .reduce((sum, item) => sum + (item.percentage || 0), 0)
      
      expect(totalPercentage).toBeCloseTo(100, 1)
    })
  })
  
  describe('Edge cases', () => {
    it('handles empty entries array', () => {
      const result = processEntries([])
      
      expect(result.summary).toContain('0 entries')
      expect(result.wordClouds.last7Days).toEqual([])
      expect(result.wordClouds.last30Days).toEqual([])
      expect(result.wordClouds.allTime).toEqual([])
    })
    
    it('handles entries with empty transcripts', () => {
      const emptyEntries: VoiceEntry[] = [{
        ...mockEntries[0],
        transcript_user: '',
        tags_user: []
      }]
      
      const result = processEntries(emptyEntries)
      expect(result.wordClouds.allTime).toEqual([])
    })
    
    it('handles entries with special characters', () => {
      const specialEntries: VoiceEntry[] = [{
        ...mockEntries[0],
        transcript_user: 'Hello!!! How are you??? I\'m doing great... #awesome @friend',
        tags_user: []
      }]
      
      const result = processEntries(specialEntries)
      const keywords = result.wordClouds.allTime.map(item => item.text)
      
      expect(keywords).toContain('hello')
      expect(keywords).toContain('doing')
      expect(keywords).toContain('great')
      expect(keywords).toContain('awesome')
      expect(keywords).toContain('friend')
    })
    
    it('filters out numbers and very short words', () => {
      const numberEntries: VoiceEntry[] = [{
        ...mockEntries[0],
        transcript_user: 'I am 25 years old. My id is 12345. Go to LA.',
        tags_user: []
      }]
      
      const result = processEntries(numberEntries)
      const keywords = result.wordClouds.allTime.map(item => item.text)
      
      expect(keywords).toContain('years')
      expect(keywords).toContain('old')
      expect(keywords).not.toContain('25')
      expect(keywords).not.toContain('12345')
      expect(keywords).not.toContain('am') // Stop word
      expect(keywords).not.toContain('la') // Too short
    })
  })
  
  describe('Time range calculations', () => {
    it('calculates correct time ranges', () => {
      const result = processEntries(mockEntries)
      
      // Check that time ranges are set correctly
      const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000
      
      const last7DaysRange = result.timeRanges.last7Days
      const timeDiff7 = last7DaysRange.end.getTime() - last7DaysRange.start.getTime()
      expect(timeDiff7).toBeCloseTo(sevenDaysInMs, -3) // Close to 7 days
      
      const last30DaysRange = result.timeRanges.last30Days
      const timeDiff30 = last30DaysRange.end.getTime() - last30DaysRange.start.getTime()
      expect(timeDiff30).toBeCloseTo(thirtyDaysInMs, -3) // Close to 30 days
    })
    
    it('handles entries all from same day', () => {
      const sameDayEntries = mockEntries.map(entry => ({
        ...entry,
        created_at: now.toISOString(),
        updated_at: now.toISOString()
      }))
      
      const result = processEntries(sameDayEntries)
      
      expect(result.timeRanges.last7Days.entryCount).toBe(3)
      expect(result.timeRanges.last30Days.entryCount).toBe(3)
      expect(result.timeRanges.allTime.entryCount).toBe(3)
    })
  })
  
  describe('Summary generation', () => {
    it('generates accurate summary', () => {
      const result = processEntries(mockEntries)
      
      expect(result.summary).toContain('Analysed 3 entries')
      expect(result.summary).toContain('1 from last 7 days')
      expect(result.summary).toContain('2 from last 30 days')
    })
  })
})