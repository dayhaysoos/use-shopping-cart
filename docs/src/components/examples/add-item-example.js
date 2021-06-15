import React from 'react'
import { useDocsState } from '../../context'

function addItemExample() {
  const { framework } = useDocsState()
  if (framework === 'react') {
    return ```jsx
    Some React Code
    ```
  }

  if (framework === 'html+js') {
    return <code>Some html+js code</code>
  }
}

export default addItemExample
