import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { CanvassItemTypes, SupplierPricesTypes, SupplierTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { useSupabase } from '@/context/SupabaseProvider'
import uuid from 'react-uuid'
import { fetchSuppliers } from '@/utils/fetchApi'

interface ModalProps {
  hideModal: () => void
  editData: CanvassItemTypes | null
  canvasId: string
}

const AddEditModal = ({ hideModal, editData, canvasId }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, session } = useSupabase()

  const [saving, setSaving] = useState(false)
  const [supplierPrices, setSupplierPrices] = useState<SupplierPricesTypes[] | []>([])
  const [suppliers, setSuppliers] = useState<SupplierTypes[]>([])
  const [immutableSuppliers, setImmutableSuppliers] = useState<SupplierTypes[]>([])
  const [supplier, setSupplier] = useState('')
  const [price, setPrice] = useState('')
  const [unit, setUnit] = useState('')

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<CanvassItemTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: CanvassItemTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: CanvassItemTypes) => {
    try {
      const newData = {
        product_name: formdata.product_name,
        prices: supplierPrices,
        canvas_id: canvasId
      }

      const { data, error } = await supabase
        .from('rdt_canvass_items')
        .insert(newData)
        .select()

      if (error) throw new Error(error.message)

      // add to logs
      const { error: logError } = await supabase
        .from('rdt_remarks')
        .insert({
          reference_id: canvasId,
          type: 'canvass',
          reply_type: 'system',
          message: `Added product "${formdata.product_name}"`,
          sender_id: session.user.id
        })
      if (logError) throw new Error(logError.message)

      // Append new data in redux
      const updatedData = { ...newData, id: data[0].id }
      dispatch(updateList([updatedData, ...globallist]))

      // pop up the success message
      setToast('success', 'Successfully saved.')

      setSaving(false)

      // hide the modal
      hideModal()

      // reset all form fields
      reset()
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = async (formdata: CanvassItemTypes) => {
    if (!editData) return

    const newData = {
      product_name: formdata.product_name,
      prices: supplierPrices
    }

    try {
      const { error } = await supabase
        .from('rdt_canvass_items')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)

      // add to logs
      const { error: logError } = await supabase
        .from('rdt_remarks')
        .insert({
          reference_id: canvasId,
          type: 'canvass',
          reply_type: 'system',
          message: `Updated product "${formdata.product_name}"`,
          sender_id: session.user.id
        })
      if (logError) throw new Error(logError.message)

      // Update data in redux
      const items = [...globallist]
      const updatedData = { ...newData, id: editData.id }
      const foundIndex = items.findIndex(x => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully saved.')

      setSaving(false)

      // hide the modal
      hideModal()

      // reset all form fields
      reset()
    } catch (e) {
      console.error(e)
    }
  }

  const handleAddPrice = () => {
    if (supplier === '' || price === '') return

    const supp = suppliers.find(i => i.id.toString() === supplier.toString())
    const newRow = {
      supplier_name: supp ? supp.name : '',
      supplier_id: supplier,
      unit,
      price,
      checked: false,
      ref: Math.floor(Math.random() * 20000) + 1
    }
    console.log('asdf', [...supplierPrices, newRow])

    setSupplierPrices([...supplierPrices, newRow])
    setSupplier('')
    setPrice('')
    setUnit('')

    // update dropdown list
    setSuppliers(prevList => prevList.filter(item => item.id.toString() !== supplier.toString()))
  }

  const handleRemovePrice = (item: SupplierPricesTypes) => {
    const updatedData = supplierPrices.filter((i: any) => i.ref !== item.ref)
    setSupplierPrices(updatedData)

    // return item to dropdown list
    // update dropdown list
    const sup = immutableSuppliers.find(i => i.id.toString() === item.supplier_id)
    if (sup) {
      const updatedList = [...suppliers, sup]
      setSuppliers(updatedList)
    }
  }

  useEffect(() => {
    const fetchSuppliersData = async () => {
      const result = await fetchSuppliers({ filterStatus: 'Active' }, 300, 0)

      setImmutableSuppliers(result.data)

      if (editData) {
        setSupplierPrices(editData.prices)

        // check if supplier is present on items list
        const suppliers: SupplierTypes[] = []
        result.data.forEach(supplier => {
          if (editData.prices.find(p => p.supplier_id.toString() === supplier.id.toString()) === undefined) {
            suppliers.push(supplier)
          }
        })
        setSuppliers(suppliers)
      } else {
        setSuppliers(result.data)
      }
    }

    void fetchSuppliersData()

    reset({
      product_name: editData ? editData.product_name.toString() : ''
    })
  }, [editData, reset])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2_medium">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Product and Supplier Price Details
            </h5>
            <button disabled={saving} onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="app__modal_body">
            {
              !saving
                ? <>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Product Description:</div>
                        <div>
                          <input
                            {...register('product_name', { required: true })}
                            type='text'
                            className='app__select_standard'/>
                          {errors.product_name && <div className='app__error_message'>Product Description is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='py-4'>
                      <hr/>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='flex items-start justify-start space-x-2'>
                        <div>
                          <div className='app__label_standard'>Supplier</div>
                          <div>
                            <select
                              value={supplier}
                              onChange={e => setSupplier(e.target.value)}
                              className='app__select_standard'>
                                <option value=''>Choose Supplier</option>
                                {
                                  suppliers?.map(item => (
                                    <option key={uuid()} value={item.id}>{item.name}</option>
                                  ))
                                }
                            </select>
                          </div>
                        </div>
                        <div>
                          <div className='app__label_standard'>Unit</div>
                          <div>
                            <input
                              type='text'
                              placeholder='ex. per Kg'
                              value={unit}
                              onChange={e => setUnit(e.target.value)}
                              className='app__select_standard'/>
                          </div>
                        </div>
                        <div>
                          <div className='app__label_standard'>Price</div>
                          <div>
                            <input
                              type='number'
                              step='any'
                              placeholder='Price'
                              value={price}
                              onChange={e => setPrice(e.target.value)}
                              className='app__select_standard'/>
                          </div>
                        </div>
                        <div>
                          <div>&nbsp;</div>
                          <div>
                            <CustomButton
                              btnType='button'
                              isDisabled={saving}
                              title='Add'
                              handleClick={handleAddPrice}
                              containerStyles="app__btn_blue"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <table className='w-full text-sm text-left text-gray-600'>
                        {
                          supplierPrices.length > 0 &&
                            <thead className="app__thead">
                              <tr>
                                <th className='app__th'>Supplier</th>
                                <th className='app__th'>Unit</th>
                                <th className='app__th'>Price</th>
                                <th className='app__th'></th>
                              </tr>
                            </thead>
                        }
                        <tbody className='app__thead'>
                        {
                          supplierPrices.map((item: any) => (
                            <tr key={uuid()} className='app__tr'>
                              <td className='app__td'>{item.supplier_name}</td>
                              <td className='app__td'>{item.unit}</td>
                              <td className='app__td'>{item.price}</td>
                              <td className='app__td'>
                                <CustomButton
                                  btnType='button'
                                  isDisabled={saving}
                                  title='Remove'
                                  handleClick={() => handleRemovePrice(item)}
                                  containerStyles="app__btn_red_xs"
                                />
                              </td>
                            </tr>
                          ))
                        }
                        </tbody>
                      </table>
                    </div>
                    <div className='py-4'>
                      <hr/>
                    </div>
                  </>
                : <OneColLayoutLoading rows={3}/>
            }
            <div className="app__modal_footer">
                  <CustomButton
                    btnType='submit'
                    isDisabled={saving || supplierPrices.length === 0}
                    title={saving ? 'Saving...' : 'Submit'}
                    containerStyles="app__btn_green"
                  />
            </div>
          </form>
        </div>
      </div>
    </div>
  </>
  )
}

export default AddEditModal
