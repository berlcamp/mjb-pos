'use client'

import { fetchSales } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, Title, Unauthorized, UserBlock, PosSideBar } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { SalesTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { format } from 'date-fns'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<SalesTypes[]>([])

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterCasher, setFilterCasher] = useState<string>('')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // summary
  const [soldProducts, setSoldProducts] = useState(0)
  const [totalSales, setTotalSales] = useState(0)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { session } = useSupabase()
  const { hasAccess } = useFilter()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchSales({ filterKeyword, filterStatus, filterDateFrom, filterDateTo, filterCasher }, perPageCount, 0)

      // update the list in redux
      dispatch(updateList(result.data))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: result.data.length, results: result.count ? result.count : 0 }))

      // summary
      const summary = await fetchSales({ filterKeyword, filterStatus, filterDateFrom, filterDateTo, filterCasher }, 99999, 0)
      const salesTotal = summary.data.reduce((accumulator, sale: SalesTypes) => accumulator + Number(sale.total), 0) // get the sum of total price
      setTotalSales(salesTotal)
      setSoldProducts(summary.count ? summary.count : 0)

      setLoading(false)
    } catch (e) {
      console.error(e)
    }
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchSales({ filterKeyword, filterStatus, filterDateFrom, filterDateTo, filterCasher }, perPageCount, list.length)

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: newList.length, results: result.count ? result.count : 0 }))

      setLoading(false)
    } catch (e) {
      console.error(e)
    }
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKeyword, perPageCount, filterDateFrom, filterDateTo, filterStatus, filterCasher])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

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
            <Title title='Products Sold'/>
          </div>

          {/* Filters */}
          <div className='app__filters'>
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterDateFrom={setFilterDateFrom}
              setFilterDateTo={setFilterDateTo}
              setFilterStatus={setFilterStatus}
              setFilterCasher={setFilterCasher}/>
          </div>

          {/* Totals */}
          <div className='px-4 pb-4 flex items-center justify-end space-x-2'>
            <div className='text-xs font-semibold bg-green-100 border border-green-400 px-2 py-px rounded-lg'>Sold Products: <span className='font-bold text-lg'>{soldProducts}</span></div>
            <div className='text-xs font-semibold bg-green-100 border border-green-400 px-2 py-px rounded-lg'>Total Sales: <span className='font-bold text-lg'>{totalSales}</span></div>
          </div>

          {/* Per Page */}
          <PerPage
            showingCount={resultsCounter.showing}
            resultsCount={resultsCounter.results}
            perPageCount={perPageCount}
            setPerPageCount={setPerPageCount}/>

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                  <tr>
                      <th className="hidden md:table-cell app__th_firstcol">
                          Product
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Date
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Price
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Quantity
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Total Amount
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Casher
                      </th>
                  </tr>
              </thead>
              <tbody>
                {
                  !isDataEmpty && list.map((item: SalesTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <th
                        className="app__th_firstcol">
                        {item.rdt_products.description}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>asdf</div>
                          </div>
                        </div>
                        {/* End - Mobile View */}

                      </th>

                      <td
                        className="hidden md:table-cell app__td">
                        {format(new Date(item.created_at), 'MMMM dd, yyyy HH:mm aaa')}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {item.unit_price}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {item.quantity}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {item.total}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        <UserBlock user={item.rdt_users}/>
                      </td>
                    </tr>
                  ))
                }
                { loading && <TableRowLoading cols={7} rows={2}/> }
              </tbody>
            </table>
            {
              (!loading && isDataEmpty) &&
                <div className='app__norecordsfound'>No records found.</div>
            }
          </div>

          {/* Show More */}
          {
            (resultsCounter.results > resultsCounter.showing && !loading) &&
              <ShowMore
                handleShowMore={handleShowMore}/>
          }
      </div>
    </div>
  </>
  )
}
export default Page
