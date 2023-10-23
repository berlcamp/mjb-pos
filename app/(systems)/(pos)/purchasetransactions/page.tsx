'use client'

import { fetchSaleTransactions } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, Title, Unauthorized, UserBlock, PosSideBar } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { SalesTypes, TransactionTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, TruckIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import ProductsModal from './ProductsModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<TransactionTypes[]>([])

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterCasher, setFilterCasher] = useState<string>('')
  const [filterDateFrom, setFilterDateFrom] = useState<string>('')
  const [filterDateTo, setFilterDateTo] = useState<string>('')

  const [showProductsModal, setShowProductsModal] = useState(false)
  const [sales, setSales] = useState<SalesTypes[] | []>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // summary
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
      const result = await fetchSaleTransactions({ filterKeyword, filterStatus, filterDateFrom, filterDateTo, filterCasher }, perPageCount, 0)

      // update the list in redux
      dispatch(updateList(result.data))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: result.data.length, results: result.count ? result.count : 0 }))

      // summary
      const summary = await fetchSaleTransactions({ filterKeyword, filterStatus, filterDateFrom, filterDateTo, filterCasher }, 99999, 0)
      const salesTotal = summary.data.reduce((accumulator, sale: SalesTypes) => accumulator + Number(sale.total), 0) // get the sum of total price
      setTotalSales(salesTotal)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchSaleTransactions({ filterKeyword, filterStatus, filterDateFrom, filterDateTo, filterCasher }, perPageCount, list.length)

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: newList.length, results: result.count ? result.count : 0 }))
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // view purchased products in modal
  const handleViewSales = (sales: SalesTypes[]) => {
    setSales(sales)
    setShowProductsModal(true)
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
            <Title title='Purchase Transactions'/>
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
                      <th className="hidden md:table-cell app__th pl-4"></th>
                      <th className="hidden md:table-cell app__th_firstcol">
                          Customer
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Date
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Cash
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Change
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
                  !isDataEmpty && list.map((item: TransactionTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <td
                        className="w-6 pl-4 app__td">
                        <Menu as="div" className="app__menu_container">
                          <div>
                            <Menu.Button className="app__dropdown_btn">
                              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="app__dropdown_items">
                              <div className="py-1">
                                <Menu.Item>
                                  <div
                                      onClick={() => handleViewSales(item.rdt_sales)}
                                      className='app__dropdown_item'
                                    >
                                      <TruckIcon className='w-4 h-4'/>
                                      <span>View Products Purchased</span>
                                    </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th
                        className="app__th_firstcol">
                        {item.customer_name}
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
                        {item.cash}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {Number(item.cash) - Number(item.total)}
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
    {/* Add/Edit Modal */}
    {
      showProductsModal && (
        <ProductsModal
          sales={sales}
          hideModal={() => setShowProductsModal(false)}/>
      )
    }
  </>
  )
}
export default Page
