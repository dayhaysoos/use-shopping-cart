import React from 'react'
import Highlight, { defaultProps } from 'prism-react-renderer'
import styles from './explainer.module.css'

const Explainer = ({ title, description, code }) => {
  return (
    <div className={styles.explainerWrapper}>
      <div className={styles.explainerText}>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
      <Highlight {...defaultProps} code={code} language="jsx">
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre className={className} style={style}>
            {tokens.map((line, i) => (
              <div {...getLineProps({ line, key: i })}>
                {line.map((token, key) => (
                  <span {...getTokenProps({ token, key })} />
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
