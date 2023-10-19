'use client'
import { PosSideBar, Sidebar, TopBar } from '@/components'

const Page: React.FC = () => {
  return (
    <>
    <Sidebar>
      <PosSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div className='flex items-center justify-center space-x-2 mx-2'>
        <div className='w-2/3'>
          <div className='w-full bg-cyan-900 p-2'>
            <span className='text-white'>Purchase</span>
          </div>
        </div>
        <div className='w-1/3'>
          <div className='w-full bg-green-600 p-2'>
            <span className='text-white'>Total</span>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
export default Page
