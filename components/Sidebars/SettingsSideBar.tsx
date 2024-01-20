import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'
import { useSupabase } from '@/context/SupabaseProvider'

const SettingsSideBar = () => {
  const currentRoute = usePathname()

  const { session } = useSupabase()

  return (
    <>
      <div className='app__sidebar_header'>System Settings</div>
      <ul className="pt-4 mt-4 space-y-2 border-t border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span className='text-sm'>Permissions & Accounts</span>
          </div>
        </li>
        <li>
            <Link href="/settings/system" className={`app__menu_link ${currentRoute === '/settings/system' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">System Access</span>
            </Link>
        </li>
        <li>
            <Link href="/settings/accounts" className={`app__menu_link ${currentRoute === '/settings/accounts' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Login Accounts</span>
            </Link>
        </li>
        {
          session.user.email === 'berlcamp@gmail.com' &&
            <li>
              <Link href="/settings/errorlogs" className={`app__menu_link ${currentRoute === '/settings/errorlogs' ? 'app_menu_link_active' : ''}`}>
                <span className="flex-1 ml-3 whitespace-nowrap">Error Logs</span>
              </Link>
            </li>
        }
      </ul>
    </>
  )
}

export default SettingsSideBar
