import React, { useContext, useReducer, createContext } from 'react'

const docsInitialState = { framework: 'react' }

function docsReducer(state, action) {
  switch (action.type) {
    case 'react':
      return {
        ...state,
        framework: 'react'
      }
    case 'html+js':
      return {
        ...state,
        framework: 'html+js'
      }

    case 'vue':
      return {
        ...state,
        framework: 'vue'
      }
    default:
      return state
  }
}

const DocsContext = createContext({ framework: 'react' })

export function DocsProvider({ children }) {
  const [docsState, dispatch] = useReducer(docsReducer, docsInitialState)

  return (
    <DocsContext.Provider value={{ docsState, dispatch }}>
      {children}
    </DocsContext.Provider>
  )
}

export const useDocsState = () => {
  const { docsState, dispatch } = useContext(DocsContext)

  const { framework } = docsState

  function updateDocsFramework(framework) {
    dispatch({ type: framework })
  }

  return {
    framework,
    updateDocsFramework
  }
}
