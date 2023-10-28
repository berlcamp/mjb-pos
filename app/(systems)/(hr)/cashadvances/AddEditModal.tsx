import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { AccountTypes, CashAdvanceTypes, Employee } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: CashAdvanceTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, systemUsers, session } = useSupabase()
  const [saving, setSaving] = useState(false)

  const [employees, setEmployees] = useState<Employee[] | []>([])

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<CashAdvanceTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: CashAdvanceTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: CashAdvanceTypes) => {
    try {
      const newData = {
        employee_id: formdata.employee_id,
        created_by: session.user.id,
        amount: formdata.amount,
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }

      const { data, error: error2 } = await supabase
        .from('rdt_cash_advances')
        .insert(newData)
        .select()

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const user: AccountTypes = systemUsers.find((user: AccountTypes) => user.id === session.user.id)
      const employee: Employee | undefined = employees.find((employee: Employee) => employee.id.toString() === formdata.employee_id)
      const updatedData = { ...newData, id: data[0].id, rdt_employees: employee, rdt_users: user }
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

  const handleUpdate = async (formdata: CashAdvanceTypes) => {
    if (!editData) return

    const newData = {
      amount: formdata.amount
    }

    try {
      const { error } = await supabase
        .from('rdt_cash_advances')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)
    } catch (e) {
      console.error(e)
    } finally {
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
    }
  }

  // manually set the defaultValues of use-form-hook whenever the component receives new props.
  useEffect(() => {
    reset({
      amount: editData ? editData.amount : ''
    })

    // fetch employees
    void (async () => {
      const { data } = await supabase
        .from('rdt_employees')
        .select()
        .eq('status', 'Active')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

      setEmployees(data)
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
              Cash Advance Details
            </h5>
            <button disabled={saving} onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="app__modal_body">
            {
              !saving
                ? <>
                    {
                      !editData &&
                        <div className='app__form_field_container'>
                          <div className='w-full'>
                            <div className='app__label_standard'>Employee</div>
                            <div>
                              <select
                                {...register('employee_id')}
                                className='app__select_standard'>
                                  <option value=''>None</option>
                                  {
                                    employees.map((employee: Employee, index: number) => (
                                      <option key={index} value={employee.id}>{employee.lastname}, {employee.firstname} {employee.middlename}</option>
                                    ))
                                  }
                              </select>
                              {errors.employee_id && <div className='app__error_message'>Employee is required</div>}
                            </div>
                          </div>
                        </div>
                    }
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Amount</div>
                        <div>
                          <input
                            {...register('amount', { required: true })}
                            type='number'
                            step='any'
                            className='app__select_standard'/>
                          {errors.amount && <div className='app__error_message'>Amount is required</div>}
                        </div>
                      </div>
                    </div>
                  </>
                : <OneColLayoutLoading rows={1}/>
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
