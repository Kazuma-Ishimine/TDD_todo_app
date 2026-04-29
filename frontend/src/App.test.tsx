import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderWithProviders } from './test/renderWithProviders'
import App from './App'

describe('App', () => {
  it('when rendered, then shows the app list page with Create App button', async () => {
    renderWithProviders(<App />)
    expect(
      await screen.findByRole('button', { name: /create app/i }),
    ).toBeInTheDocument()
  })
})
