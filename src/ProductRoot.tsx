import { lazy, Suspense } from 'react'
import Product from './product/Product'
const Guide = lazy(() => import('./App'))
export default function ProductRoot() {
  return (
    <Suspense fallback={<main className="p-loading">Byturn</main>}>
      {new URLSearchParams(location.search).has('guide') ? <Guide /> : <Product />}
    </Suspense>
  )
}
