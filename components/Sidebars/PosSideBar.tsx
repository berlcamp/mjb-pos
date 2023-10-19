import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Cog6ToothIcon, ListBulletIcon } from '@heroicons/react/20/solid'

const PosSideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <ListBulletIcon className='w-4 h-4'/>
            <span>POS</span>
          </div>
        </li>
        <li>
            <Link href="/casher" className={`app__menu_link ${currentRoute.includes('casher') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Customer Orders</span>
            </Link>
        </li>
        <li>
            <Link href="/purchasereport" className={`app__menu_link ${currentRoute.includes('purchasereport') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Purchase Report</span>
            </Link>
        </li>
        <li>
            <Link href="/productprices" className={`app__menu_link ${currentRoute === '/productprices' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Products Prices</span>
            </Link>
        </li>
      </ul>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span>Reports</span>
          </div>
        </li>
        <li>
            <Link href="/stocksmonitor" className={`app__menu_link ${currentRoute.includes('stocksmonitor') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Stocks Monitor</span>
            </Link>
        </li>
        <li>
            <Link href="/sales" className={`app__menu_link ${currentRoute.includes('sales') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Sales</span>
            </Link>
        </li>
      </ul>
    </>
  )
}

export default PosSideBar
