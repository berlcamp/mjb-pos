'use client'

import { fetchProducts } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, Title, Unauthorized, UserBlock, PosSideBar } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { ProductTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<ProductTypes[]>([])

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterCasher, setFilterCasher] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { session } = useSupabase()
  const { hasAccess } = useFilter()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchProducts({ filterKeyword, filterStatus }, perPageCount, 0)

      // update the list in redux
      dispatch(updateList(result.data))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: result.data.length, results: result.count ? result.count : 0 }))
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
      const result = await fetchProducts({ filterKeyword, filterStatus }, perPageCount, list.length)

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

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKeyword, perPageCount, filterDate, filterStatus, filterCasher])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('inventory') && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <PosSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title'>
            <Title title='Purchase Report'/>
          </div>

          {/* Filters */}
          <div className='app__filters'>
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterDate={setFilterDate}
              setFilterStatus={setFilterStatus}
              setFilterCasher={setFilterCasher}/>
          </div>

          {/* Totals */}
          <div className='px-4 pb-4 flex items-center justify-end space-x-2'>
            <div className='app__status_container_green'>Sold Products: <span className='font-bold'>150.75</span></div>
            <div className='app__status_container_green'>Total Sales: <span className='font-bold'>200.50</span></div>
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
                          Category
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Status
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Added By
                      </th>
                  </tr>
              </thead>
              <tbody>
                {
                  !isDataEmpty && list.map((item: ProductTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <th
                        className="app__th_firstcol">
                        {item.name}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>
                            {
                              item.status === 'Archived'
                                ? <span className='app__status_container_red'>Archived</span>
                                : <span className='app__status_container_green'>Active</span>
                            }
                            </div>
                          </div>
                        </div>
                        {/* End - Mobile View */}

                      </th>

                      <td
                        className="hidden md:table-cell app__td">
                        {item.rdt_product_categories?.name}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {
                          item.status === 'Archived'
                            ? <span className='app__status_container_red'>Archived</span>
                            : <span className='app__status_container_green'>Active</span>
                        }
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        <UserBlock user={item.rdt_users}/>
                      </td>
                    </tr>
                  ))
                }
                { loading && <TableRowLoading cols={5} rows={2}/> }
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
