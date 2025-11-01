import { describe, it, expect } from 'vitest'
import {
  formatCurrencyString,
  calculateFormattedTotalPrice
} from './formatters'

describe('formatCurrencyString', () => {
  it('formats USD correctly', () => {
    const result = formatCurrencyString({
      value: 1000,
      currency: 'USD',
      language: 'en-US'
    })
    expect(result).toBe('$10.00')
  })

  it('formats zero-decimal currency correctly (JPY)', () => {
    const result = formatCurrencyString({
      value: 1000,
      currency: 'JPY',
      language: 'ja-JP'
    })
    // Currency symbol may vary by system (¥ or ￥)
    expect(result).toMatch(/[¥￥]1,000/)
  })

  it('formats EUR correctly', () => {
    const result = formatCurrencyString({
      value: 2599,
      currency: 'EUR',
      language: 'de-DE'
    })
    // Format may vary by system, but should contain the amount
    expect(result).toContain('25,99')
    expect(result).toContain('€')
  })

  it('formats GBP correctly', () => {
    const result = formatCurrencyString({
      value: 1234,
      currency: 'GBP',
      language: 'en-GB'
    })
    expect(result).toBe('£12.34')
  })

  it('handles zero value', () => {
    const result = formatCurrencyString({
      value: 0,
      currency: 'USD',
      language: 'en-US'
    })
    expect(result).toBe('$0.00')
  })
})

describe('calculateFormattedTotalPrice', () => {
  it('calculates and formats total price', () => {
    const result = calculateFormattedTotalPrice(1000, 'USD', 'en-US')
    expect(result).toBe('$10.00')
  })

  it('works with different currencies', () => {
    const result = calculateFormattedTotalPrice(5000, 'EUR', 'de-DE')
    expect(result).toContain('50,00')
    expect(result).toContain('€')
  })
})
