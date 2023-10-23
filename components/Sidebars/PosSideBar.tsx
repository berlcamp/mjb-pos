import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { Cog6ToothIcon, ComputerDesktopIcon, TruckIcon } from '@heroicons/react/20/solid'
import { useFilter } from '@/context/FilterContext'
import { superAdmins } from '@/constants'
import { useSupabase } from '@/context/SupabaseProvider'

const PosSideBar = () => {
  const currentRoute = usePathname()

  const { hasAccess } = useFilter()
  const { session } = useSupabase()

  return (
    <>
      <div className='app__sidebar_header'>Point of Sale</div>
      <ul className="pt-4 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <ComputerDesktopIcon className='w-4 h-4'/>
            <span className='text-sm'>Store</span>
          </div>
        </li>
        <li>
            <Link href="/casher" className={`app__menu_link ${currentRoute.includes('casher') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Casher</span>
            </Link>
        </li>
        <li>
            <Link href="/purchasetransactions" className={`app__menu_link ${currentRoute.includes('purchasetransactions') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Purchase Transactions</span>
            </Link>
        </li>
        <li>
            <Link href="/productssold" className={`app__menu_link ${currentRoute.includes('productssold') ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Products Sold</span>
            </Link>
        </li>
      </ul>
      {
        (hasAccess('manage_pos') || superAdmins.includes(session.user.email)) &&
          <>
            <ul className="pt-8 mt-4 space-y-2 border-gray-700">
              <li>
                <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
                  <TruckIcon className='w-4 h-4'/>
                  <span className='text-sm'>Inventory</span>
                </div>
              </li>
              <li>
                  <Link href="/products" className={`app__menu_link ${currentRoute === '/products' ? 'app_menu_link_active' : ''}`}>
                    <span className="flex-1 ml-3 whitespace-nowrap">Products</span>
                  </Link>
              </li>
              <li>
                  <Link href="/stocksmonitor" className={`app__menu_link ${currentRoute.includes('stocksmonitor') ? 'app_menu_link_active' : ''}`}>
                    <span className="flex-1 ml-3 whitespace-nowrap">Stocks Monitor</span>
                  </Link>
              </li>
              <li>
                  <Link href="/salesmonitor" className={`app__menu_link ${currentRoute.includes('salesmonitor') ? 'app_menu_link_active' : ''}`}>
                    <span className="flex-1 ml-3 whitespace-nowrap">Sales Monitor</span>
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
                <Link href="/productcategories" className={`app__menu_link ${currentRoute === '/productcategories' ? 'app_menu_link_active' : ''}`}>
                    <span className="flex-1 ml-3 whitespace-nowrap">Product Categories</span>
                  </Link>
              </li>
              <li>
                <Link href="/productunits" className={`app__menu_link ${currentRoute === '/productunits' ? 'app_menu_link_active' : ''}`}>
                    <span className="flex-1 ml-3 whitespace-nowrap">Product Units</span>
                  </Link>
              </li>
            </ul>
          </>
      }
    </>
  )
}

export default PosSideBar
