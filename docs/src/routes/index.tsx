import { createFileRoute, Link } from '@tanstack/react-router'
import { HomeLayout } from 'fumadocs-ui/layouts/home'
import { baseOptions } from '@/lib/layout.shared'
import { CartButton } from '@/components/CartButton'

export const Route = createFileRoute('/')({
  component: Home
})

function Home() {
  return (
    <>
      <HomeLayout
        {...baseOptions()}
        className="text-center py-32 justify-center"
      >
        <h1 className="font-medium text-xl mb-4">
          Welcome to use-shopping-cart!
        </h1>
        <Link
          to="/docs/$"
          params={{
            _splat: ''
          }}
          className="px-3 py-2 rounded-lg bg-fd-primary text-fd-primary-foreground font-medium text-sm mx-auto"
        >
          Open Docs
        </Link>
      </HomeLayout>
      <div className="fixed top-4 right-4 z-50">
        <CartButton />
      </div>
    </>
  )
}
