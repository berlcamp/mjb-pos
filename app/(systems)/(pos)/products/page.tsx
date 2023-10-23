'use client'

import { fetchProducts } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, Title, Unauthorized, CustomButton, UserBlock, ConfirmModal, PosSideBar } from '@/components'
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
import AddEditModal from './AddEditModal'
import { ChevronDownIcon, PencilSquareIcon } from '@heroicons/react/20/solid'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<ProductTypes[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmInactiveModal, setShowConfirmInactiveModal] = useState(false)
  const [showConfirmActiveModal, setShowConfirmActiveModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [editData, setEditData] = useState<ProductTypes | null>(null)

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

  const handleAdd = () => {
    setShowAddModal(true)
    setEditData(null)
  }

  const handleEdit = (item: ProductTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleInactive = (id: string) => {
    setSelectedId(id)
    setShowConfirmInactiveModal(true)
  }

  const handleActive = (id: string) => {
    setSelectedId(id)
    setShowConfirmActiveModal(true)
  }

  const handleInactiveConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('rdt_products')
        .update({ status: 'Archived' })
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // Update data in redux
      const items = [...globallist]
      const updatedList = items.filter(item => item.id !== selectedId)
      dispatch(updateList(updatedList))

      // pop up the success message
      setToast('success', 'Successfully saved.')
      setShowConfirmInactiveModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleActiveConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('rdt_products')
        .update({ status: 'Active' })
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // Update data in redux
      const items = [...globallist]
      const updatedList = items.filter(item => item.id !== selectedId)
      dispatch(updateList(updatedList))

      // pop up the success message
      setToast('success', 'Successfully saved.')
      setShowConfirmActiveModal(false)
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
  if (!hasAccess('manage_pos') && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <PosSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title'>
            <Title title='Products'/>
            <CustomButton
              containerStyles='app__btn_green'
              title='Add New Product'
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
                          Product
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Category
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Unit
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Price
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Available Stocks
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
                                <Menu.Item>
                                  <div className='app__dropdown_item2'>
                                  {
                                    item.status === 'Active' &&
                                        <CustomButton
                                          containerStyles='app__btn_orange_xs'
                                          title='Move to archived'
                                          btnType='button'
                                          handleClick={() => handleInactive(item.id)}
                                        />
                                  }
                                  {
                                    item.status === 'Archived' &&
                                        <CustomButton
                                          containerStyles='app__btn_green_xs'
                                          title='Mark as Active'
                                          btnType='button'
                                          handleClick={() => handleActive(item.id)}
                                        />
                                  }
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th
                        className="app__th_firstcol">
                        {item.description}
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
                        {item.rdt_product_units?.name}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {item.price}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {item.available_stocks}
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
                { loading && <TableRowLoading cols={8} rows={2}/> }
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
    {/* Confirm (Inactive) Modal */}
    {
      showConfirmInactiveModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleInactiveConfirmed}
          onCancel={() => setShowConfirmInactiveModal(false)}
        />
      )
    }
    {/* Confirm (Active) Modal */}
    {
      showConfirmActiveModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleActiveConfirmed}
          onCancel={() => setShowConfirmActiveModal(false)}
        />
      )
    }
  </>
  )
}
export default Page
