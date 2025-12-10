import './globals.css';
import { AuthProvider } from '../context/AuthContext';
import LayoutWrapper from '../components/LayoutWrapper';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://annapurnahospital.com';
const defaultTitle = 'Annapurna Holistic Hospital – Nakkhu';
const defaultDescription =
  'Holistic healthcare, Ayurvedic treatments, physiotherapy, retreat packages, expert doctors.';
const ogImage = `${siteUrl}/og-image.jpg`;

export const metadata = {
  title: defaultTitle,
  description: defaultDescription,
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: defaultTitle,
    description: defaultDescription,
    url: siteUrl,
    siteName: 'Annapurna Holistic Hospital',
    images: [ogImage],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImage],
  },
};

const orgSchema = {
  '@context': 'https://schema.org',
  '@type': 'Hospital',
  name: 'Annapurna Holistic Hospital',
  address: 'Nakkhu, Lalitpur, Nepal',
  url: siteUrl,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
      </body>
    </html>
  );
}
