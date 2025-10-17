'use client'

import { AIChat } from './AIChat'

export function AdminClientWrapper({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <AIChat />
    </>
  )
}
