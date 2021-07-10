/**
 * Returns the constructor name of any value.
 * @param {any} value
 * @returns string
 */
export function typeOf(value) {
  if (value === undefined) return 'undefined'
  if (value === null) return 'null'
  return value.constructor.name
}

export class PropertyValueError extends Error {
  constructor({ property, method, expected, received }) {
    const plural = Array.isArray(expected)
    const expectedString = plural
      ? `are ${expected.map((v) => JSON.stringify(v)).join(', ')}`
      : `is ${JSON.stringify(expected)}`
    const methodString = typeof method === 'string' ? ` in ${method}()` : ''
    super(
      `Invalid value ${JSON.stringify(
        received
      )} was received for ${property}. Valid ${
        plural ? 'values' : 'value'
      } for ${property}${methodString} ${expectedString}.`
    )
    this.name = 'PropertyValueError'
  }
}

export class PropertyTypeError extends TypeError {
  constructor({ property, expected, received }) {
    const plural = Array.isArray(expected)
    const expectedString = plural
      ? `are ${expected.map((v) => JSON.stringify(v)).join(', ')}`
      : `is ${JSON.stringify(expected)}`
    super(
      `Invalid value with type ${JSON.stringify(
        received
      )} was received for ${property}. Valid ${
        plural ? 'types' : 'type'
      } for ${property} ${expectedString}.`
    )
    this.name = 'PropertyTypeError'
  }
}

export class PropertyRangeError extends RangeError {
  constructor({ property, between, below, above, received }) {
    let expectedString
    if (Array.isArray(between))
      expectedString = `between ${between[0]} and ${between[1]}`
    else if (['string', 'number'].includes(typeof below))
      expectedString = `below ${below}`
    else if (['string', 'number'].includes(typeof above))
      expectedString = `above ${above}`

    super(
      `Invalid value ${JSON.stringify(
        received
      )} was received for ${property}. Valid range for ${property} is ${expectedString}.`
    )
    this.name = 'PropertyRangeError'
  }
}
