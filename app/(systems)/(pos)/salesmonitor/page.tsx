'use client'

import React, { useEffect } from 'react'
import { PosSideBar, Sidebar, Title, TopBar, Unauthorized } from '@/components'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title as ChartTitle,
  Tooltip,
  Legend
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ChartTitle,
  Tooltip,
  Legend
)

const Page: React.FC = () => {
  const { session } = useSupabase()
  const { hasAccess } = useFilter()

  const data = {
    labels: ['January', 'February', 'March', 'April', 'May', 'January2', 'February2', 'March3', 'April4', 'May5'],
    datasets: [
      {
        label: 'Sample Data',
        data: [12, 19, 3, 5, 2, 200, 19, 3, 5, 2],
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1
      }
    ]
  }

  const options = {
    indexAxis: 'y' as const,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  useEffect(() => {
  }, [])

  // Check access from permission settings or Super Admins
  if (!(hasAccess('manage_pos') || hasAccess('cashers')) && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <PosSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
        <div className='app__title'>
          <Title title='Sales Monitor'/>
        </div>

        {/* Main Content */}
        <div className='mx-4'>
          <div><Bar data={data} options={options} /></div>
          <div className='text-center mt-10'>Sales Monitor is under development</div>
        </div>
      </div>
    </div>
  </>
  )
}
export default Page
