import * as React from 'react'
import { render, screen, findByRole, getByRole } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import { act } from '@testing-library/react-hooks'
import { DebugCart } from '../index'
import { createWrapper, expectedInitialCartState } from './testHelpers'

describe('<DebugCart>', () => {
  beforeEach(() => {
    const Wrapper = createWrapper()
    act(() => {
      render(
        <Wrapper>
          <DebugCart />
        </Wrapper>
      )
      return undefined
    })
  })

  it('should make a table of properties and values from the cart', async () => {
    const { cartDetails, ...remainingState } = expectedInitialCartState
    // console.log(cartDetails)
    const tableElement = await screen.findByRole('table')
    expect(tableElement).toBeVisible()
    const cartDetailsCell = await screen.findByRole('cell', {
      name: 'cartDetails'
    })
    expect(cartDetailsCell).toBeVisible()

    const logButton = await findByRole(
      cartDetailsCell.parentElement,
      'button',
      { name: /log value/i }
    )
    expect(logButton).toBeVisible()

    for (const property in remainingState) {
      const keyCell = await screen.findByRole('cell', { name: property })
      const valueCell = await getByRole(keyCell.parentElement, 'cell', {
        name: JSON.stringify(remainingState[property])
      })

      expect(keyCell).toBeVisible()
      expect(valueCell).toBeVisible()
    }
  })
})
