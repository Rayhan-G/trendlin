import Navbar from './Navbar'
import Footer from './Footer'
import Script from 'next/script'

export default function Layout({ children }) {
  return (
    <>
      <Navbar />

      <main>{children}</main>

      <Footer />

      {/* Google Analytics */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-65N96ZRWYM"
        strategy="afterInteractive"
      />

      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-65N96ZRWYM');
        `}
      </Script>
    </>
  )
}