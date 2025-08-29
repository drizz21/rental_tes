import './globals.css'

export const metadata = {
  title: 'Rino Rental Sorong - Sewa Mobil Terpercaya',
  description: 'Layanan sewa mobil terpercaya di Sorong dengan harga terjangkau. Pilihan lengkap kendaraan untuk kebutuhan harian, bulanan, dengan atau tanpa sopir.',
  keywords: 'sewa mobil sorong, rental mobil sorong, sewa kendaraan, rental car sorong'
}

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  )
}