import type { HTMLAttributes, PropsWithChildren, ReactNode } from 'react'

type Alignment = 'start' | 'center'

function cx(...classes: Array<string | false | undefined | null>) {
  return classes.filter(Boolean).join(' ')
}

export function Section({
  id,
  className,
  children
}: PropsWithChildren<{ id?: string } & HTMLAttributes<HTMLElement>>) {
  return (
    <section
      id={id}
      className={cx(
        'relative py-(--section-spacing,clamp(4rem,8vw,8rem))',
        className
      )}
    >
      {children}
    </section>
  )
}

export function Container({
  className,
  children
}: PropsWithChildren<HTMLAttributes<HTMLDivElement>>) {
  return (
    <div className={cx('mx-auto w-full max-w-7xl px-6 lg:px-10', className)}>
      {children}
    </div>
  )
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = 'start',
  kicker
}: {
  eyebrow?: ReactNode
  title: ReactNode
  description?: ReactNode
  kicker?: ReactNode
  align?: Alignment
}) {
  const alignment =
    align === 'center' ? 'items-center text-center' : 'items-start text-left'

  return (
    <div className={cx('flex flex-col gap-4', alignment)}>
      {eyebrow ? (
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-fd-primary">
          {eyebrow}
        </p>
      ) : null}
      <div className="space-y-4">
        <h2 className="text-3xl font-semibold tracking-tight text-[#0b1124] dark:text-white sm:text-4xl">
          {title}
        </h2>
        {description ? (
          <p className="text-base text-neutral-700 dark:text-white/70 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
      {kicker ? (
        <div className="text-sm text-neutral-600 dark:text-white/70">
          {kicker}
        </div>
      ) : null}
    </div>
  )
}
