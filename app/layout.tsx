import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '交互式显示',
  description: '带有实时时钟和自定义文本显示的交互式应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh">
      <body>{children}</body>
    </html>
  )
}