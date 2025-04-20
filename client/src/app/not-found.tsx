import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'
 
export default function NotFound() {
  return (
    <div className='text-center flex justify-center items-center flex-col'>
        <Image src="/404_Error.svg" width={500} height={400} alt="404" />
      <Link href="/">
      <Button>Return Home</Button>
      </Link>
    </div>
  )
}