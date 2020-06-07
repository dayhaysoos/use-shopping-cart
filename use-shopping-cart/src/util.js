import { useStorageReducer } from 'react-storage-hooks'

export const isClient = typeof window === 'object'

export const formatCurrencyString = ({
  value,
  currency,
  language = isClient ? navigator.language : 'en-US'
}) => {
  value = parseInt(value)
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

  value = zeroDecimalCurrency ? value : value / 100
  return numberFormat.format(value.toFixed(2))
}

export function useLocalStorageReducer(key, reducer, initialState) {
  const dummyStorage = {
    getItem() {
      return null
    },
    setItem() {},
    removeItem() {}
  }
  return useStorageReducer(
    isClient ? window.localStorage : dummyStorage,
    key,
    reducer,
    initialState
  )
}

export const getCheckoutData = {
  stripe(cart) {
    const lineItems = []
    for (const sku in cart.cartDetails)
      lineItems.push({ price: sku, quantity: cart.cartDetails[sku].quantity })

    const options = {
      mode: 'payment',
      lineItems,
      successUrl: cart.successUrl,
      cancelUrl: cart.cancelUrl,
      billingAddressCollection: cart.billingAddressCollection
        ? 'required'
        : 'auto',
      submitType: 'auto'
    }

    if (cart.allowedCountries?.length) {
      options.shippingAddressCollection = {
        allowedCountries: cart.allowedCountries
      }
    }

    return options
  }
}

export function checkoutHandler(cart, checkoutOptions) {
  let serviceProperty = ''
  if (cart.stripe) serviceProperty = 'stripe'

  const needsCheckoutData = cart.mode === 'client-only'

  return async function (parameters) {
    if (!serviceProperty) {
      throw new Error(
        'No compatible API has been defined, your options are: Stripe'
      )
    }

    if (!checkoutOptions.modes.includes(cart.mode)) {
      throw new Error(
        `Invalid checkout mode '${
          cart.mode
        }' was chosen. The valid modes are ${new Intl.ListFormat().format(
          checkoutOptions.modes
        )}.`
      )
    }

    let options = { sessionId: parameters?.sessionId }
    if (needsCheckoutData) options = getCheckoutData.stripe(cart)

    const { error } = await checkoutOptions[serviceProperty](
      await cart[serviceProperty],
      options,
      parameters
    )
    if (error) return error
  }
}
