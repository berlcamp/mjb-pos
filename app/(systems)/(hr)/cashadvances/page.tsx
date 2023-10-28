'use client'

import { fetchCashAdvances } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, EmployeesSideBar, Title, Unauthorized, CustomButton, DeleteModal, UserBlock } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { CashAdvanceTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import AddEditModal from './AddEditModal'
import { ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<CashAdvanceTypes[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [editData, setEditData] = useState<CashAdvanceTypes | null>(null)

  const [filterKeyword, setFilterKeyword] = useState<string>('')

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
      const result = await fetchCashAdvances({ filterKeyword }, perPageCount, 0)

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
      const result = await fetchCashAdvances({ filterKeyword }, perPageCount, list.length)

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

  const handleAdd = () => {
    setShowAddModal(true)
    setEditData(null)
  }

  const handleEdit = (item: CashAdvanceTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowDeleteModal(true)
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
  }, [filterKeyword, perPageCount])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('human_resource') && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <EmployeesSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title'>
            <Title title='Cash Advances'/>
            <CustomButton
              containerStyles='app__btn_green'
              title='Add New C.A.'
              btnType='button'
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className='app__filters'>
            <Filters
              setFilterKeyword={setFilterKeyword}/>
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
                      <th className="hidden md:table-cell app__th">
                          Employee
                      </th>
                      <th className="hidden md:table-cell app__th">
                          C.A. Amount
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Added By
                      </th>
                  </tr>
              </thead>
              <tbody>
                {
                  !isDataEmpty && list.map((item: CashAdvanceTypes) => (
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
                                      onClick={() => handleEdit(item)}
                                      className='app__dropdown_item'
                                    >
                                      <PencilSquareIcon className='w-4 h-4'/>
                                      <span>Edit Details</span>
                                    </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                      onClick={ () => handleDelete(item.id) }
                                      className='app__dropdown_item'
                                    >
                                      <TrashIcon className='w-4 h-4'/>
                                      <span>Delete</span>
                                    </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th
                        className="app__th_firstcol">
                        {item.rdt_employees?.firstname} {item.rdt_employees?.middlename} {item.rdt_employees?.lastname}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>Amount:  { item.amount }</div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>
                      <td
                        className="hidden md:table-cell app__td">
                        { item.amount }
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        <UserBlock user={item.rdt_users}/>
                      </td>
                    </tr>
                  ))
                }
                { loading && <TableRowLoading cols={4} rows={2}/> }
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
      showAddModal && (
        <AddEditModal
          editData={editData}
          hideModal={() => setShowAddModal(false)}/>
      )
    }
    {/* Delete Modal */}
    {
      showDeleteModal && (
        <DeleteModal
          id={selectedId}
          table='rdt_cash_advances'
          hideModal={() => setShowDeleteModal(false)}/>
      )
    }
  </>
  )
}
export default Page
