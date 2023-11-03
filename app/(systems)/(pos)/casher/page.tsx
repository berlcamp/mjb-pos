'use client'
import { ConfirmModal, CustomButton, PosSideBar, Sidebar, TopBar, Unauthorized } from '@/components'
import type { ProductTypes } from '@/types'
import { MinusCircleIcon, PlusCircleIcon, XMarkIcon } from '@heroicons/react/20/solid'
import { useState } from 'react'
import { fullTextQuery } from '@/utils/text-helper'
import uuid from 'react-uuid'
import { useSupabase } from '@/context/SupabaseProvider'
import { useFilter } from '@/context/FilterContext'
import { superAdmins } from '@/constants'

const Page: React.FC = () => {
  const [search, setSearch] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<ProductTypes[] | []>([])
  const [cart, setCart] = useState<ProductTypes[] | []>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [cash, setCash] = useState('')
  const [terms, setTerms] = useState('0')
  const [customerName, setCustomerName] = useState('')
  const [change, setChange] = useState(0)
  const [paymentType, setPaymentType] = useState('cash')

  const [saving, setSaving] = useState(false)
  const [showConfirmCompleteModal, setShowConfirmCompleteModal] = useState(false)
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false)

  const [errorCustomer, setErrorCustomer] = useState('')

  const { supabase, session } = useSupabase()
  const { setToast, hasAccess } = useFilter()

  const handleSearch = async (text: string) => {
    setSearch(text)

    if (text.trim().length < 3) {
      return
    }

    setSearching(true)

    try {
      const { data: results, error } = await supabase
        .from('rdt_products')
        .select('*, rdt_product_categories(name), rdt_product_units(name)')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)
        .eq('status', 'Active')
        .or(`description.ilike.%${text}%`)
        .limit(10)

      if (error) throw new Error(error.message)

      const searchQuery: string = fullTextQuery(text)

      const { data: results2, error: error2 } = await supabase
        .from('rdt_products')
        .select('*, rdt_product_categories(name), rdt_product_units(name)')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)
        .eq('status', 'Active')
        .textSearch('fts', searchQuery)
        .limit(10)

      if (error2) throw new Error(error2.message)

      // remove duplicate values
      const resultsMerged = [...results, ...results2.filter((item2: ProductTypes) => !results.some((item1: ProductTypes) => item1.id === item2.id))]

      // exlude the products that is already on cart
      const resultsMergedFilterd = resultsMerged.filter(item => !cart.some(cartItem => cartItem.id === item.id))

      // display to results list
      setSearchResults(resultsMergedFilterd)
      setSearching(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleClear = () => {
    setSearch('')
    setSearchResults([])
  }

  const handleAddToCart = (product: ProductTypes) => {
    if (Number(product.available_stocks) < 1) return

    const productUpdated = { ...product, uuid: uuid(), quantity: 1, total: Number(product.price) }
    setCart([...cart, productUpdated])
    const total = cartTotal + Number(product.price)
    setCartTotal(total)
    handleTotalChange(total)
    handleClear()
  }

  const handleRemoveFromCart = (product: ProductTypes) => {
    const cartUpdated = cart.filter((c: ProductTypes) => c.uuid !== product.uuid)
    const total = cartTotal - Number(product.total)
    setCartTotal(total)
    handleTotalChange(total)
    setCart(cartUpdated)
  }

  const handleChangeQuantity = (value: string, product: ProductTypes) => {
    const qty = Number(value)
    if (Number(product.available_stocks) < qty || qty < 0) return // return if it exceeds available stocks

    const updatedCart = cart.map((p: ProductTypes) => {
      if (p.uuid === product.uuid) {
        return { ...p, quantity: qty, total: Number(product.price) * qty }
      }
      return p
    })
    setCart(updatedCart)
    const total = updatedCart.reduce((accumulator: number, p: ProductTypes) => accumulator + Number(p.total), 0) // get the sum of total price
    setCartTotal(total)
    handleTotalChange(total)
  }

  const handleAddQuantity = (product: ProductTypes) => {
    const qty = product.quantity + 1
    if (Number(product.available_stocks) < qty || qty < 0) return // return if it exceeds available stocks

    const updatedCart = cart.map((p: ProductTypes) => {
      if (p.uuid === product.uuid) {
        return { ...p, quantity: qty, total: Number(product.price) * qty }
      }
      return p
    })
    setCart(updatedCart)
    const total = cartTotal + Number(product.price)
    setCartTotal(total)
    handleTotalChange(total)
  }

  const handleDeductQuantity = (product: ProductTypes) => {
    if (product.quantity - 1 < 0) return

    const qty = product.quantity - 1
    const updatedCart = cart.map((p: ProductTypes) => {
      if (p.uuid === product.uuid) {
        return { ...p, quantity: qty, total: Number(product.price) * qty }
      }
      return p
    })
    setCart(updatedCart)
    const total = cartTotal - Number(product.price)
    setCartTotal(total)
    handleTotalChange(total)
  }

  const handleTotalChange = (total: number) => {
    const chnge = Number(cash) - total
    if (chnge >= 0) {
      setChange(chnge)
    } else {
      setChange(0)
    }
  }

  const handleConfirmComplete = () => {
    if (customerName === '') {
      setErrorCustomer('Customer Name is required.')
      return
    }
    setShowConfirmCompleteModal(true)
  }

  const handleConfirmCancel = () => {
    setShowConfirmCancelModal(true)
  }

  const handleCompletePurchase = async () => {
    if (saving) return

    setSaving(true)
    const productIds = cart.map((product: ProductTypes) => product.id)
    try {
      const { data: products, error } = await supabase
        .from('rdt_products')
        .select('id, available_stocks')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)
        .in('id', productIds)

      if (error) throw new Error(error.message)

      const productsUpdate = products.map((product: ProductTypes) => {
        // get the cart item
        const cartItem = cart.find(c => c.id.toString() === product.id.toString())
        // and create an array to update the available stocks of the product from database
        return { id: product.id, available_stocks: Number(product.available_stocks) - (cartItem !== undefined ? cartItem.quantity : 0) }
      })

      // update the available stock on products database
      const { error: error2 } = await supabase
        .from('rdt_products')
        .upsert(productsUpdate)

      if (error2) throw new Error(error2.message)

      // store to sales transaction
      const { data: transaction, error3 } = await supabase
        .from('rdt_sale_transactions')
        .insert({
          casher_id: session.user.id,
          customer_name: customerName,
          total: cartTotal,
          transaction_date: new Date(),
          org_id: process.env.NEXT_PUBLIC_ORG_ID,
          cash,
          terms,
          payment_type: paymentType
        })
        .select()

      if (error3) throw new Error(error3.message)

      // store each product to sales database
      const salesData = cart.map((product: ProductTypes) => {
        return {
          product_id: product.id,
          quantity: product.quantity,
          casher_id: session.user.id,
          unit_price: product.price,
          total: product.total,
          sale_transaction_id: transaction[0].id,
          transaction_date: new Date(),
          org_id: process.env.NEXT_PUBLIC_ORG_ID
        }
      })
      const { error4 } = await supabase
        .from('rdt_sales')
        .insert(salesData)

      if (error4) throw new Error(error3.message)

      setToast('success', 'Purchase completed successfully.')
      handleReset() // reset the form
      setSaving(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handleReset = () => {
    // reset all
    setCart([])
    setCartTotal(0)
    setCash('')
    setChange(0)
    setCustomerName('')
    setSearch('')
    setSearchResults([])

    setShowConfirmCancelModal(false)
    setShowConfirmCompleteModal(false)
  }

  // Check access from permission settings or Super Admins
  if (!(hasAccess('manage_pos') || hasAccess('cashers')) && !superAdmins.includes(session.user.email)) return <Unauthorized/>

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
                  <svg className="w-7 h-7 text-gray-500 -400" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path></svg>
                </div>
                <input
                  type='text'
                  value={search}
                  onChange={async e => await handleSearch(e.target.value)}
                  placeholder='Search product'
                  className='py-2 pl-10 w-full text-sm text-gray-900 bg-white rounded-lg border border-gray-300 outline-none'/>
                <button onClick={handleClear} className='px-2 py-2 ml-2 text-sm rounded-lg text-white bg-gray-700 whitespace-nowrap'>Clear Search</button>
              </div>
              {
                (search.trim().length > 2) &&
                  <div className="relative mt-1">
                    <table className="absolute z-10 w-full text-left shadow-md text-xs border border-gray-200">
                      <thead>
                        <tr className="bg-gray-700 text-white border-b">
                          <th scope="row" className="py-2 px-6 font-medium">
                            Product
                          </th>
                          <td className="py-2 px-6">
                            Unit
                          </td>
                          <td className="py-2 px-6">
                            Available Stocks
                          </td>
                          <td className="py-2 px-6">
                            Price
                          </td>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          searching
                            ? <tr className="bg-gray-600 text-white border-b hover:bg-gray-500 cursor-pointer">
                                <td className="py-2 text-center" colSpan={4}>Searching</td>
                              </tr>
                            : <>
                                {
                                  searchResults.length === 0
                                    ? <tr className="bg-gray-600 text-white border-b hover:bg-gray-500 cursor-pointer">
                                        <td className="py-2 text-center" colSpan={4}>No product match found.</td>
                                      </tr>
                                    : <>
                                        {
                                          searchResults.map((product: ProductTypes, index: number) =>
                                            <tr key={index}
                                              onClick={() => handleAddToCart(product)}
                                              className="bg-gray-600 text-white border-b hover:bg-gray-500 cursor-pointer">
                                              <th scope="row" className="py-2 px-6 font-medium">
                                                <div className='text-sm'>{product.description}</div>
                                                <div className="text-[10px] font-light text-white">{product.rdt_product_categories?.name}</div>
                                              </th>
                                              <td className="py-2 px-6">
                                                <div>{product.rdt_product_units?.name}</div>
                                              </td>
                                              <td className="py-2 px-6">
                                                {
                                                  Number(product.available_stocks) < 1
                                                    ? <span className='px-1 py-px bg-white rounded-full text-gray-700'>Out of Stock</span>
                                                    : <span>{Number(product.available_stocks).toLocaleString('en-US')}</span>
                                                }
                                              </td>
                                              <td className="py-2 px-6">
                                                <span className='font-bold text-sm'>{Number(product.price).toLocaleString('en-US')}</span>
                                              </td>
                                            </tr>
                                          )
                                        }
                                      </>
                                }
                              </>
                        }
                      </tbody>
                    </table>
                  </div>
              }
            </div>
            {/* End Search results */}
            <div className='mt-8 mx-2'>
              {
                cart.length === 0
                  ? <div>No item in the cart</div>
                  : <>
                      <table className="app__table">
                        <thead className="app__thead">
                          <tr>
                            <th className="hidden md:table-cell app__th"></th>
                            <th className="hidden md:table-cell app__th">
                                Product
                            </th>
                            <th className="hidden md:table-cell app__th">
                                Unit
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
                          </tr>
                        </thead>
                        <tbody>
                          {
                            cart.map((product: ProductTypes, index: number) =>
                              <tr key={index} className="app__tr">
                                <td className="app__td">
                                  <XMarkIcon onClick={() => handleRemoveFromCart(product)} className='w-5 h-5 text-red-800 bg-red-200 border rounded-sm border-red-600 cursor-pointer'/>
                                </td>
                                <th className="app__td">
                                  <div className='text-sm'>{product.description}</div>
                                  <div className="text-[10px] font-light">Available Stocks: {product.available_stocks}</div>
                                  {/* Mobile View */}
                                  <div>
                                    <div className="md:hidden app__td_mobile">
                                      <div>Unit: {product.rdt_product_units?.name}</div>
                                      <div>Price: {product.price}</div>
                                      <div>Quantity:</div>
                                      <div className='flex items-center justify-start space-x-2'>
                                        <PlusCircleIcon onClick={() => handleAddQuantity(product)} className='w-6 h-6 text-green-600 cursor-pointer'/>
                                        <input
                                          type='number'
                                          onChange={e => handleChangeQuantity(e.target.value, product)}
                                          className='font-bold text-lg outline-none appearance-none w-14'
                                          value={product.quantity}/>
                                        <MinusCircleIcon onClick={() => handleDeductQuantity(product)} className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                                      </div>
                                      <div>Total: {Number(product.total).toLocaleString('en-US')}</div>
                                    </div>
                                  </div>
                                  {/* End - Mobile View */}

                                </th>
                                <td className="hidden md:table-cell app__td">
                                  <span className='text-lg'>{product.rdt_product_units?.name}</span>
                                </td>
                                <td className="hidden md:table-cell app__td">
                                  <span className='text-lg'>{Number(product.price).toLocaleString('en-US')}</span>
                                </td>
                                <td className="hidden md:table-cell app__td">
                                  <div className='flex items-center justify-center space-x-2'>
                                    <PlusCircleIcon onClick={() => handleAddQuantity(product)} className='w-6 h-6 text-green-600 cursor-pointer'/>
                                    <input
                                      type='number'
                                      onChange={e => handleChangeQuantity(e.target.value, product)}
                                      className='font-bold text-lg outline-none appearance-none w-14'
                                      value={product.quantity}/>
                                    <MinusCircleIcon onClick={() => handleDeductQuantity(product)} className='w-6 h-6 text-cyan-900 cursor-pointer'/>
                                  </div>
                                </td>
                                <td className="hidden md:table-cell app__td">
                                  <span className='font-bold text-lg'>{Number(product.total).toLocaleString('en-US')}</span>
                                </td>
                              </tr>
                            )
                          }
                        </tbody>
                      </table>
                    </>
              }
            </div>
          </div>
        </div>
        <div className='w-full md:w-1/3'>
          <div className='w-full bg-green-600 px-4 py-2'>
            <div className='text-white text-xl'>Total: <span className='font-bold text-4xl'>{Number(cartTotal).toLocaleString('en-US')}</span></div>
          </div>
          {
            (cartTotal < 1)
              ? <div className='p-4 bg-gray-100 border border-gray-200 shadow-md'>
                  No item in the cart
                </div>
              : <>
                  <div className='p-4 bg-gray-100 border border-gray-200 shadow-md'>
                    <div className='font-medium'>Customer Name:</div>
                    <div className='mt-2'>
                      <input
                        type='text'
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                        placeholder='Customer Name'
                        className='p-2 w-full text-gray-900  rounded-lg border border-gray-300 outline-none'/>
                    </div>
                    {
                      errorCustomer !== '' && <div className='app__error_message'>{errorCustomer}</div>
                    }
                    <div className='font-medium mt-6'>Type of Payment</div>
                    <div className='mt-2'>
                      <div className="flex space-x-4">
                        <label className='flex space-x-2'>
                          <input
                            type="radio"
                            checked={paymentType === 'cash'}
                            onChange={() => setPaymentType('cash')}
                            className="focus:ring-0"/>
                          <span>Cash</span>
                        </label>
                        <label className='flex space-x-2'>
                          <input
                            type="radio"
                            checked={paymentType === 'credit'}
                            onChange={() => setPaymentType('credit')}
                            className="focus:ring-0"/>
                          <span>Credit</span>
                        </label>
                      </div>
                    </div>
                    {
                      paymentType === 'cash' &&
                        <>
                          <div className='font-medium mt-6'>Cash:</div>
                          <div className='mt-2'>
                            <input
                              type='number'
                              step='any'
                              value={cash}
                              onChange={e => {
                                setCash(e.target.value)
                                const chnge = Number(e.target.value) - cartTotal
                                if (chnge >= 0) {
                                  setChange(chnge)
                                } else {
                                  setChange(0)
                                }
                              }}
                              placeholder='Cash'
                              className='p-2 w-full text-gray-900  rounded-lg border border-gray-300 outline-none'/>
                          </div>
                          <div className='font-medium mt-6'>Change:</div>
                          <div className='mt-2 text-xl p-3 bg-green-300'>
                            <span className='font-bold text-2xl'>{Number(change).toLocaleString('en-US')}</span>
                          </div>
                        </>
                    }
                    {
                      paymentType === 'credit' &&
                        <>
                          <div className='font-medium mt-6'>Credit Terms (Days)</div>
                          <div className='mt-2'>
                            <input
                              type='number'
                              placeholder='Days'
                              value={terms}
                              onChange={e => setTerms(e.target.value)}
                              className='p-2 w-full text-gray-900  rounded-lg border border-gray-300 outline-none'/>
                          </div>
                        </>
                    }
                    <div className='font-medium mt-6 flex space-x-4'>
                      {
                        ((paymentType === 'cash' && Number(cash) >= cartTotal) || (paymentType === 'credit')) &&
                          <CustomButton
                              containerStyles='bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-500 border border-emerald-600 font-bold px-2 py-2 text-sm text-white rounded-sm'
                              title='Complete Purchase'
                              btnType='button'
                              handleClick={handleConfirmComplete}
                            />
                      }
                      <CustomButton
                          containerStyles='bg-red-500 hover:bg-red-600 active:bg-red-500 border border-red-600 font-bold px-2 py-2 text-sm text-white rounded-sm'
                          title='Cancel Purchase'
                          btnType='button'
                          handleClick={handleConfirmCancel}
                        />
                    </div>
                  </div>
                </>
          }
        </div>
      </div>
    </div>
    {/* Confirm Complete Modal */}
    {
      showConfirmCompleteModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Confirm this purchase?"
          onConfirm={handleCompletePurchase}
          onCancel={() => setShowConfirmCompleteModal(false)}
        />
      )
    }
    {/* Confirm Cancel Modal */}
    {
      showConfirmCancelModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Are you sure you want to cancel this transaction?"
          onConfirm={handleReset}
          onCancel={() => setShowConfirmCancelModal(false)}
        />
      )
    }
  </>
  )
}
export default Page
