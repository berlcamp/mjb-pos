import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

const EmployeesSideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span>Human Resource</span>
          </div>
        </li>
        <li>
            <Link href="/employees" className={`app__menu_link ${currentRoute === '/employees' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Employees</span>
            </Link>
        </li>
        <li>
            <Link href="/accounts" className={`app__menu_link ${currentRoute === '/accounts' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Login Accounts</span>
            </Link>
        </li>
      </ul>
    </>
  )
}

export default EmployeesSideBar
