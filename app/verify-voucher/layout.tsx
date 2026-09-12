import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Official Hotel Voucher Verification | Flying Wonders DMC',
  description: 'Official digital verification portal for hotel accommodation vouchers issued by Flying Wonders Travel DMC for visa application and hotel check-in.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function VerifyVoucherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
