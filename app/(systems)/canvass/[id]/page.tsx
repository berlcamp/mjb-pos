'use client'
import React, { useEffect, useState } from 'react'
import { Sidebar, TopBar, Title, Unauthorized, CustomButton, InventorySideBar, ConfirmModal, BackButton } from '@/components'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import AddEditModal from './AddEditModal'

// Types
import type { CanvassItemTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'

export default function Page ({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<CanvassItemTypes[]>([])
  const [canvassName, setCanvassName] = useState('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showConfirmRemoveModal, setShowConfirmRemoveModal] = useState(false)
  // const [selectedId, setSelectedId] = useState<string>('')
  const [editData, setEditData] = useState<CanvassItemTypes | null>(null)

  const { session, supabase } = useSupabase()
  const { hasAccess } = useFilter()

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const fetchData = async () => {
    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('rdt_canvass_items')
        .select()
        .eq('canvas_id', params.id)

      if (error) throw new Error(error.message)

      const { data: canvass, error: error2 } = await supabase
        .from('rdt_canvasses')
        .select('name')
        .eq('id', params.id)
        .single()

      if (error2) throw new Error(error2.message)

      console.log('canvass', canvass)
      setCanvassName(canvass.name)

      // update the list in redux
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

  // const handleEdit = (item: CanvassItemTypes) => {
  //   setShowAddModal(true)
  //   setEditData(item)
  // }

  // const handleRemove = (id: string) => {
  //   setSelectedId(id)
  //   setShowConfirmRemoveModal(true)
  // }

  const handleRemoveConfirmed = async () => {
    //
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
    console.log('globallist', globallist)
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

  return (
    <>
    <Sidebar>
      <InventorySideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <BackButton title='Back to Price Canvasses' url='/canvass'/>
          <div className='app__title'>
            <Title title='Items & Prices' subTitle={canvassName}/>
            <CustomButton
              containerStyles='app__btn_green'
              title='Add New Item'
              btnType='button'
              handleClick={handleAdd}
            />
          </div>

          {/* Main Content */}
          <div className='mt-10'>
            {
              (!loading && isDataEmpty) &&
                <div className='w-full overflow-x-auto'>
                  <table className="app__table">
                    <thead className="app__thead">
                      <tr>
                        <th className="app__th">
                          Item
                        </th>
                        <th className="app__th">
                          Supplier A
                        </th>
                        <th className="app__th">
                          Supplier B
                        </th>
                        <th className="app__th">
                          Supplier C
                        </th>
                        <th className="app__th">
                          Supplier A
                        </th>
                        <th className="app__th">
                          Supplier B
                        </th>
                        <th className="app__th">
                          Supplier C
                        </th>
                        <th className="app__th">
                          Supplier A
                        </th>
                        <th className="app__th">
                          Supplier B
                        </th>
                        <th className="app__th">
                          Supplier C
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="app__tr">
                        <td className="app__td">
                          Nails
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                      </tr>
                      <tr className="app__tr">
                        <td className="app__td">
                          Nails
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                      </tr>
                      <tr className="app__tr">
                        <td className="app__td">
                          Nails
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                        <td className="app__td">
                          154 (per kg)
                        </td>
                        <td className="app__td">
                          322 (per kg)
                        </td>
                        <td className="app__td">
                          111 (per kg)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
            }
            {
              (!loading && isDataEmpty) &&
                <div className='app__norecordsfound'>No records found.</div>
            }
            { loading && <TwoColTableLoading/> }
          </div>
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
      showConfirmRemoveModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleRemoveConfirmed}
          onCancel={() => setShowConfirmRemoveModal(false)}
        />
      )
    }
  </>
  )
}
