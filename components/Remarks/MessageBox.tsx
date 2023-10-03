'use client'
import { Menu, Transition } from '@headlessui/react'
import { EllipsisHorizontalIcon, PencilIcon } from '@heroicons/react/24/solid'
import React, { Fragment, useState } from 'react'
import { TrashIcon } from '@heroicons/react/24/outline'
import { useSupabase } from '@/context/SupabaseProvider'
import type { RemarksTypes } from '@/types'
import { ConfirmModal, CustomButton, UserBlock } from '@/components'
import { useFilter } from '@/context/FilterContext'
import { format } from 'date-fns'

interface PropTypes {
  remarks: RemarksTypes
  handleRemoveFromList: (id: string) => void
}

export default function MessageBox ({ remarks, handleRemoveFromList }: PropTypes) {
  const [selectedId, setSelectedId] = useState<string>('')
  const [editMode, setEditMode] = useState(false)
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false)
  const [saving, setSaving] = useState(false)

  const [message, setMessage] = useState(remarks.message)

  const { supabase, session } = useSupabase()
  const { setToast } = useFilter()

  // Delete confirmation
  const deleteRemarks = (id: string) => {
    setShowDeleteConfirmation(true)
    setSelectedId(id)
  }
  const handleCancel = () => {
    setShowDeleteConfirmation(false)
    setSelectedId('')
  }
  const handleConfirmedDelete = async () => {
    await handleDeleteRemarks()
    setShowDeleteConfirmation(false)
  }
  const handleDeleteRemarks = async () => {
    try {
      const { error } = await supabase
        .from('rdt_remarks')
        .delete()
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // remove from list
      handleRemoveFromList(selectedId)

      setToast('success', 'Successfully Deleted!')
    } catch (e) {
      console.error(e)
    }
  }

  const handleUpdateMessage = async () => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('rdt_remarks')
        .update({
          message
        })
        .eq('id', remarks.id)

      if (error) throw new Error(error.message)

      setEditMode(false)
      setSaving(false)

      setToast('success', 'Successfully Deleted!')
    } catch (e) {
      console.error(e)
    }
  }

  // Only enable Edit/delete to author
  const isAuthor = remarks.sender_id === session.user.id

  return (
    <div className='w-full flex-col space-y-1 px-4 border-t py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
      <div className='w-full group'>
        {
          remarks.reply_type !== 'system' &&
            <div className='flex items-center space-x-2'>
              <div className='flex flex-1 items-center space-x-2'>
                <div>
                  <UserBlock user={remarks.rdt_users}/>
                </div>
              </div>
              <div className={`${isAuthor ? 'hidden group-hover:flex' : 'hidden'} items-center space-x-2`}>
                <Menu as="div" className="relative inline-block text-left mr-2">
                  <div>
                    <Menu.Button className="app__dropdown_btn">
                      <EllipsisHorizontalIcon className='w-4 h-4'/>
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
                    <Menu.Items className="absolute right-0 z-50 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <Menu.Item>
                          <div
                              onClick={() => setEditMode(true)}
                              className='app__dropdown_item'
                            >
                              <PencilIcon className='w-4 h-4'/>
                              <span>Edit</span>
                          </div>
                        </Menu.Item>
                        <Menu.Item>
                          <div
                              onClick={() => deleteRemarks(remarks.id)}
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
              </div>
            </div>
        }

        <div className='ml-8'>
          {/* Message */}
          <div className=''>
            <div className=''>
              {
                (remarks.reply_type !== 'system' && !editMode) &&
                  <>
                    <div className='text-gray-500 text-[9px] text-xs'>{format(new Date(remarks.created_at), 'MMMM dd, yyyy HH:mm aaa')}</div>
                    <div className='mt-1'>{message}</div>
                  </>
              }
              {
                editMode &&
                  <div className='mb-4'>
                    <textarea
                      onChange={e => setMessage(e.target.value)}
                      value={message}
                      className='w-full h-20 border focus:ring-0 focus:outline-none p-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300'></textarea>
                    <div className='flex space-x-2 items-center justify-start'>
                        <CustomButton
                          btnType='button'
                          isDisabled={saving}
                          title={saving ? 'Saving...' : 'Save'}
                          containerStyles="app__btn_green"
                          handleClick={handleUpdateMessage}
                        />
                        <CustomButton
                          btnType='button'
                          isDisabled={saving}
                          title='Cancel'
                          containerStyles="app__btn_gray"
                          handleClick={() => setEditMode(false)}
                        />
                    </div>
                  </div>
              }
            </div>
          </div>
          {
            (remarks.reply_type === 'system') &&
              <div className='text-gray-500 text-[10px] italic'>
                (System) {remarks.rdt_users?.name} {remarks.message} on {format(new Date(remarks.created_at), 'MMMM dd, yyyy HH:mm aaa')}
              </div>
          }

        </div>
      </div>
      {/* Confirm Delete Modal */}
      {
        showDeleteConfirmation && (
          <ConfirmModal
            header='Confirmation'
            btnText='Confirm'
            message="Please confirm this action"
            onConfirm={handleConfirmedDelete}
            onCancel={handleCancel}
          />
        )
      }
    </div>
  )
}
