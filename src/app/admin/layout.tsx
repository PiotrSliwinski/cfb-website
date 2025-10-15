import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'Admin Panel - Clínica Ferreira Borges',
  description: 'Content management system',
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className={inter.className}>
      {children}
    </div>
  )
}
