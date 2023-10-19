import React, { useState } from 'react'
import { CustomButton } from '@/components'

interface FilterTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterStatus: (status: string) => void
  setFilterDate: (date: string) => void
  setFilterCasher: (casher: string) => void
}

const Filters = ({ setFilterKeyword, setFilterStatus, setFilterDate, setFilterCasher }: FilterTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [status, setStatus] = useState<string>('')
  const [date, setDate] = useState<string>('')
  const [casher, setCasher] = useState<string>('')

  const handleApply = () => {
    if (keyword.trim() === '' && status === '' && date === '' && casher === '') return

    // pass filter values to parent
    setFilterKeyword(keyword)
    setFilterStatus(status)
    setFilterDate(date)
    setFilterCasher(casher)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (keyword.trim() === '' && status === '' && date === '' && casher === '') return

    // pass filter values to parent
    setFilterKeyword(keyword)
    setFilterStatus(status)
    setFilterDate(date)
    setFilterCasher(casher)
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterStatus('')
    setStatus('')
    setFilterDate('')
    setDate('')
    setFilterCasher('')
    setCasher('')
  }

  return (
    <div className=''>
      <div className='items-center space-x-2 space-y-1'>
        <form onSubmit={handleSubmit} className='items-center space-y-1'>
          <div className='app__filter_container'>
            {/* <MagnifyingGlassIcon className="w-4 h-4 mr-1"/> */}
            <input
              type='text'
              placeholder='Search customer'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_input"/>
          </div>
          <div className='app__filter_container'>
            <input
              type='date'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_date"/>
          </div>
          <div className='app__filter_container'>
            <select
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_select">
                <option>All</option>
                <option>Cancelled</option>
            </select>
          </div>
          <div className='app__filter_container'>
            <select
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_select">
                <option>All</option>
                <option>Cancelled</option>
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
