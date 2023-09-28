import { fetchProjects } from '@/utils/fetchApi'
import React, { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useFilter } from '@/context/FilterContext'
import { CustomButton, OneColLayoutLoading } from '@/components'

// Types
import type { AccountTypes, LocationTypes, ProjectTypes } from '@/types'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'
import uuid from 'react-uuid'

interface ModalProps {
  hideModal: () => void
  editData: LocationTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase, session, systemUsers } = useSupabase()
  const [saving, setSaving] = useState(false)
  const [projects, setProjects] = useState<ProjectTypes[] | null>(null)
  const [projectId, setProjectId] = useState(editData ? (editData.project_id ? editData.project_id : '') : '')

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { register, formState: { errors }, reset, handleSubmit } = useForm<LocationTypes>({
    mode: 'onSubmit'
  })

  const onSubmit = async (formdata: LocationTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: LocationTypes) => {
    try {
      const newData = {
        name: formdata.name,
        description: formdata.description,
        project_id: formdata.project_id,
        created_by: session.user.id,
        status: 'Active',
        org_id: process.env.NEXT_PUBLIC_ORG_ID
      }

      const { data, error: error2 } = await supabase
        .from('rdt_project_locations')
        .insert(newData)
        .select()

      if (error2) throw new Error(error2.message)

      // Append new data in redux
      const user: AccountTypes = systemUsers.find((user: AccountTypes) => user.id === session.user.id)
      const updatedData = { ...newData, id: data[0].id, rdt_users: { name: user.name, avatar_url: user.avatar_url } }
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

  const handleUpdate = async (formdata: LocationTypes) => {
    if (!editData) return

    const newData = {
      name: formdata.name,
      description: formdata.description,
      project_id: formdata.project_id
    }

    try {
      const { error } = await supabase
        .from('rdt_project_locations')
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
      name: editData ? editData.name : '',
      description: editData ? editData.description : ''
    })

    // Reset dynamic dropdowns
    setProjectId(editData ? (editData.project_id ? editData.project_id : '') : '')

    const fetchProjectsData = async () => {
      const result = await fetchProjects({}, 1000, 0)
      setProjects(result.data.length > 0 ? result.data : null)
    }

    void fetchProjectsData()
  }, [editData, reset])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Location Details
            </h5>
            <button disabled={saving} onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="app__modal_body">
            {
              !saving
                ? <>
                    <div className='app__form_field_container'>
                      <div className='w-full'>
                        <div className='app__label_standard'>Location Name</div>
                        <div>
                          <input
                            {...register('name', { required: true })}
                            type='text'
                            className='app__select_standard'/>
                          {errors.name && <div className='app__error_message'>Location Name is required</div>}
                        </div>
                      </div>
                    </div>
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
                        <div className='app__label_standard'>Project:</div>
                        <div>
                          <select
                            {...register('project_id', { required: true })}
                            value={projectId}
                            onChange={e => setProjectId(e.target.value)}
                            className='app__select_standard'>
                              <option value=''>Choose Project</option>
                              {
                                projects?.map(item => (
                                  <option key={uuid()} value={item.id}>{item.name}</option>
                                ))
                              }
                          </select>
                          {errors.project_id && <div className='app__error_message'>Project is required</div>}
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
