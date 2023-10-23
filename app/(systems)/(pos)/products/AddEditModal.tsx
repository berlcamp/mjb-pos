import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { AccountTypes, ProductCategoryTypes, ProductTypes, ProductUnitTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: ProductTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const [saving, setSaving] = useState(false)
  const [categories, setCategories] = useState<ProductCategoryTypes[] | []>([])
  const [units, setUnits] = useState<ProductUnitTypes[] | []>([])
  const [unit, setUnit] = useState('unit')

  const { supabase, session, systemUsers } = useSupabase()

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<ProductTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: ProductTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: ProductTypes) => {
    try {
      const newData = {
        description: formdata.description,
        category_id: formdata.category_id !== '' ? formdata.category_id : null,
        unit_id: formdata.unit_id !== '' ? formdata.unit_id : null,
        available_stocks: formdata.available_stocks,
        price: formdata.price,
        created_by: session.user.id,
        status: 'Active',
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }

      const { data, error: error2 } = await supabase
        .from('rdt_products')
        .insert(newData)
        .select()

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const user: AccountTypes = systemUsers.find((user: AccountTypes) => user.id === session.user.id)
      const category = categories.find((category: ProductCategoryTypes) => category.id.toString() === formdata.category_id.toString())
      const unit = units.find((unit: ProductUnitTypes) => unit.id.toString() === formdata.unit_id.toString())
      const updatedData = { ...newData, id: data[0].id, rdt_users: { name: user.name, avatar_url: user.avatar_url }, rdt_product_categories: category, rdt_product_units: unit }
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

  const handleUpdate = async (formdata: ProductTypes) => {
    if (!editData) return

    const newData = {
      description: formdata.description,
      category_id: formdata.category_id !== '' ? formdata.category_id : null,
      unit_id: formdata.unit_id !== '' ? formdata.unit_id : null,
      available_stocks: formdata.available_stocks,
      price: formdata.price
    }

    try {
      const { error } = await supabase
        .from('rdt_products')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)
    } catch (e) {
      console.error(e)
    } finally {
      // Update data in redux
      const items = [...globallist]
      const category = categories.find((category: ProductCategoryTypes) => category.id.toString() === formdata.category_id.toString())
      const unit = units.find((unit: ProductUnitTypes) => unit.id.toString() === formdata.unit_id.toString())
      const updatedData = { ...newData, id: editData.id, rdt_product_categories: category, rdt_product_units: unit }
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
    }
  }

  const handleUnitCHange = (unit: string) => {
    const findUnit = units.find(u => u.id.toString() === unit)
    setUnit(findUnit !== undefined ? findUnit.name : 'unit')
  }

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      description: editData ? editData.description : '',
      price: editData ? editData.price : '',
      available_stocks: editData ? editData.available_stocks : ''
    })

    void (async () => {
      const { data } = await supabase
        .from('rdt_product_categories')
        .select()
        .eq('status', 'Active')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

      const { data: units } = await supabase
        .from('rdt_product_units')
        .select()
        .eq('status', 'Active')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

      setCategories(data)
      setUnits(units)

      // prepopulate category and units
      reset({
        category_id: editData ? editData.category_id : '',
        unit_id: editData ? editData.unit_id : ''
      })
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, reset])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Product Details
            </h5>
            <button disabled={saving} onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="app__modal_body">
            {
              !saving
                ? <>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Product Description</div>
                        <div>
                          <input
                            {...register('description', { required: true })}
                            type='text'
                            className='app__select_standard'/>
                          {errors.description && <div className='app__error_message'>Product Description is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Category (optional)</div>
                        <div>
                          <select
                            {...register('category_id')}
                            className='app__select_standard'>
                              <option value=''>None</option>
                              {
                                categories.map((category: ProductCategoryTypes, index) => (
                                  <option key={index} value={category.id}>{category.name}</option>
                                ))
                              }
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Unit (optional)</div>
                        <div>
                          <select
                            {...register('unit_id', { required: true })}
                            onChange={e => handleUnitCHange(e.target.value)}
                            className='app__select_standard'>
                              <option value=''>None</option>
                              {
                                units.map((unit: ProductCategoryTypes, index) => (
                                  <option key={index} value={unit.id}>{unit.name}</option>
                                ))
                              }
                          </select>
                          {errors.unit_id && <div className='app__error_message'>Unit is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Price per {unit}</div>
                        <div>
                          <input
                            {...register('price', { required: true })}
                            type='number'
                            step='any'
                            className='app__select_standard'/>
                          {errors.price && <div className='app__error_message'>Price is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Available Stocks</div>
                        <div>
                          <input
                            {...register('available_stocks', { required: true })}
                            type='number'
                            className='app__select_standard'/>
                          {errors.available_stocks && <div className='app__error_message'>Available Stocks is required</div>}
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
