'use client'

import { fetchAccounts } from '@/utils/fetchApi'
import React, { useEffect, useState } from 'react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, EmployeesSideBar, Title, Unauthorized, CustomButton, DeleteModal, UserBlock } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { AccountTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import AddEditModal from './AddEditModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<AccountTypes[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [editData, setEditData] = useState<AccountTypes | null>(null)

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { session, supabase } = useSupabase()
  const { hasAccess, setToast } = useFilter()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchAccounts({ filterKeyword, filterStatus }, perPageCount, 0)

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
      const result = await fetchAccounts({ filterKeyword, filterStatus }, perPageCount, list.length)

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

  const handleEdit = (item: AccountTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleChangeStatus = async (item: AccountTypes, status: string) => {
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
    if (Array.isArray(globallist)) {
      // Do not display self account
      const newList = globallist.filter((item: any) => item.id !== session.user.id)
      setList(newList)
    } else {
      setList(globallist)
    }
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKeyword, perPageCount, filterStatus])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('settings') && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <EmployeesSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title'>
            <Title title='Login Accounts'/>
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
                          Email
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Temporary Password
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Status
                      </th>
                      <th className="hidden md:table-cell app__th"></th>
                  </tr>
              </thead>
              <tbody>
                {
                  !isDataEmpty && list.map((item: any) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <td
                        className="w-6 pl-4 app__td">
                      </td>
                      <th className="app__th_firstcol">
                        <UserBlock user={item}/>
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td">
                            <span className='font-light'>Status: </span>
                            {
                              item.status === 'Inactive'
                                ? <span className='app__status_container_red'>Expired</span>
                                : <span className='app__status_container_green'>Active</span>
                            }
                          </div>
                        </div>
                        <div>
                          <div className="md:hidden app__td">
                            <span className='font-light'>Email: {item.email} </span>
                          </div>
                        </div>
                        <div>
                          <div className="md:hidden app__td">
                            {
                              item.status === 'Active' &&
                                <div className='flex items-center justify-start space-x-2'>
                                  <CustomButton
                                    containerStyles='app__btn_red'
                                    title='Deactivate this account'
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
                                    title='Activate his account'
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
                        <div>{item.email}</div>
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        <div>{item.temp_password}</div>
                      </td>
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
                                  title='Deactivate this account'
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
                                  title='Activate this account'
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
