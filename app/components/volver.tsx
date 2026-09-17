import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function Volver({ href }: { href: string }) {
  return (
    <Link href={href} className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-[#5b6b64] hover:text-[#3e6fa8]">
      <ChevronLeft size={16} />
      Volver
    </Link>
  )
}