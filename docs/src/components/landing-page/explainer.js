import React from 'react'
import { Highlight, themes } from 'prism-react-renderer'
import styles from './explainer.module.css'

const Explainer = ({ title, description, code }) => {
  return (
    <div className={styles.explainerWrapper}>
      <div className={styles.explainerText}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Highlight theme={themes.github} code={code} language="jsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div key={i} {...getLineProps({ line })}>
                {line.map((token, key) => (
                  <span key={key} {...getTokenProps({ token })} />
                ))}
              </div>
            ))}
          </pre>
        )}
      </Highlight>
    </div>
  )
}

export default Explainer
