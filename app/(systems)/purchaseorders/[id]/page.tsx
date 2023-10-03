'use client'
import React, { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import { Sidebar, TopBar, Title, Unauthorized, CustomButton, InventorySideBar, BackButton, Remarks, ConfirmModal } from '@/components'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import AddEditModal from './AddEditModal'
// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'

// Types
import type { PurchaseOrderItemTypes, PurchaseOrderTypes } from '@/types'

import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import { ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'

export default function Page ({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<PurchaseOrderItemTypes[]>([])
  const [selectedId, setSelectedId] = useState<string>('')
  const [purchaseOrder, setPurchaseOrder] = useState<PurchaseOrderTypes | null>(null)
  const [status, setStatus] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const [showConfirmApproveModal, setShowConfirmApproveModal] = useState(false)
  const [showConfirmUnapproveModal, setShowConfirmUnapproveModal] = useState(false)
  const [editData, setEditData] = useState<PurchaseOrderItemTypes | null>(null)

  const { session, supabase } = useSupabase()
  const { hasAccess, setToast } = useFilter()

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('rdt_purchase_order_items')
        .select('*, rdt_products(id, name)')
        .eq('purchase_order_id', params.id)
        .order('id', { ascending: false })

      if (error) throw new Error(error.message)

      const { data: po, error: error2 } = await supabase
        .from('rdt_purchase_orders')
        .select('*, rdt_suppliers(name)')
        .eq('id', params.id)
        .single()

      if (error2) throw new Error(error2.message)

      setPurchaseOrder(po)
      setStatus(po.status)
      dispatch(updateList(data))
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

  const handleEdit = (item: PurchaseOrderItemTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowConfirmDeleteModal(true)
  }

  const handleDeleteConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('rdt_purchase_order_items')
        .delete()
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // add to logs
      const item = list.find(item => item.id === selectedId)
      const { error: logError } = await supabase
        .from('rdt_remarks')
        .insert({
          reference_id: params.id,
          type: 'purchase_order',
          reply_type: 'system',
          message: `Removed an item "${item?.rdt_products?.name}"`,
          sender_id: session.user.id
        })
      if (logError) throw new Error(logError.message)

      // Update data in redux
      const currentItems = [...globallist]
      const updatedList = currentItems.filter(item => item.id !== selectedId)
      dispatch(updateList(updatedList))

      setShowConfirmDeleteModal(false)
    } catch (err) {
      console.error(err)
    }
  }

  const handleApprove = () => {
    setShowConfirmApproveModal(true)
  }
  const handleUnapprove = () => {
    setShowConfirmUnapproveModal(true)
  }

  const handleApproveConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('rdt_purchase_orders')
        .update({
          status: 'Approved'
        })
        .eq('id', params.id)

      if (error) throw new Error(error.message)

      // add to logs
      const { error: logError } = await supabase
        .from('rdt_remarks')
        .insert({
          reference_id: params.id,
          type: 'purchased_order',
          reply_type: 'system',
          message: 'Approved this',
          sender_id: session.user.id
        })
      if (logError) throw new Error(logError.message)

      // pop up the success message
      setToast('success', 'Successfully approved.')

      setShowConfirmApproveModal(false)
      setStatus('Approved')
    } catch (e) {
      console.error(e)
    }
  }

  const handleUnapproveConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('rdt_purchase_orders')
        .update({
          status: 'Pending approval'
        })
        .eq('id', params.id)

      if (error) throw new Error(error.message)

      // add to logs
      const { error: logError } = await supabase
        .from('rdt_remarks')
        .insert({
          reference_id: params.id,
          type: 'purchased_order',
          reply_type: 'system',
          message: 'Unapproved this',
          sender_id: session.user.id
        })
      if (logError) throw new Error(logError.message)

      // pop up the success message
      setToast('success', 'Successfully unapproved.')

      setShowConfirmUnapproveModal(false)
      setStatus('Pending approval')
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
  }, [])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('inventory') && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  // is Approver?
  const isApprover = hasAccess('approve_price_canvass')

  return (
    <>
    <Sidebar>
      <InventorySideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title flex'>
            <BackButton title='Back to Purchase Orders' url='/purchaseorders'/>
            {
              (isApprover && status === 'Pending approval') &&
                <CustomButton
                  btnType='button'
                  title='Approve'
                  handleClick={handleApprove}
                  containerStyles="app__btn_green"
                />
            }
            {
              (isApprover && status === 'Approved') &&
                <CustomButton
                  btnType='button'
                  title='Unapproved'
                  handleClick={handleUnapprove}
                  containerStyles="app__btn_red"
                />
            }
          </div>
          <div className='app__title'>
            <Title title={purchaseOrder ? 'PO #: ' + purchaseOrder.po_number : ''}/>
            {
              status !== 'Approved' &&
                <CustomButton
                  containerStyles='app__btn_green'
                  title='Add Product'
                  btnType='button'
                  handleClick={handleAdd}
                />
            }
          </div>

          <div className='flex items-center space-x-1 px-4 pt-4'>
            <span className='text-sm font-medium text-gray-600'>Description:</span>
            <span className='text-sm font-bold text-gray-600'>{purchaseOrder ? purchaseOrder.description : ''}</span>
          </div>
          <div className='flex items-center space-x-1 px-4 pt-4'>
            <span className='text-sm font-medium text-gray-600'>Supplier:</span>
            <span className='text-sm font-bold text-gray-600'>{purchaseOrder ? purchaseOrder.rdt_suppliers.name : ''}</span>
          </div>
          <div className='flex items-center space-x-1 px-4 py-4'>
            <span className='text-sm font-medium text-gray-600'>Status:</span>
            {
              status === 'Pending approval'
                ? <span className='app__status_container_orange text-xs'>{status}</span>
                : <span className='app__status_container_green text-xs'>{status}</span>
            }
          </div>

          {/* Main Content */}
          <div className='mt-15'>
            {
              (!loading && !isDataEmpty) &&
                <div className='w-full overflow-x-auto pb-20'>
                  <table className="app__table">
                    <thead className="app__thead">
                      <tr>
                        <th className='app__th pl-4'></th>
                        <th className='app__th'>Product Name/Description</th>
                        <th className='app__th'>Quantity</th>
                        <th className='app__th'>Unit Price</th>
                        <th className='app__th'>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.map((item: PurchaseOrderItemTypes, index: number) => (
                        <tr key={index} className='app__tr'>
                          <td
                            className="w-6 pl-4 app__td">
                              {
                                status !== 'Approved' &&
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
                                            <div
                                                onClick={() => handleDelete(item.id)}
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
                              }
                          </td>
                          <td className='app__td'>{item.rdt_products?.name}</td>
                          <td className='app__td'>{item.quantity}</td>
                          <td className='app__td'>{item.price}</td>
                          <td className='app__td'>{item.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
            }
            {
              (!loading && isDataEmpty) &&
                <div className='app__norecordsfound'>No items found.</div>
            }
            { loading && <TwoColTableLoading/> }
            {
              (!loading && !isDataEmpty) &&
                <Remarks type='purchase_order' referenceId={params.id}/>
            }
          </div>
      </div>
    </div>

    {/* Add/Edit Modal */}
    {
      showAddModal && (
        <AddEditModal
          editData={editData}
          purchaseOrderId={params.id}
          hideModal={() => setShowAddModal(false)}/>
      )
    }
    {/* Confirm Approve Modal */}
    {
      showConfirmApproveModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleApproveConfirmed}
          onCancel={() => setShowConfirmApproveModal(false)}
        />
      )
    }
    {/* Confirm Unapprove Modal */}
    {
      showConfirmUnapproveModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleUnapproveConfirmed}
          onCancel={() => setShowConfirmUnapproveModal(false)}
        />
      )
    }
    {/* Confirm Delete Modal */}
    {
      showConfirmDeleteModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowConfirmDeleteModal(false)}
        />
      )
    }
  </>
  )
}
