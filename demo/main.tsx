import { createRoot } from 'react-dom/client'
import Product from '../src/product/Product'
import '../src/index.css'
import './style.css'
import { installDemoTransport } from './transport'

const openingRoute = '#review/demo/weekend-poster'

function resetRoute() {
  history.replaceState(null, '', openingRoute)
}

if (!location.hash.startsWith('#review/demo')) resetRoute()
document.getElementById('demo-reset')?.addEventListener('click', () => {
  resetRoute()
  location.reload()
})

installDemoTransport()
createRoot(document.getElementById('root')!).render(<Product />)
