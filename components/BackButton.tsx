import { ArrowLeftCircleIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const BackButton = ({ url, title }: { url: string, title: string }) => {
  return (
    <div className='app__title flex-1 text-2xl text-gray-700 text-left dark:text-gray-300'>
      <div className='flex items-start space-x-1 app__btn_blue'>
        <ArrowLeftCircleIcon className='w-4 h-4'/>
        <Link href={url}>{ title }</Link>
      </div>
    </div>
  )
}

export default BackButton
