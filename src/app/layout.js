// app/layout.js
export const metadata = {
  title: 'Trendlin',
  description: 'Your content platform',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}