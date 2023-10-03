import React, { Fragment, useEffect, useState } from 'react'
import { Menu, Transition } from '@headlessui/react'
import type { CanvassItemTypes, SupplierTypes } from '@/types'
import { ChevronDownIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/20/solid'
import { ConfirmModal } from '@/components'
import { useSupabase } from '@/context/SupabaseProvider'
// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import AddEditModal from './AddEditModal'
import PriceColumn from './PriceColumn'

function DynamicTable ({ items, suppliers, canvassId, status }: { items: CanvassItemTypes[], suppliers: SupplierTypes[], canvassId: string, status: string }) {
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [editData, setEditData] = useState<CanvassItemTypes | null>(null)
  const [suppliersColumns, setSuppliersColumns] = useState<Array<{ id: string, name: string }> | []>([])

  const { supabase, session } = useSupabase()

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const handleEdit = (item: CanvassItemTypes) => {
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
        .from('rdt_canvass_items')
        .delete()
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // add to logs
      const item = items.find(item => item.id === selectedId)
      const { error: logError } = await supabase
        .from('rdt_remarks')
        .insert({
          reference_id: canvassId,
          type: 'canvass',
          reply_type: 'system',
          message: `Removed item "${item?.rdt_products?.name}"`,
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

  useEffect(() => {
    const suppCol: Array<{ id: string, name: string }> = []
    suppliers.forEach(supplier => {
      // check if supplier is present on items list
      let found = false
      items.forEach(item => {
        if (item.prices.find(p => p.supplier_id.toString() === supplier.id.toString()) !== undefined) {
          found = true
        }
      })

      // if supplier is present, add it as column
      if (found) {
        suppCol.push({ id: supplier.id, name: supplier.name })
      }
    })
    setSuppliersColumns(suppCol)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items])

  // Check if there's data to display
  if (!items || items.length === 0) {
    return <p>No data to display.</p>
  }

  return (
    <>
      <table className="app__table">
        <thead className="app__thead">
          <tr>
            <th className='app__th pl-4'></th>
            <th className='app__th'>Product</th>
            {suppliersColumns.map((supplier, index) => (
              <th key={index} className='app__th'>{supplier.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {items.map((item: CanvassItemTypes, index: number) => (
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
              {
                suppliersColumns.map((supplier, index) => (
                  <PriceColumn key={index} itemId={item.id} prices={item.prices} status={status} supplierId={supplier.id}/>
                ))
              }
            </tr>
          ))}
        </tbody>
      </table>
      {/* Add/Edit Modal */}
      {
        showAddModal && (
          <AddEditModal
            editData={editData}
            canvasId={canvassId}
            hideModal={() => setShowAddModal(false)}/>
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

export default DynamicTable
