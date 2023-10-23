'use client'

import { EmployeesSideBar, Sidebar, Title, TopBar } from '@/components'
import React from 'react'

const Page: React.FC = () => {
  return (
    <>
    <Sidebar>
      <EmployeesSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
        <div className='app__title'>
          <Title title='Payroll'/>
        </div>

        {/* Main Content */}
        <div className='mx-4'>
          <div className='text-center mt-10'>Payroll is under development</div>
        </div>
      </div>
    </div>
  </>
  )
}
export default Page
