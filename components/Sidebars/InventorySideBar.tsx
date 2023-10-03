import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Cog6ToothIcon, ListBulletIcon } from '@heroicons/react/20/solid'

const InventorySideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <ListBulletIcon className='w-4 h-4'/>
            <span>Supply & Material Mgmt</span>
          </div>
        </li>
        <li>
            <Link href="/canvass" className={`app__menu_link ${currentRoute.includes('canvass') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Price Canvass</span>
            </Link>
        </li>
        <li>
            <Link href="/suppliers" className={`app__menu_link ${currentRoute === '/suppliers' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Suppliers</span>
            </Link>
        </li>
        <li>
            <Link href="/purchaseorders" className={`app__menu_link ${currentRoute.includes('purchaseorders') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Purchase Orders</span>
            </Link>
        </li>
        <li>
            <Link href="/#" className={`app__menu_link ${currentRoute === '/#' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Inventory</span>
            </Link>
        </li>
      </ul>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span>Settings</span>
          </div>
        </li>
        <li>
        <Link href="/products" className={`app__menu_link ${currentRoute === '/products' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Products Masterlist</span>
            </Link>
        </li>
      </ul>
    </>
  )
}

export default InventorySideBar
