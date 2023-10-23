'use client'
import { Cog6ToothIcon, ComputerDesktopIcon, ListBulletIcon, UsersIcon } from '@heroicons/react/20/solid'
import Link from 'next/link'

const MainMenu: React.FC = () => {
  return (
    <div className="py-1 relative">
      <div className='px-6 mt-2 text-gray-700 text-xl font-semibold'>Menu</div>
      <div className='px-4 py-2 overflow-y-auto h-[calc(100vh-170px)]'>
        <div className='lg:flex lg:space-x-2 lg:space-y-0 space-y-2 justify-center lg:flex-row-reverse'>
          <div className='px-2 py-4 lg:w-96 border text-gray-600 rounded-lg bg-white shadow-md flex flex-col space-y-2'>
            {/* <div className='text-gray-700 text-lg font-semibold'>RDM</div> */}
            <Link href='/employees'>
              <div className='app__menu_item'>
                <div className='pt-1'>
                  <UsersIcon className='w-8 h-8'/>
                </div>
                <div>
                  <div className='app__menu_item_label'>Human Resource</div>
                  <div className='app__menu_item_label_description'>Employees, Payroll.</div>
                </div>
              </div>
            </Link>
            <Link href='/canvass'>
              <div className='app__menu_item'>
                <div className='pt-1'>
                  <ListBulletIcon className='w-8 h-8'/>
                </div>
                <div>
                  <div className='app__menu_item_label'>Canvass and Purchasing</div>
                  <div className='app__menu_item_label_description'>Canvass, Purchase Orders. </div>
                </div>
              </div>
            </Link>
            <Link href='/casher'>
              <div className='app__menu_item'>
                <div className='pt-1'>
                  <ComputerDesktopIcon className='w-8 h-8'/>
                </div>
                <div>
                  <div className='app__menu_item_label'>Point of Sale</div>
                  <div className='app__menu_item_label_description'>Sales and Product Inventory.</div>
                </div>
              </div>
            </Link>
            {/* <Link href='/projects'>
              <div className='app__menu_item'>
                <div className='pt-1'>
                  <FolderIcon className='w-8 h-8'/>
                </div>
                <div>
                  <div className='app__menu_item_label'>Projects</div>
                  <div className='app__menu_item_label_description'>Projects and Location Management.</div>
                </div>
              </div>
            </Link> */}
            <div className='pt-4'>
              <hr/>
            </div>
            <div className='text-gray-700 text-lg font-semibold'>Settings</div>
            <Link href='/settings/system'>
              <div className='app__menu_item'>
                <div className='pt-1'>
                  <Cog6ToothIcon className='w-8 h-8'/>
                </div>
                <div>
                  <div className='app__menu_item_label'>System Settings</div>
                  <div className='app__menu_item_label_description'>System Permissions, Login Accounts. </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
export default MainMenu
