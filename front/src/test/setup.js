import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Deja cada prueba aislada de las demás
afterEach(() => {
  cleanup()
  localStorage.clear()
  vi.restoreAllMocks()
})
