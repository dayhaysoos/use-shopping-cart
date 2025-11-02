import React from 'react'
import clsx from 'clsx'
import useBaseUrl from '@docusaurus/useBaseUrl'
import styles from './feature.module.css'

const Feature = ({ imageUrl, title, description }) => {
  const imgUrl = useBaseUrl(imageUrl)
  return (
    <div className={clsx('col col--4')}>
      {imgUrl && (
        <div className={clsx('text--center')}>
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  )
}

export default Feature
