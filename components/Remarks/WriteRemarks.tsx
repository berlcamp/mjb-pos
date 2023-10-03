'use client'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import React, { useState } from 'react'
import { CustomButton } from '@/components'
import type { RemarksTypes } from '@/types'

interface PropTypes {
  referenceId: string
  handleInsertToList: (newData: RemarksTypes) => void
}

export default function WriteRemarks ({ referenceId, handleInsertToList }: PropTypes) {
  const [remarks, setRemarks] = useState('')
  const [saving, setSaving] = useState(false)

  const { supabase, session } = useSupabase()
  const { setToast } = useFilter()

  const handleSubmitReply = async () => {
    setSaving(true)
    const newData = {
      reference_id: referenceId,
      type: 'canvass',
      message: remarks,
      sender_id: session.user.id
    }
    try {
      const { data, error } = await supabase
        .from('rdt_remarks')
        .insert(newData)
        .select('*, rdt_users(name,avatar_url)')

      console.log('data', data)

      if (error) throw new Error(error.message)

      handleInsertToList({ ...data[0] })

      setSaving(false)
      setRemarks('')

      // pop up the success message
      setToast('success', 'Successfully Deleted!')
    } catch (e) {
      console.error(e)
    }
  }
  return (
    <div className='w-full flex-col space-y-2 px-11 py-4 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
      <textarea
        onChange={e => setRemarks(e.target.value)}
        value={remarks}
        placeholder='Write remarks'
        className='w-full resize-none h-20 border focus:ring-0 focus:outline-none p-2 text-sm text-gray-700 dark:bg-gray-900 dark:text-gray-300'></textarea>

      <div className='flex items-center'>
        <CustomButton
          btnType='button'
          isDisabled={saving}
          title='Submit'
          containerStyles="app__btn_green"
          handleClick={handleSubmitReply}
        />
      </div>

    </div>
  )
}
