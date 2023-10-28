import React, { useState } from 'react'
import { CustomButton } from '@/components'

interface FilterTypes {
  setFilterKeyword: (keyword: string) => void
  setFilterDate: (date: string) => void
}

const Filters = ({ setFilterKeyword, setFilterDate }: FilterTypes) => {
  const [keyword, setKeyword] = useState<string>('')
  const [date, setDate] = useState<string>('')

  const handleApply = () => {
    if (keyword.trim() === '' && date === '') return

    // pass filter values to parent
    setFilterKeyword(keyword)
    setFilterDate(date)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (keyword.trim() === '' && date === '') return

    // pass filter values to parent
    setFilterKeyword(keyword)
    setFilterDate(date)
  }

  // clear all filters
  const handleClear = () => {
    setFilterKeyword('')
    setKeyword('')
    setFilterDate('')
    setDate('')
  }

  return (
    <div className=''>
      <div className='items-center space-x-2 space-y-1'>
        <form onSubmit={handleSubmit} className='items-center space-y-1'>
          <div className='app__filter_container'>
            {/* <MagnifyingGlassIcon className="w-4 h-4 mr-1"/> */}
            <input
              type='text'
              placeholder='Reference Code'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              className="app__filter_input"/>
          </div>
          <div className='app__filter_container'>
            <span className='text-xs text-gray-600'>Date:</span>
            <input
              type='date'
              value={date}
              onChange={e => setDate(e.target.value)}
              className="app__filter_date"/>
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
