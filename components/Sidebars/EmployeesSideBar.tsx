import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { BanknotesIcon, UserGroupIcon } from '@heroicons/react/20/solid'

const EmployeesSideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <div className='app__sidebar_header'>Human Resource</div>
      <ul className="pt-4 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <UserGroupIcon className='w-4 h-4'/>
            <span className='text-sm'>Human Resource</span>
          </div>
        </li>
        <li>
            <Link href="/employees" className={`app__menu_link ${currentRoute === '/employees' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Employees</span>
            </Link>
        </li>
        <li>
            <Link href="/departments" className={`app__menu_link ${currentRoute === '/departments' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Departments</span>
            </Link>
        </li>
      </ul>
      <ul className="pt-4 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <BanknotesIcon className='w-4 h-4'/>
            <span className='text-sm'>Payroll</span>
          </div>
        </li>
        <li>
            <Link href="/payroll" className={`app__menu_link ${currentRoute === '/payroll' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Payroll</span>
            </Link>
        </li>
        {/* <li>
            <Link href="/fixeddeductions" className={`app__menu_link ${currentRoute === '/fixeddeductions' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Fixed Deductions</span>
            </Link>
        </li> */}
        <li>
            <Link href="/cashadvances" className={`app__menu_link ${currentRoute === '/cashadvances' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Cash Advances (CA)</span>
            </Link>
        </li>
      </ul>
    </>
  )
}

export default EmployeesSideBar
