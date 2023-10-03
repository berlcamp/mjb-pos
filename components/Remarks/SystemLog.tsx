'use client'
import React from 'react'
import type { RemarksTypes } from '@/types'
import { format } from 'date-fns'

interface PropTypes {
  remarks: RemarksTypes
}

export default function SystemLog ({ remarks }: PropTypes) {
  return (
    <div className='w-full flex-col space-y-1 px-4 border-t py-2 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400'>
      <div className='w-full group'>
        <div className='ml-8'>
          {
            (remarks.reply_type === 'system') &&
              <div className='text-gray-500 text-[10px] italic'>
                (System) {remarks.rdt_users?.name} {remarks.message} on {format(new Date(remarks.created_at), 'MMMM dd, yyyy HH:mm aaa')}
              </div>
          }

        </div>
      </div>
    </div>
  )
}
