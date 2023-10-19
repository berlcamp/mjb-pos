'use client'
import { CustomButton, PosSideBar, Sidebar, TopBar } from '@/components'
import { MinusCircleIcon, PlusCircleIcon, XCircleIcon } from '@heroicons/react/20/solid'

const Page: React.FC = () => {
  return (
    <>
    <Sidebar>
      <PosSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div className='md:flex md:space-x-4 space-y-2 md:space-y-0 mx-2'>
        <div className='w-full md:w-2/3'>
          {/* Box title */}
          <div className='w-full bg-gray-700 px-4 py-2'>
            <span className='text-white'>Purchase Items</span>
          </div>
          <div className='p-4 bg-gray-100 border border-gray-200 shadow-md'>
            {/* Search box */}
            <div className=''>
              <div className='relative flex items-center'>
                <div className="flex absolute inset-y-0 left-0 items-center pl-3 pointer-events-none">
                  <svg className="w-7 h-7 text-gray-500 -400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd"></path></svg>
                </div>
                <input
                  type='text'
                  placeholder='Search product'
                  className='py-2 pl-10 w-full text-sm text-gray-900 bg-gray-100 rounded-lg border border-gray-300 outline-none'/>
                <button className='px-2 py-2 ml-2 text-sm rounded-lg text-white bg-gray-700 whitespace-nowrap'>Clear Search</button>
              </div>
              <div className="relative mt-1">
                <table className="absolute z-10 w-full text-left shadow-md text-xs border border-gray-200">
                  <tbody>
                    <tr className="bg-gray-600 text-white border-b hover:bg-gray-500 cursor-pointer">
                      <th scope="row" className="py-4 px-6 font-medium">
                        <p>Boysen</p>
                        <p className="text-sm font-light text-white">Category: Paint</p>
                      </th>
                      <td className="py-4 px-6">
                        <div>Red: 232</div>
                        <div>Blue: 11</div>
                      </td>
                      <td className="py-4 px-6">
                        <span>Stock: 23</span>
                      </td>
                      <td className="py-4 px-6">
                        100.0
                      </td>
                    </tr>
                    <tr className="bg-gray-600 text-white border-b hover:bg-gray-500 cursor-pointer">
                      <th scope="row" className="py-4 px-6 font-medium">
                        <p>Boysen</p>
                        <p className="text-sm font-light text-white">Category: Paint</p>
                      </th>
                      <td className="py-4 px-6">
                        <div>Red: 232</div>
                        <div>Blue: 11</div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2 py-1 rounded-full bg-white text-sky-900 font-bold whitespace-nowrap">Out of Stock</span>
                      </td>
                      <td className="py-4 px-6">
                        100.0
                      </td>
                    </tr>
                  </tbody>
                </table>
            </div>
            </div>
            {/* Search results */}
            <div className='mt-8 mx-2'>
              <table className="app__table">
                <thead className="app__thead">
                  <tr>
                    <th className="hidden md:table-cell app__th">
                        Product
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Variation
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Price
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Quantity
                    </th>
                    <th className="hidden md:table-cell app__th">
                        Total
                    </th>
                    <th className="hidden md:table-cell app__th"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="app__tr">
                    <th className="app__th_firstcol">
                      <div>Boysen</div>
                      <div>Paint</div>
                      {/* Mobile View */}
                      <div>
                        <div className="md:hidden app__td_mobile">
                          <div>Red</div>
                          <div>250</div>
                          <div>Qty</div>
                          <div>250</div>
                        </div>
                      </div>
                      {/* End - Mobile View */}

                    </th>
                    <td className="hidden md:table-cell app__td">
                      Red
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <span className='font-bold text-sm'>1</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <div className='flex items-center justify-center space-x-2'>
                        <PlusCircleIcon className='w-6 h-6 text-green-600 cursor-pointer'/>
                        <span className='font-bold text-sm'>1</span>
                        <MinusCircleIcon className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                      </div>
                    </td>
                    <td className="hidden md:table-cell app__td">
                    <span className='font-bold text-sm'>100</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <XCircleIcon className='w-6 h-6 text-red-600 cursor-pointer'/>
                    </td>
                  </tr>
                  <tr className="app__tr">
                    <th className="app__th_firstcol">
                      <div>Boysen</div>
                      <div>Paint</div>
                      {/* Mobile View */}
                      <div>
                        <div className="md:hidden app__td_mobile">
                          <div>Red</div>
                          <div>250</div>
                          <div>Qty</div>
                          <div>250</div>
                        </div>
                      </div>
                      {/* End - Mobile View */}

                    </th>
                    <td className="hidden md:table-cell app__td">
                      Red
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <span className='font-bold text-sm'>1</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <div className='flex items-center justify-center space-x-2'>
                        <PlusCircleIcon className='w-6 h-6 text-green-600 cursor-pointer'/>
                        <span className='font-bold text-sm'>1</span>
                        <MinusCircleIcon className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                      </div>
                    </td>
                    <td className="hidden md:table-cell app__td">
                    <span className='font-bold text-sm'>100</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <XCircleIcon className='w-6 h-6 text-red-600 cursor-pointer'/>
                    </td>
                  </tr>
                  <tr className="app__tr">
                    <th className="app__th_firstcol">
                      <div>Boysen</div>
                      <div>Paint</div>
                      {/* Mobile View */}
                      <div>
                        <div className="md:hidden app__td_mobile">
                          <div>Red</div>
                          <div>250</div>
                          <div>Qty</div>
                          <div>250</div>
                        </div>
                      </div>
                      {/* End - Mobile View */}

                    </th>
                    <td className="hidden md:table-cell app__td">
                      Red
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <span className='font-bold text-sm'>1</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <div className='flex items-center justify-center space-x-2'>
                        <PlusCircleIcon className='w-6 h-6 text-green-600 cursor-pointer'/>
                        <span className='font-bold text-sm'>1</span>
                        <MinusCircleIcon className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                      </div>
                    </td>
                    <td className="hidden md:table-cell app__td">
                    <span className='font-bold text-sm'>100</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <XCircleIcon className='w-6 h-6 text-red-600 cursor-pointer'/>
                    </td>
                  </tr>
                  <tr className="app__tr">
                    <th className="app__th_firstcol">
                      <div>Boysen</div>
                      <div>Paint</div>
                      {/* Mobile View */}
                      <div>
                        <div className="md:hidden app__td_mobile">
                          <div>Red</div>
                          <div>250</div>
                          <div>Qty</div>
                          <div>250</div>
                        </div>
                      </div>
                      {/* End - Mobile View */}

                    </th>
                    <td className="hidden md:table-cell app__td">
                      Red
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <span className='font-bold text-sm'>1</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <div className='flex items-center justify-center space-x-2'>
                        <PlusCircleIcon className='w-6 h-6 text-green-600 cursor-pointer'/>
                        <span className='font-bold text-sm'>1</span>
                        <MinusCircleIcon className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                      </div>
                    </td>
                    <td className="hidden md:table-cell app__td">
                    <span className='font-bold text-sm'>100</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <XCircleIcon className='w-6 h-6 text-red-600 cursor-pointer'/>
                    </td>
                  </tr>
                  <tr className="app__tr">
                    <th className="app__th_firstcol">
                      <div>Boysen</div>
                      <div>Paint</div>
                      {/* Mobile View */}
                      <div>
                        <div className="md:hidden app__td_mobile">
                          <div>Red</div>
                          <div>250</div>
                          <div>Qty</div>
                          <div>250</div>
                        </div>
                      </div>
                      {/* End - Mobile View */}

                    </th>
                    <td className="hidden md:table-cell app__td">
                      Red
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <span className='font-bold text-sm'>1</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <div className='flex items-center justify-center space-x-2'>
                        <PlusCircleIcon className='w-6 h-6 text-green-600 cursor-pointer'/>
                        <span className='font-bold text-sm'>1</span>
                        <MinusCircleIcon className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                      </div>
                    </td>
                    <td className="hidden md:table-cell app__td">
                    <span className='font-bold text-sm'>100</span>
                    </td>
                    <td className="hidden md:table-cell app__td">
                      <XCircleIcon className='w-6 h-6 text-red-600 cursor-pointer'/>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className='w-full md:w-1/3'>
          <div className='w-full bg-green-600 px-4 py-2'>
            <span className='text-white font-semibold'>TOTAL: 450.0</span>
          </div>
          <div className='p-4 bg-gray-100 border border-gray-200 shadow-md'>
            <div className='font-medium'>CUSTOMER NAME</div>
            <div className='mt-2'>
              <input
                type='text'
                placeholder='Customer Name'
                className='p-2 w-full text-gray-900  rounded-lg border border-gray-300 outline-none'/>
            </div>
            <div className='font-medium mt-6'>CASH</div>
            <div className='mt-2'>
              <input
                type='number'
                step='any'
                placeholder='Cash'
                className='p-2 w-full text-gray-900  rounded-lg border border-gray-300 outline-none'/>
            </div>
            <div className='font-medium mt-6'>CHANGE:</div>
            <div className='mt-2 text-xl p-3 bg-green-300'>
              <span className='font-bold'>0.0</span>
            </div>
            <div className='font-medium mt-6 flex space-x-4'>
              <CustomButton
                    containerStyles='bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-500 border border-emerald-600 font-bold px-2 py-2 text-sm text-white rounded-sm'
                    title='Complete Purchase'
                    btnType='button'
                  />
              <CustomButton
                    containerStyles='bg-red-500 hover:bg-red-600 active:bg-red-500 border border-red-600 font-bold px-2 py-2 text-sm text-white rounded-sm'
                    title='Cancel Purchase'
                    btnType='button'
                  />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}
export default Page
