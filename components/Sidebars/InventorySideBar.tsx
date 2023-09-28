import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

const InventorySideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span>Supply & Material Mgmt</span>
          </div>
        </li>
        <li>
            <Link href="/canvass" className={`app__menu_link ${currentRoute === '/canvass' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Price Canvassing</span>
            </Link>
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

export default InventorySideBar
