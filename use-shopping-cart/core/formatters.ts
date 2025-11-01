import { isClient } from '../utilities/SSR'
import type { FormatCurrencyStringOptions } from './types'

export function formatCurrencyString({
  value,
  currency,
  language = isClient ? navigator.language : 'en-US'
}: FormatCurrencyStringOptions): string {
  const numberFormat = new Intl.NumberFormat(language, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol'
  })

  const parts = numberFormat.formatToParts(value)
  let zeroDecimalCurrency = true

  for (const part of parts) {
    if (part.type === 'decimal') {
      zeroDecimalCurrency = false
      break
    }
  }

  const adjustedValue = zeroDecimalCurrency
    ? value
    : parseFloat((value / 100).toFixed(2))

  return numberFormat.format(adjustedValue)
}

export function calculateFormattedTotalPrice(
  totalPrice: number,
  currency: string,
  language: string
): string {
  return formatCurrencyString({ value: totalPrice, currency, language })
}
