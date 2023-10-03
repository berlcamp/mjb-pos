'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar, TopBar, Title, Unauthorized, CustomButton, InventorySideBar, BackButton, Remarks, ConfirmModal } from '@/components'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import AddEditModal from './AddEditModal'
// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'

// Types
import type { CanvassTypes, CanvassItemTypes } from '@/types'

import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import DynamicTable from './DynamicTable'

export default function Page ({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<CanvassItemTypes[]>([])
  const [canvass, setCanvas] = useState<CanvassTypes | null>(null)
  const [suppliers, setSuppliers] = useState([])
  const [status, setStatus] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmApproveModal, setShowConfirmApproveModal] = useState(false)
  const [showConfirmUnapproveModal, setShowConfirmUnapproveModal] = useState(false)
  const [editData, setEditData] = useState<CanvassItemTypes | null>(null)

  const { session, supabase } = useSupabase()
  const { hasAccess, setToast } = useFilter()

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('rdt_canvass_items')
        .select('*, rdt_products(id, name)')
        .eq('canvas_id', params.id)
        .order('id', { ascending: false })

      if (error) throw new Error(error.message)

      const { data: canvass, error: error2 } = await supabase
        .from('rdt_canvasses')
        .select()
        .eq('id', params.id)
        .single()

      if (error2) throw new Error(error2.message)

      const { data: suppliers, error: error3 } = await supabase
        .from('rdt_suppliers')
        .select()

      if (error3) throw new Error(error3.message)

      setSuppliers(suppliers)
      setCanvas(canvass)
      setStatus(canvass.status)
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

  const handleApprove = () => {
    setShowConfirmApproveModal(true)
  }
  const handleUnapprove = () => {
    setShowConfirmUnapproveModal(true)
  }

  const handleApproveConfirmed = async () => {
    try {
      const { error } = await supabase
        .from('rdt_canvasses')
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
          type: 'canvass',
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
        .from('rdt_canvasses')
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
          type: 'canvass',
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
            <BackButton title='Back to Price Canvasses' url='/canvass'/>
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
            <Title title={canvass ? 'Canvas #: ' + canvass.canvass_number : ''}/>
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
            <span className='text-sm font-bold text-gray-600'>{canvass ? canvass.description : ''}</span>
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
                  <DynamicTable items={list} suppliers={suppliers} status={status} canvassId={params.id}/>
                </div>
            }
            {
              (!loading && isDataEmpty) &&
                <div className='app__norecordsfound'>No items found.</div>
            }
            { loading && <TwoColTableLoading/> }
            {
              (!loading && !isDataEmpty) &&
                <Remarks type='canvass' referenceId={params.id}/>
            }
          </div>
      </div>
    </div>

    {/* Add/Edit Modal */}
    {
      showAddModal && (
        <AddEditModal
          editData={editData}
          canvasId={params.id}
          hideModal={() => setShowAddModal(false)}/>
      )
    }
    {/* Confirm Modal */}
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
    {/* Confirm Modal */}
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
  </>
  )
}
