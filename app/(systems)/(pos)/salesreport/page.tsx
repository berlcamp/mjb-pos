'use client'
import { PosSideBar, Sidebar, Title, TopBar } from '@/components'
import { useSupabase } from '@/context/SupabaseProvider'
import { format, subDays } from 'date-fns'
import { useEffect, useState } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const SummaryReport = () => {
  const { supabase } = useSupabase()

  // Default date range: Last 7 days until today
  const [fromDate, setFromDate] = useState(
    format(subDays(new Date(), 7), 'yyyy-MM-dd')
  )
  const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Holds summary data per day
  const [summaryData, setSummaryData] = useState<
    {
      date: string
      totalSales: number
      totalProfit: number
      totalDiscounts: number
      totalCost: number
    }[]
  >([])

  const fetchSummaryReport = async () => {
    if (!fromDate || !toDate) return

    const { data, error } = await supabase.rpc('get_summary_report', {
      from_date: fromDate,
      to_date: toDate, // Ensure this includes today
    })

    if (error) {
      console.error('Error fetching summary report:', error)
      return
    }

    // Ensure all values are set to 0 if undefined
    const formattedData =
      data?.map((entry: any) => ({
        date: entry.date,
        totalSales: entry.totalSales ?? 0,
        totalProfit: entry.totalProfit ?? 0,
        totalDiscounts: entry.totalDiscounts ?? 0,
        totalCost: entry.totalCost ?? 0,
      })) || []

    setSummaryData(formattedData)
  }

  useEffect(() => {
    fetchSummaryReport()
  }, [fromDate, toDate])

  // Aggregate total values for display
  const totalDiscounts = summaryData.reduce(
    (sum, d) => sum + d.totalDiscounts,
    0
  )
  const totalCost = summaryData.reduce((sum, d) => sum + d.totalCost, 0)
  const totalSales = summaryData.reduce((sum, d) => sum + d.totalSales, 0)
  const totalProfit = summaryData.reduce((sum, d) => sum + d.totalProfit, 0)

  return (
    <>
      <Sidebar>
        <PosSideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main p-6">
        <div className="app__title">
          <Title title="Sales Report" />
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Summary Report</h2>
          <div className="flex gap-4 mb-6">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">From:</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="border rounded p-2"
              />
            </label>
            <label className="flex flex-col">
              <span className="text-sm text-gray-600">To:</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="border rounded p-2"
              />
            </label>
            <button
              onClick={fetchSummaryReport}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Generate Report
            </button>
          </div>

          {/* Summary Figures */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mb-6">
            {[
              {
                label: 'Total Discounts',
                value: totalDiscounts,
                color: 'text-red-500',
              },
              { label: 'Total Cost', value: totalCost, color: 'text-blue-500' },
              {
                label: 'Total Sales',
                value: totalSales,
                color: 'text-green-500',
              },
              {
                label: 'Total Profit',
                value: totalProfit,
                color: 'text-yellow-500',
              },
            ].map((item, index) => (
              <div
                key={index}
                className={`p-4 bg-gray-100 rounded-xl shadow-md ${item.color}`}>
                <p className="text-lg font-semibold">{item.label}</p>
                <p className="text-2xl font-bold">
                  ₱{item.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Bar Chart */}
          <div className="w-full h-96">
            <ResponsiveContainer
              width="100%"
              height="100%">
              <BarChart data={summaryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="totalSales"
                  fill="#36A2EB"
                  name="Total Sales"
                />
                <Bar
                  dataKey="totalProfit"
                  fill="#4BC0C0"
                  name="Total Profit"
                />
                <Bar
                  dataKey="totalDiscounts"
                  fill="#FF6384"
                  name="Total Discounts"
                />
                <Bar
                  dataKey="totalCost"
                  fill="#FFCE56"
                  name="Total Cost"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  )
}

export default SummaryReport
