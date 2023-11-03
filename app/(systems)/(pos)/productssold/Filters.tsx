import React, { useEffect, useState } from 'react'
import { CustomButton } from '@/components'
import { useSupabase } from '@/context/SupabaseProvider'
import type { AccountTypes } from '@/types'

interface FilterTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterStatus: (status: string) => void
  setFilterDateFrom: (date: string) => void
  setFilterDateTo: (date: string) => void
  setFilterCasher: (casher: string) => void
}

const Filters = ({ setFilterKeyword, setFilterStatus, setFilterDateFrom, setFilterDateTo, setFilterCasher }: FilterTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [dateFrom, setDateFrom] = useState<string>(new Date().toISOString().split('T')[0])
  const [dateTo, setDateTo] = useState<string>(new Date().toISOString().split('T')[0])
  const [casher, setCasher] = useState<string>('')

  const [cashers, setCashers] = useState<AccountTypes[] | []>([])

  const { supabase } = useSupabase()

  const handleApply = () => {
    if (keyword.trim() === '' && status === '' && dateFrom === '' && dateTo === '' && casher === '') return

    // pass filter values to parent
    setFilterKeyword(keyword)
    setFilterStatus(status)
    setFilterDateFrom(dateFrom)
    setFilterDateTo(dateTo)
    setFilterCasher(casher)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (keyword.trim() === '' && status === '' && dateFrom === '' && dateTo === '' && casher === '') return

    // pass filter values to parent
    setFilterKeyword(keyword)
    setFilterStatus(status)
    setFilterDateFrom(dateFrom)
    setFilterDateTo(dateTo)
    setFilterCasher(casher)
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterStatus('')
    setStatus('')
    setFilterDateFrom('')
    setDateFrom('')
    setFilterDateTo('')
    setDateTo('')
    setFilterCasher('')
    setCasher('')
  }

  useEffect(() => {
    // fetch cashers
    void (async () => {
      try {
        const { data, error } = await supabase
          .from('rdt_users')
          .select()
          .neq('email', 'berlcamp@gmail.com')
          .eq('status', 'Active')

        if (error) throw new Error(error.message)
        setCashers(data)
      } catch (e) {
        console.error(e)
      }
    })()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className=''>
      <div className='items-center space-x-2 space-y-1'>
        <form onSubmit={handleSubmit} className='items-center space-y-1'>
          <div className='app__filter_container'>
            {/* <MagnifyingGlassIcon className="w-4 h-4 mr-1"/> */}
            <input
              type='text'
              placeholder='Search product'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_input"/>
          </div>
          <div className='app__filter_container'>
            <span className='text-xs text-gray-600'>From:</span>
            <input
              type='date'
              value={dateFrom}
              onChange={e => setDateFrom(e.target.value)}
              className="app__filter_date"/>
          </div>
          <div className='app__filter_container'>
            <span className='text-xs text-gray-600'>To:</span>
            <input
              type='date'
              value={dateTo}
              onChange={e => setDateTo(e.target.value)}
              className="app__filter_date"/>
          </div>
          <div className='hidden'>
            <span className='text-xs text-gray-600'>Status:</span>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="app__filter_select">
                <option>All</option>
                <option>Cancelled</option>
            </select>
          </div>
          <div className='app__filter_container'>
            <span className='text-xs text-gray-600'>Casher:</span>
            <select
              value={casher}
              onChange={e => setCasher(e.target.value)}
              className="app__filter_select">
                <option value=''>All</option>
                {
                  cashers.map((user: AccountTypes, index) =>
                    <option key={index} value={user.id}>{user.name}</option>
                  )
                }
            </select>
          </div>
        </form>
      </div>
      <div className='flex items-center space-x-2 mt-4'>
        <CustomButton
              containerStyles='app__btn_green'
              title='Apply Filter'
              btnType='button'
              handleClick={handleApply}
            />
          <CustomButton
              containerStyles='app__btn_gray'
              title='Clear Filter'
              btnType='button'
              handleClick={handleClear}
            />
      </div>
    </div>
  )
}

export default Filters
