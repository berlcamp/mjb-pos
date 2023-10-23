import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Cog6ToothIcon, ListBulletIcon } from '@heroicons/react/20/solid'

const SupplySideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <div className='app__sidebar_header'>Canvass and Purchasing</div>
      <ul className="pt-4 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <ListBulletIcon className='w-4 h-4'/>
            <span className='text-sm'>Price Canvass & P.O.</span>
          </div>
        </li>
        <li>
            <Link href="/canvass" className={`app__menu_link ${currentRoute.includes('canvass') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Price Canvass</span>
            </Link>
        </li>

        <li>
            <Link href="/purchaseorders" className={`app__menu_link ${currentRoute.includes('purchaseorders') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Purchase Orders</span>
            </Link>
        </li>
      </ul>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span className='text-sm'>Settings</span>
          </div>
        </li>
        <li>
            <Link href="/suppliers" className={`app__menu_link ${currentRoute === '/suppliers' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Suppliers</span>
            </Link>
        </li>
      </ul>
    </>
  )
}

export default SupplySideBar
