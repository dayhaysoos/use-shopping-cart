module.exports = {
  docs: [
    {
      type: 'category',
      label: 'Welcome',
      collapsed: false,
      items: [
        'welcome/introduction',
        'welcome/getting-started',
        'welcome/getting-started-client-mode',
        'welcome/getting-started-serverless',
        'welcome/getting-started-with-typescript',
        'welcome/discord',
        'welcome/contributors'
      ]
    },
    {
      type: 'category',
      label: 'Usage',
      collapsed: false,
      items: [
        {
          type: 'category',
          label: 'Components',
          collapsed: false,
          items: [
            'usage/components/cart-provider',
            'usage/components/debug-cart'
          ]
        },
        {
          type: 'category',
          label: 'Properties',
          collapsed: false,
          items: [
            'usage/properties/cart-details',
            'usage/properties/cart-count',
            'usage/properties/total-price',
            'usage/properties/formatted-total-price',
            'usage/properties/should-display-cart',
            'usage/properties/last-clicked'
          ]
        },
        {
          type: 'category',
          label: 'Actions',
          collapsed: false,
          items: [
            'usage/actions/add-item',
            'usage/actions/remove-item',
            'usage/actions/increment-item',
            'usage/actions/decrement-item',
            'usage/actions/set-item-quantity',
            'usage/actions/load-cart',
            'usage/actions/clear-cart',
            'usage/actions/handle-cart-click',
            'usage/actions/handle-cart-hover',
            'usage/actions/handle-close-cart',
            'usage/actions/store-last-clicked',
            'usage/actions/redirect-to-checkout',
            'usage/actions/checkout-single-item'
          ]
        },
        {
          type: 'category',
          label: 'Configuration',
          collapsed: false,
          items: ['usage/configuration/shouldPersist']
        },
        {
          type: 'category',
          label: 'Client-Side Helpers',
          collapsed: false,
          items: [
            'usage/helpers/format-currency-string',
            'usage/helpers/filter-cart'
          ]
        },
        {
          type: 'category',
          label: 'Server-Side Helpers',
          collapsed: false,
          items: [
            'usage/serverless/validate-cart-items',
            'usage/serverless/format-line-items'
          ]
        }
      ]
    }
  ]
}
