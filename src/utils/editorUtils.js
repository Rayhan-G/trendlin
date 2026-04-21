// src/utils/editorUtils.js

export const extractPlainText = (html) => {
  if (!html) return ''
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim()
}

export const calculateWordCount = (html) => {
  const text = extractPlainText(html)
  if (!text) return 0
  return text.trim().split(/\s+/).filter(w => w.length > 0).length
}

export const calculateReadingTime = (html) => {
  const words = calculateWordCount(html)
  const wordsPerMinute = 200
  return Math.max(1, Math.ceil(words / wordsPerMinute))
}

export const generateExcerpt = (html, maxLength = 160) => {
  const text = extractPlainText(html)
  if (!text) return ''
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength).trim() + '...'
}

export const generateSlug = (title) => {
  if (!title) return ''
  return title.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export const estimateSeoScore = (html, title) => {
  let score = 100
  const wordCount = calculateWordCount(html)
  
  if (!title || title.length === 0) score -= 25
  if (wordCount < 300) score -= 15
  if (wordCount < 600) score -= 5
  if (!html.includes('<h1')) score -= 15
  if (!html.includes('<img')) score -= 10
  if (!html.includes('<a')) score -= 10
  
  return Math.max(0, Math.min(100, score))
}

export const calculateReadabilityScore = (html) => {
  const text = extractPlainText(html)
  const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
  const words = text.match(/\b\w+\b/g) || []
  
  if (words.length === 0 || sentences.length === 0) {
    return { score: 0, level: 'No content', grade: 0 }
  }
  
  const countSyllables = (word) => {
    word = word.toLowerCase()
    if (word.length <= 3) return 1
    const sylCount = word.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, '')
      .replace(/^y/, '')
      .match(/[aeiouy]{1,2}/g)?.length || 1
    return Math.max(1, sylCount)
  }
  
  const syllables = words.reduce((count, word) => count + countSyllables(word), 0)
  const avgWordsPerSentence = words.length / sentences.length
  const avgSyllablesPerWord = syllables / words.length
  
  const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)))
  
  let level = 'College'
  if (clampedScore >= 90) level = '5th Grade'
  else if (clampedScore >= 80) level = '6th Grade'
  else if (clampedScore >= 70) level = '7th Grade'
  else if (clampedScore >= 60) level = '8th-9th Grade'
  else if (clampedScore >= 50) level = '10th-12th Grade'
  
  return { score: clampedScore, level, grade: 0 }
}

export const getReadabilityColor = (score) => {
  if (score >= 80) return 'green'
  if (score >= 60) return 'blue'
  if (score >= 40) return 'yellow'
  if (score >= 20) return 'orange'
  return 'red'
}

export const calculateCharacterCount = (html) => {
  const text = extractPlainText(html)
  return text.length
}

export default {
  extractPlainText,
  calculateWordCount,
  calculateReadingTime,
  generateExcerpt,
  generateSlug,
  estimateSeoScore,
  calculateReadabilityScore,
  getReadabilityColor,
  calculateCharacterCount
}