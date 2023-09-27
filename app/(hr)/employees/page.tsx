'use client'

import { fetchEmployees } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, EmployeesSideBar, Title, Unauthorized, CustomButton, DeleteModal } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { Employee } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import AddEditModal from './AddEditModal'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [approving, setApproving] = useState(false)
  const [list, setList] = useState<Employee[]>([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [editData, setEditData] = useState<Employee | null>(null)

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { session } = useSupabase()
  const { hasAccess, setToast } = useFilter()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchEmployees({ filterKeyword, filterStatus }, perPageCount, 0)

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
      const result = await fetchEmployees({ filterKeyword, filterStatus }, perPageCount, list.length)

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

  const handleEdit = (item: Employee) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleChangeStatus = async (item: Employee, status: string) => {
    try {
      // const { error } = await supabase
      //   .from('rdt_users')
      //   .update({ status })
      //   .eq('id', item.id)

      // if (error) throw new Error(error.message)

      // pop up the success message
      setToast('success', 'Successfully saved.')
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
  }, [filterKeyword, perPageCount, filterStatus])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('employee_accounts') && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <EmployeesSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title'>
            <Title title='Employees'/>
            <CustomButton
              containerStyles='app__btn_green'
              title='Add New Account'
              btnType='button'
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className='app__filters'>
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterStatus={setFilterStatus}/>
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
                          Name
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Status
                      </th>
                      <th></th>
                  </tr>
              </thead>
              <tbody>
                {
                  !isDataEmpty && list.map((item: Employee) => (
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
                                      <span>Edit</span>
                                    </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th
                        className="app__th_firstcol">
                        {item.firstname} {item.middlename} {item.lastname}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td">
                            {
                              item.status === 'Inactive'
                                ? <span className='app__status_container_red'>Expired</span>
                                : <span className='app__status_container_green'>Active</span>
                            }
                          </div>
                        </div>
                        <div>
                          <div className="md:hidden app__td">
                          {
                              item.status === 'Active' &&
                                <div className='flex items-center justify-start space-x-2'>
                                  <CustomButton
                                    containerStyles='app__btn_red'
                                    title='Mark as Inactive'
                                    btnType='button'
                                    handleClick={async () => await handleChangeStatus(item, 'Inactive')}
                                  />
                                </div>
                            }
                            {
                              item.status === 'Inactive' &&
                                <div className='flex items-center justify-start space-x-2'>
                                  <CustomButton
                                    containerStyles='app__btn_green'
                                    title='Mark as Active'
                                    btnType='button'
                                    handleClick={async () => await handleChangeStatus(item, 'Active')}
                                  />
                                </div>
                            }
                          </div>
                        </div>
                        {/* End - Mobile View */}

                      </th>
                      <td
                        className="hidden md:table-cell app__td">
                        {
                          item.status === 'Inactive'
                            ? <span className='app__status_container_red'>Expired</span>
                            : <span className='app__status_container_green'>Active</span>
                        }
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                          {
                            item.status === 'Active' &&
                              <div className='flex items-center justify-start space-x-2'>
                                <CustomButton
                                  containerStyles='app__btn_red'
                                  title='Mark as Inactive'
                                  btnType='button'
                                  handleClick={async () => await handleChangeStatus(item, 'Inactive')}
                                />
                              </div>
                          }
                          {
                            item.status === 'Inactive' &&
                              <div className='flex items-center justify-start space-x-2'>
                                <CustomButton
                                  containerStyles='app__btn_green'
                                  title='Mark as Active'
                                  btnType='button'
                                  handleClick={async () => await handleChangeStatus(item, 'Active')}
                                />
                              </div>
                          }
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
    {/* Add/Edit Modal */}
    {
      showAddModal && (
        <AddEditModal
          editData={editData}
          hideModal={() => setShowAddModal(false)}/>
      )
    }
  </>
  )
}
export default Page
