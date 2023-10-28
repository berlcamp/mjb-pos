import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { AccountTypes, PayrollTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'
import { generateReferenceCode } from '@/utils/text-helper'

interface ModalProps {
  hideModal: () => void
  editData: PayrollTypes | null
}

const countDateDays = (startDate: string, endDate: string) => {
  // Create new date objects to avoid modifying the original dates
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate the time difference in milliseconds
  const timeDifference: number = end.getTime() - start.getTime()

  // Calculate the number of days by dividing the time difference by the number of milliseconds in a day
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

  return daysDifference + 1
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, session, systemUsers } = useSupabase()
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<PayrollTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: PayrollTypes) => {
    if (saving) return

    // validate date range
    if (countDateDays(formdata.from, formdata.to) < 1) {
      setErrorMessage('Date range is invalid')
      return
    } else {
      setErrorMessage('')
    }

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: PayrollTypes) => {
    try {
      const newData = {
        from: new Date(formdata.from), // use the string data before storing the redux to avoid error
        to: new Date(formdata.to), // use the string data before storing the redux to avoid error
        description: formdata.description,
        reference_code: generateReferenceCode(),
        created_by: session.user.id,
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }

      const { data, error: error2 } = await supabase
        .from('rdt_payrolls')
        .insert(newData)
        .select()

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const user: AccountTypes = systemUsers.find((user: AccountTypes) => user.id === session.user.id)
      const updatedData = { ...newData, from: formdata.from, to: formdata.to, id: data[0].id, rdt_users: user }
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

  const handleUpdate = async (formdata: PayrollTypes) => {
    if (!editData) return

    const newData = {
      from: new Date(formdata.from), // use the string data before storing the redux to avoid error
      to: new Date(formdata.to), // use the string data before storing the redux to avoid error
      description: formdata.description
    }

    try {
      const { error } = await supabase
        .from('rdt_payrolls')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)
    } catch (e) {
      console.error(e)
    } finally {
      // Update data in redux
      const items = [...globallist]
      const updatedData = { ...newData, from: formdata.from, to: formdata.to, id: editData.id }
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

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      description: editData ? editData.description : '',
      from: editData ? editData.from : '',
      to: editData ? editData.to : ''
    })

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editData, reset])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Employee Details
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
                            placeholder='Description'
                            className='app__select_standard'/>
                          {errors.description && <div className='app__error_message'>Description is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>From</div>
                        <div>
                          <input
                            {...register('from', { required: true })}
                            type='date'
                            className='app__select_standard'/>
                          {errors.from && <div className='app__error_message'>Date (from) is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>To</div>
                        <div>
                          <input
                            {...register('to', { required: true })}
                            type='date'
                            className='app__select_standard'/>
                          {errors.to && <div className='app__error_message'>Date (to) is required</div>}
                          {
                            errorMessage !== '' &&
                              <div className='app__error_message'>{errorMessage}</div>
                          }
                        </div>
                      </div>
                    </div>
                  </>
                : <OneColLayoutLoading rows={2}/>
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
