import '../src/index.css'

export const metadata = {
  title: 'Cloud Vault - Secure Cloud Storage',
  description: 'Secure cloud storage and backup solution',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
