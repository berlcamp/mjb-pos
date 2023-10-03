import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { AccountTypes, PurchaseOrderTypes, SupplierTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'
import { fetchSuppliers } from '@/utils/fetchApi'

interface ModalProps {
  hideModal: () => void
  editData: PurchaseOrderTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, session, systemUsers } = useSupabase()

  const [saving, setSaving] = useState(false)
  const [immutableSuppliers, setImmutableSuppliers] = useState<SupplierTypes[]>([])

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<PurchaseOrderTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: PurchaseOrderTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: PurchaseOrderTypes) => {
    try {
      const newData = {
        po_number: Math.floor(Math.random() * 99999) + 10000,
        description: formdata.description,
        supplier_id: formdata.supplier_id,
        date: new Date(formdata.date), // use the string data before storing the redux to avoid error
        created_by: session.user.id,
        status: 'Pending approval',
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }

      const { data, error: error2 } = await supabase
        .from('rdt_purchase_orders')
        .insert(newData)
        .select()

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const user: AccountTypes = systemUsers.find((user: AccountTypes) => user.id === session.user.id)
      const supplier = immutableSuppliers.find((supp: SupplierTypes) => supp.id.toString() === formdata.supplier_id)
      console.log(supplier, formdata.supplier_id)
      const updatedData = { ...newData, date: formdata.date, id: data[0].id, rdt_suppliers: { name: supplier?.name }, rdt_users: { name: user.name, avatar_url: user.avatar_url } }
      dispatch(updateList([updatedData, ...globallist]))

      // pop up the success message
      setToast('success', 'Successfully saved.')

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: Number(resultsCounter.showing) + 1, results: Number(resultsCounter.results) + 1 }))

      setSaving(false)

      // hide the modal
      hideModal()

      // reset all form fields
      reset()
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdate = async (formdata: PurchaseOrderTypes) => {
    if (!editData) return

    const newData = {
      description: formdata.description
    }

    try {
      const { error } = await supabase
        .from('rdt_purchase_orders')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)

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

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      description: editData ? editData.description : ''
    })

    const fetchSuppliersData = async () => {
      const result = await fetchSuppliers({ filterStatus: 'Active' }, 300, 0)
      setImmutableSuppliers(result.data)
    }
    void fetchSuppliersData()
  }, [editData, reset])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              P.O. Details
            </h5>
            <button disabled={saving} onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="app__modal_body">
            {
              !saving
                ? <>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Description</div>
                        <div>
                          <input
                            {...register('description', { required: true })}
                            type='text'
                            className='app__select_standard'/>
                          {errors.description && <div className='app__error_message'>Description is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Date</div>
                        <div>
                          <input
                            {...register('date', { required: true })}
                            type='date'
                            className='app__select_standard'/>
                          {errors.date && <div className='app__error_message'>Date is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Date</div>
                        <div>
                          <select
                            {...register('supplier_id', { required: true })}
                            className='app__select_standard'>
                              <option value=''>Choose Supplier</option>
                              {
                                immutableSuppliers?.map((item, index) => (
                                  <option key={index} value={item.id}>{item.name}</option>
                                ))
                              }
                          </select>
                          {errors.supplier_id && <div className='app__error_message'>Supplier is required</div>}
                        </div>
                      </div>
                    </div>
                  </>
                : <OneColLayoutLoading rows={3}/>
            }
            <div className="app__modal_footer">
                  <CustomButton
                    btnType='submit'
                    isDisabled={saving}
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
