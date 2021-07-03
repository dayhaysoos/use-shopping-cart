/* eslint-disable no-unused-expressions */
/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
import {
  validateCartItems,
  formatLineItems,
  ValidatedItem,
  LineItem
} from '../utilities/serverless.js'

const line_items1: ValidatedItem[] = validateCartItems(
  [
    {
      name: 'Bananas',
      description: 'Yummy yellow fruit',
      id: 'id_banana001',
      price: 400,
      currency: 'USD',
      image: 'https://my-image.com/banana.jpg'
    }
  ],
  {
    id_GBJ2Ep8246qeeT: {
      name: 'Bananas',
      id: 'id_GBJ2Ep8246qeeT',
      price: 400,
      image: 'https://my-image.com/banana.jpg',
      currency: 'USD',
      quantity: 10,
      value: 4000,
      formattedValue: '$40.00'
    }
  }
)
line_items1[0].price_data
line_items1[0].price_data.currency
line_items1[0].price_data.product_data
line_items1[0].price_data.product_data.name
line_items1[0].price_data.product_data.random_key
line_items1[0].price_data.unit_amount
line_items1[0].price_data.random_key
line_items1[0].quantity

const line_items2: LineItem[] = formatLineItems({
  id_GBJ2Ep8246qeeT: {
    name: 'Bananas',
    id: 'id_GBJ2Ep8246qeeT',
    price: 400,
    image: 'https://my-image.com/banana.jpg',
    currency: 'USD',
    quantity: 10,
    value: 4000,
    formattedValue: '$40.00'
  }
})
line_items2[0].price
line_items2[0].quantity
