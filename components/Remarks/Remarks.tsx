'use client'
import React, { useEffect, useState } from 'react'
// import ReplyBox from './ReplyBox'
import uuid from 'react-uuid'
import type { RemarksTypes } from '@/types'
import { useSupabase } from '@/context/SupabaseProvider'
import MessageBox from './MessageBox'
import WriteRemarks from './WriteRemarks'
import SystemLog from './SystemLog'
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/20/solid'

interface propTypes {
  type: string
  referenceId: string
}

export default function Remarks ({ type, referenceId }: propTypes) {
  const { supabase } = useSupabase()
  const [remarks, setRemarks] = useState<RemarksTypes[] | []>([])
  const [systemLogs, setSystemLogs] = useState<RemarksTypes[] | []>([])
  const [viewLog, setViewLog] = useState(false)

  const handleInsertToList = (newData: RemarksTypes) => {
    setRemarks([...remarks, newData])
  }

  const handleRemoveFromList = async (id: string) => {
    setRemarks(prevList => prevList.filter(item => item.id !== id))
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('rdt_remarks')
          .select('*, rdt_users(name,avatar_url)')
          .eq('type', type)
          .eq('reference_id', referenceId)
          .order('id', { ascending: true })

        if (error) throw new Error(error.message)

        setRemarks(data.filter((d: RemarksTypes) => d.reply_type === null))
        setSystemLogs(data.filter((d: RemarksTypes) => d.reply_type === 'system'))
      } catch (e) {
        console.error(e)
      }
    }

    void fetchData()
  }, [])

  return (
    <>
      {/* Begin Main Content */}
        <div className='px-4 mt-8 lg:px-0 w-full relative'>
          <div className='w-full pb-10 border-t mx-auto outline-none overflow-x-hidden overflow-y-auto text-xs text-gray-600 bg-gray-100 dark:bg-gray-800 dark:text-gray-400'>
              <div className='px-4 py-2 text-sm font-semibold'>Remarks & Logs:</div>
              <div className='cursor-pointer ml-12 my-4 font-medium flex space-x-1 items-center text-blue-500' onClick={() => setViewLog(!viewLog)}>System Logs { !viewLog ? <ChevronDownIcon className='w-4 h-4'/> : <ChevronUpIcon className='w-4 h-4'/> }</div>
              {
                viewLog &&
                  systemLogs.map((item) => (
                    <SystemLog
                      key={uuid()}
                      remarks={item}/>
                  ))
              }
              {
                remarks.map((item) => (
                  <MessageBox
                    key={uuid()}
                    handleRemoveFromList={handleRemoveFromList}
                    remarks={item}/>
                ))
              }
              <WriteRemarks
                referenceId={referenceId}
                handleInsertToList={handleInsertToList}/>
          </div>
        </div>
    </>
  )
}
