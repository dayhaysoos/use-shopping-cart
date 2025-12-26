import { isClient } from '../utilities/SSR'
import type { FormatCurrencyStringOptions } from './types'

// Cache for Intl.NumberFormat instances to avoid expensive recreation
const formatterCache = new Map<string, Intl.NumberFormat>()

// Cache for zero-decimal currency detection
const zeroDecimalCache = new Map<string, boolean>()

function getFormatter(currency: string, language: string): Intl.NumberFormat {
  const key = `${currency}:${language}`
  let formatter = formatterCache.get(key)

  if (!formatter) {
    formatter = new Intl.NumberFormat(language, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol'
    })
    formatterCache.set(key, formatter)
  }

  return formatter
}

function isZeroDecimalCurrency(
  formatter: Intl.NumberFormat,
  currency: string,
  language: string
): boolean {
  const key = `${currency}:${language}`
  let isZeroDecimal = zeroDecimalCache.get(key)

  if (isZeroDecimal === undefined) {
    const parts = formatter.formatToParts(1)
    isZeroDecimal = !parts.some((part) => part.type === 'decimal')
    zeroDecimalCache.set(key, isZeroDecimal)
  }

  return isZeroDecimal
}

export function formatCurrencyString({
  value,
  currency,
  language = isClient ? navigator.language : 'en-US'
}: FormatCurrencyStringOptions): string {
  const formatter = getFormatter(currency, language)
  const zeroDecimalCurrency = isZeroDecimalCurrency(
    formatter,
    currency,
    language
  )

  const adjustedValue = zeroDecimalCurrency
    ? value
    : parseFloat((value / 100).toFixed(2))

  return formatter.format(adjustedValue)
}

export function calculateFormattedTotalPrice(
  totalPrice: number,
  currency: string,
  language: string
): string {
  return formatCurrencyString({ value: totalPrice, currency, language })
}
