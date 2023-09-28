import { Cog6ToothIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'
import React from 'react'
import { usePathname } from 'next/navigation'

const ProjectsSideBar = () => {
  const currentRoute = usePathname()

  return (
    <>
      <ul className="pt-8 mt-4 space-y-2 border-gray-700">
        <li>
          <div className='flex items-center text-gray-500 items-centers space-x-1 px-2'>
            <Cog6ToothIcon className='w-4 h-4'/>
            <span>Projects & Location</span>
          </div>
        </li>
        <li>
            <Link href="/projects" className={`app__menu_link ${currentRoute === '/projects' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Projects</span>
            </Link>
        </li>
        <li>
            <Link href="/locations" className={`app__menu_link ${currentRoute === '/locations' ? 'app_menu_link_active' : ''}`}>
              <span className="flex-1 ml-3 whitespace-nowrap">Project Locations</span>
            </Link>
        </li>
      </ul>
    </>
  )
}

export default ProjectsSideBar
