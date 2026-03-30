import { GolfScore } from '@/types'

/**
 * DRAW ENGINE
 * Generates 5 winning numbers (1-45) using either random or algorithmic approach.
 * Algorithmic: weighted by frequency of user scores (less frequent = higher weight, creating surprise)
 */

export function generateRandomDraw(): number[] {
  const numbers: number[] = []
  while (numbers.length < 5) {
    const num = Math.floor(Math.random() * 45) + 1
    if (!numbers.includes(num)) numbers.push(num)
  }
  return numbers.sort((a, b) => a - b)
}

export function generateAlgorithmicDraw(allScores: { score: number }[]): number[] {
  // Count frequency of each score
  const frequency: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) frequency[i] = 0
  allScores.forEach(s => { frequency[s.score] = (frequency[s.score] || 0) + 1 })

  // Inverse frequency weighting: less common scores get higher weight
  const maxFreq = Math.max(...Object.values(frequency)) + 1
  const weights: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) {
    weights[i] = maxFreq - frequency[i]
  }

  const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0)
  const numbers: number[] = []

  while (numbers.length < 5) {
    let rand = Math.random() * totalWeight
    for (let i = 1; i <= 45; i++) {
      if (numbers.includes(i)) continue
      rand -= weights[i]
      if (rand <= 0) {
        numbers.push(i)
        break
      }
    }
  }

  return numbers.sort((a, b) => a - b)
}

export function checkMatch(userScores: number[], winningNumbers: number[]): 0 | 3 | 4 | 5 {
  const matches = userScores.filter(s => winningNumbers.includes(s)).length
  if (matches >= 5) return 5
  if (matches === 4) return 4
  if (matches === 3) return 3
  return 0
}

export function calculatePrizePools(
  activeSubscriberCount: number,
  jackpotRollover: number = 0,
  monthlyContributionPerUser: number = 500 // £5 in pence
) {
  const totalPool = activeSubscriberCount * monthlyContributionPerUser + jackpotRollover
  return {
    total: totalPool,
    fiveMatch: Math.floor(totalPool * 0.40), // 40%
    fourMatch: Math.floor(totalPool * 0.35), // 35%
    threeMatch: Math.floor(totalPool * 0.25), // 25%
  }
}

export function formatCurrency(pence: number): string {
  return `£${(pence / 100).toFixed(2)}`
}
