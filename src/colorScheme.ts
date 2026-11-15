export const productThemeKey = 'byturn-theme'

export function readProductTheme(): 'light' | 'dark' {
  try {
    return localStorage.getItem(productThemeKey) === 'light' ? 'light' : 'dark'
  } catch {
    return 'dark'
  }
}

export function applyColorScheme(theme: 'light' | 'dark') {
  document.documentElement.dataset.theme = theme
  document.querySelector('meta[name="color-scheme"]')?.setAttribute('content', theme)
}
