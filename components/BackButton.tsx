import { ArrowLeftIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const BackButton = ({ url, title }: { url: string, title: string }) => {
  return (
    <div className='flex items-start text-2xl text-gray-700 text-left space-x-1 app__btn_blue'>
      <ArrowLeftIcon className='w-4 h-4'/>
      <Link href={url}>{ title }</Link>
    </div>
  )
}

export default BackButton
