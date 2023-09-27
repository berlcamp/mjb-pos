import { useSupabase } from '@/context/SupabaseProvider'
import { XMarkIcon } from '@heroicons/react/24/solid'
import React, { useState } from 'react'
import uuid from 'react-uuid'

import type { SelectUserNamesProps, accountNamesType } from '@/types'

export default function SelectUserNames ({ settingsData, multiple, type, handleManagerChange, title }: SelectUserNamesProps) {
  const { supabase, systemUsers } = useSupabase()

  const [searchManager, setSearchManager] = useState('')
  const [searchManagersResults, setSearchManagersResults] = useState<[]>([])
  const [selectedManagers, setSelectedManagers] = useState(settingsData.length > 0 ? settingsData[0].data : [])

  const handleSearchUser = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchManager('')

    setSearchManager(e.target.value)

    if (e.target.value.trim().length < 3) {
      setSearchManagersResults([])
      return
    }

    const searchSplit = (e.target.value).split(' ')

    let query = supabase
      .from('rdt_users')
      .select('id, name')
      .eq('status', 'Active')
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    searchSplit.forEach(item => {
      query = query.or(`name.ilike.%${item}%`)
    })

    // Excluded already selected items
    selectedManagers?.forEach((item: accountNamesType) => {
      query = query.neq('id', item.id)
    })

    // Limit results
    query = query.limit(3)

    const { data, error } = await query

    if (error) console.error(error)

    data ? setSearchManagersResults(data) : setSearchManagersResults([])
  }

  const handleSelected = (item: accountNamesType) => {
    let newItems = []
    if (multiple) {
      newItems = [...selectedManagers, { ...item, uuid: uuid() }]
    } else {
      newItems = [{ ...item, uuid: uuid() }]
    }

    setSelectedManagers(newItems)

    // Update selected items from parent component
    handleManagerChange(newItems, type)

    // Resets
    setSearchManagersResults([])

    setSearchManager('')
  }

  const handleRemoveSelected = (uuid: string) => {
    const updatedItems = selectedManagers?.filter((item: accountNamesType) => item.uuid !== uuid)
    setSelectedManagers(updatedItems)

    // Update selected items from parent component
    handleManagerChange(updatedItems, type)
  }

  const capitalizeWords = (inputString: string) => {
    return inputString
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  const getUserNamesFromSystemUsersContext = (id: string) => {
    //
    const users: accountNamesType[] = systemUsers.filter((x: accountNamesType) => x.id.toString() === id.toString())

    if (users.length > 0) {
      return capitalizeWords(users[0].name.toString())
    } else {
      return ''
    }
  }

  return (
    <div className='app__form_field_container'>
      <div className='w-full'>
        <div className='app__label_standard'>{title}:</div>
        <div className='bg-white p-1 border border-gray-300 rounded-sm'>
          <div className='space-x-2'>
          {
            selectedManagers.map((item: accountNamesType) => (
                <div key={uuid()} className='mb-1 inline-flex'>
                  <span className='inline-flex items-center text-sm  border border-gray-400 rounded-sm px-1 bg-gray-300'>
                    {getUserNamesFromSystemUsersContext(item.id)}
                    <XMarkIcon onClick={() => handleRemoveSelected(item.uuid)} className='w-4 h-4 ml-2 cursor-pointer'/>
                  </span>
                </div>
            ))
          }
          </div>
          <div className='relative'>
            <input
              type="text"
              placeholder='Search User'
              value={searchManager}
              onChange={async (e) => await handleSearchUser(e)}
              className='w-full text-sm py-1 px-2 text-gray-600 rounded-sm focus:ring-0 focus:outline-none dark:bg-gray-900 dark:text-gray-300'/>

              {
                searchManagersResults.length > 0 &&
                  <div className='absolute top-7 left-0 z-50 w-full bg-gray-200 border border-gray-300'>
                    {
                      searchManagersResults.map((item: accountNamesType) => (
                        <div
                          key={uuid()}
                          onClick={() => handleSelected(item)}
                          className='p-1 w-full text-gray-700 cursor-pointer hover:bg-gray-300 text-sm'>
                            {item.name}
                        </div>
                      ))
                    }
                  </div>
              }
          </div>
        </div>
      </div>
    </div>
  )
}
