import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { DepartmentTypes, AccountTypes, Employee } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'

interface ModalProps {
  hideModal: () => void
  editData: Employee | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, session, systemUsers } = useSupabase()
  const [saving, setSaving] = useState(false)

  const [departments, setDepartments] = useState<DepartmentTypes[] | []>([])

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<Employee>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: Employee) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: Employee) => {
    try {
      const newData = {
        lastname: formdata.lastname,
        firstname: formdata.firstname,
        middlename: formdata.middlename,
        position: formdata.position,
        department_id: formdata.department_id,
        rate: formdata.rate,
        status: 'Active',
        created_by: session.user.id,
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }

      const { data, error: error2 } = await supabase
        .from('rdt_employees')
        .insert(newData)
        .select()

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const user: AccountTypes = systemUsers.find((user: AccountTypes) => user.id === session.user.id)
      const department: DepartmentTypes | undefined = departments.find((department: DepartmentTypes) => department.id.toString() === formdata.department_id)
      const updatedData = { ...newData, id: data[0].id, rdt_departments: department, rdt_users: user }
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

  const handleUpdate = async (formdata: Employee) => {
    if (!editData) return

    const newData = {
      lastname: formdata.lastname,
      firstname: formdata.firstname,
      middlename: formdata.middlename,
      position: formdata.position,
      rate: formdata.rate,
      department_id: formdata.department_id
    }

    try {
      const { error } = await supabase
        .from('rdt_employees')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)
    } catch (e) {
      console.error(e)
    } finally {
      // Update data in redux
      const items = [...globallist]
      const department: DepartmentTypes | undefined = departments.find((department: DepartmentTypes) => department.id.toString() === formdata.department_id)
      const updatedData = { ...newData, id: editData.id, rdt_departments: department }
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
      lastname: editData ? editData.lastname : '',
      firstname: editData ? editData.firstname : '',
      middlename: editData ? editData.middlename : '',
      position: editData ? editData.position : '',
      rate: editData ? editData.rate : ''
    })

    // fetch departments
    void (async () => {
      const { data } = await supabase
        .from('rdt_departments')
        .select()
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

      setDepartments(data)

      // prepopulate category and units
      reset({
        department_id: editData ? editData.department_id : ''
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
                        <div className='app__label_standard'>First Name</div>
                        <div>
                          <input
                            {...register('firstname', { required: true })}
                            type='text'
                            placeholder='First Name'
                            className='app__select_standard'/>
                          {errors.firstname && <div className='app__error_message'>First Name is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Middle Name</div>
                        <div>
                          <input
                            {...register('middlename')}
                            type='text'
                            placeholder='Middle Name'
                            className='app__select_standard'/>
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Last Name</div>
                        <div>
                          <input
                            {...register('lastname', { required: true })}
                            type='text'
                            placeholder='Last Name'
                            className='app__select_standard'/>
                          {errors.lastname && <div className='app__error_message'>Last Name is required</div>}
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Department</div>
                        <div>
                          <select
                            {...register('department_id')}
                            className='app__select_standard'>
                              <option value=''>None</option>
                              {
                                departments.map((department: DepartmentTypes, index) => (
                                  <option key={index} value={department.id}>{department.name}</option>
                                ))
                              }
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Position</div>
                        <div>
                          <input
                            {...register('position')}
                            type='text'
                            placeholder='Position (optional)'
                            className='app__select_standard'/>
                        </div>
                      </div>
                    </div>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Rate (per Day)</div>
                        <div>
                          <input
                            {...register('rate', { required: true })}
                            type='number'
                            className='app__select_standard'/>
                          {errors.rate && <div className='app__error_message'>Rate is required</div>}
                        </div>
                      </div>
                    </div>
                  </>
                : <OneColLayoutLoading rows={4}/>
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
