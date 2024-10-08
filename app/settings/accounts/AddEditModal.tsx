import { CustomButton, OneColLayoutLoading } from '@/components'
import { useFilter } from '@/context/FilterContext'
import axios from 'axios'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'

// Types
import type { AccountTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { useSupabase } from '@/context/SupabaseProvider'
import { useDispatch, useSelector } from 'react-redux'

interface ModalProps {
  hideModal: () => void
  editData: AccountTypes | null
}

const AddEditModal = ({ hideModal, editData }: ModalProps) => {
  const { setToast } = useFilter()
  const { supabase } = useSupabase()
  const [errorMessage, setErrorMessage] = useState('')
  const [saving, setSaving] = useState(false)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const {
    register,
    formState: { errors },
    reset,
    handleSubmit,
  } = useForm<AccountTypes>({
    mode: 'onSubmit',
  })

  const onSubmit = async (formdata: AccountTypes) => {
    if (saving) return

    setSaving(true)

    if (editData) {
      void handleUpdate(formdata)
    } else {
      void handleCreate(formdata)
    }
  }

  const handleCreate = async (formdata: AccountTypes) => {
    try {
      const newData = {
        name: formdata.name,
        status: 'Active',
        email: formdata.email,
        temp_password: tempPassword.toString(),
        org_id: process.env.NEXT_PUBLIC_ORG_ID,
      }

      // Sign up the user on the server side to fix pkce issue https://github.com/supabase/auth-helpers/issues/569
      axios
        .post('/api/signup', {
          item: newData,
        })
        .then(async function (response) {
          if (response.data.error) {
            throw new Error(response.data.error)
          }
          const { error: error2 } = await supabase
            .from('rdt_users')
            .insert({ ...newData, id: response.data.insert_id })

          if (error2) throw new Error(error2.message)

          // Append new data in redux
          const updatedData = { ...newData, id: response.data.insert_id }
          dispatch(updateList([updatedData, ...globallist]))

          // pop up the success message
          setToast('success', 'Successfully saved.')

          // Updating showing text in redux
          dispatch(
            updateResultCounter({
              showing: Number(resultsCounter.showing) + 1,
              results: Number(resultsCounter.results) + 1,
            })
          )

          setSaving(false)

          // hide the modal
          hideModal()

          // reset all form fields
          reset()
        })
        .catch(function (e) {
          if (e instanceof Error) {
            setErrorMessage(e.message)
            setSaving(false)
          }
        })
    } catch (e) {
      if (e instanceof Error) {
        setErrorMessage(e.message)
        setSaving(false)
      }
    }
  }

  const handleUpdate = async (formdata: AccountTypes) => {
    if (!editData) return

    const newData = {
      name: formdata.name,
    }

    try {
      const { error } = await supabase
        .from('rdt_users')
        .update(newData)
        .eq('id', editData.id)

      if (error) throw new Error(error.message)
    } catch (e) {
      console.error(e)
    } finally {
      // Update data in redux
      const items = [...globallist]
      const updatedData = { ...newData, id: editData.id }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
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
    })
  }, [editData, reset])

  const tempPassword = Math.floor(Math.random() * 899999) + 100000

  return (
    <>
      <div className="app__modal_wrapper">
        <div className="app__modal_wrapper2">
          <div className="app__modal_wrapper3">
            <div className="app__modal_header">
              <h5 className="app__modal_header_text">Account Details</h5>
              <button
                disabled={saving}
                onClick={hideModal}
                type="button"
                className="app__modal_header_btn">
                &times;
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="app__modal_body">
              {!saving ? (
                <>
                  {errorMessage !== '' && (
                    <div className="app__error_message mb-4">
                      {errorMessage}
                    </div>
                  )}
                  <div className="app__form_field_container">
                    <div className="w-full">
                      <div className="app__label_standard">Name</div>
                      <div>
                        <input
                          {...register('name', { required: true })}
                          type="text"
                          className="app__select_standard"
                        />
                        {errors.name && (
                          <div className="app__error_message">
                            Name is required
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!editData && (
                    <>
                      <div className="app__form_field_container">
                        <div className="w-full">
                          <div className="app__label_standard">Email</div>
                          <div>
                            <input
                              {...register('email', { required: true })}
                              type="email"
                              className="app__select_standard"
                            />
                            {errors.email && (
                              <div className="app__error_message">
                                Email is required
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="app__form_field_container">
                        <div className="w-full">
                          <div className="app__label_standard">
                            Temporary Password:{' '}
                            <span className="font-bold">{tempPassword}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <OneColLayoutLoading rows={3} />
              )}
              <div className="app__modal_footer">
                <CustomButton
                  btnType="submit"
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
