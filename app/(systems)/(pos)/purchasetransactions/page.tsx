'use client'

import {
  ConfirmModal,
  CustomButton,
  PerPage,
  PosSideBar,
  ShowMore,
  Sidebar,
  TableRowLoading,
  Title,
  TopBar,
  Unauthorized,
  UserBlock,
} from '@/components'
import { superAdmins } from '@/constants'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
import { fetchSaleTransactions } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import uuid from 'react-uuid'
import Filters from './Filters'
// Types
import type { ProductTypes, SalesTypes, TransactionTypes } from '@/types'

// Redux imports
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { Menu, Transition } from '@headlessui/react'
import {
  CheckCircleIcon,
  ChevronDownIcon,
  TrashIcon,
  TruckIcon,
} from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { useDispatch, useSelector } from 'react-redux'
import ProductsModal from './ProductsModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<TransactionTypes[]>([])

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')
  const [filterCasher, setFilterCasher] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')
  const [filterPaymentType, setFilterPaymentType] = useState<string>('')

  const [showProductsModal, setShowProductsModal] = useState(false)
  const [showConfirmCancelModal, setShowConfirmCancelModal] = useState(false)
  const [showConfirmPaidModal, setShowConfirmPaidModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [sales, setSales] = useState<SalesTypes[] | []>([])

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // summary
  const [totalSales, setTotalSales] = useState(0)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { supabase, session } = useSupabase()
  const { setToast, hasAccess } = useFilter()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchSaleTransactions(
        {
          filterKeyword,
          filterStatus,
          filterDate,
          filterCasher,
          filterPaymentType,
        },
        perPageCount,
        0
      )

      // update the list in redux
      dispatch(updateList(result.data))

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: result.data.length,
          results: result.count ? result.count : 0,
        })
      )

      // summary
      const summary = await fetchSaleTransactions(
        {
          filterKeyword,
          filterStatus,
          filterDate,
          filterCasher,
          filterPaymentType,
        },
        0,
        0
      )
      const salesTotal = summary.data.reduce(
        (accumulator, sale: SalesTypes) => {
          if (sale.status !== 'Cancelled') {
            return accumulator + Number(sale.total)
          } else {
            return accumulator
          }
        },
        0
      ) // get the sum of total price
      setTotalSales(salesTotal)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // Append data to existing list whenever 'show more' button is clicked
  const handleShowMore = async () => {
    setLoading(true)

    try {
      const result = await fetchSaleTransactions(
        { filterKeyword, filterStatus, filterCasher },
        perPageCount,
        list.length
      )

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      // Updating showing text in redux
      dispatch(
        updateResultCounter({
          showing: newList.length,
          results: result.count ? result.count : 0,
        })
      )
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  // view purchased products in modal
  const handleViewSales = (sales: SalesTypes[]) => {
    setSales(sales)
    setShowProductsModal(true)
  }

  const handleCancel = (id: string) => {
    setSelectedId(id)
    setShowConfirmCancelModal(true)
  }

  const handlePaid = (id: string) => {
    setSelectedId(id)
    setShowConfirmPaidModal(true)
  }

  const handleCancelConfirmed = async () => {
    try {
      // update purchase transaction status to "Cancelled"
      const { error } = await supabase
        .from('rdt_sale_transactions')
        .update({ status: 'Cancelled' })
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // return the product stocks
      const { data: sales, error: error2 } = await supabase
        .from('rdt_sales')
        .update({ status: 'Cancelled' })
        .eq('sale_transaction_id', selectedId)
        .select()

      if (error2) throw new Error(error2.message)

      const productIds: string[] = []
      sales.forEach((product: SalesTypes) => {
        productIds.push(product.product_id)
      })

      const { data: products, error: error3 } = await supabase
        .from('rdt_products')
        .select()
        .in('id', productIds)

      if (error3) throw new Error(error3.message)

      if (session.user.email !== 'berlcamp@gmail.com') {
        // create upsert array to update product stocks
        const upsertData = products.map((product: ProductTypes) => {
          const p: SalesTypes = sales.find(
            (s: SalesTypes) => s.product_id === product.id
          )
          const stocks = Number(product.available_stocks) + Number(p.quantity)
          return { id: product.id, available_stocks: stocks }
        })

        // update the product stocks in the database
        const { error4 } = await supabase
          .from('rdt_products')
          .upsert(upsertData)

        if (error4) throw new Error(error4.message)
      }

      // Update data in redux
      const items = [...globallist]
      const updatedData = { status: 'Cancelled', id: selectedId }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully cancelled.')
      setShowConfirmCancelModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  const handlePaidConfirmed = async () => {
    try {
      // update purchase transaction status to "Paid"
      const { error } = await supabase
        .from('rdt_sale_transactions')
        .update({ status: 'Paid' })
        .eq('id', selectedId)

      if (error) throw new Error(error.message)

      // Update data in redux
      const items = [...globallist]
      const updatedData = { status: 'Paid', id: selectedId }
      const foundIndex = items.findIndex((x) => x.id === updatedData.id)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully saved.')
      setShowConfirmPaidModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  // Update list whenever list in redux updates
  useEffect(() => {
    setList(globallist)
  }, [globallist])

  // Featch data
  useEffect(() => {
    setList([])
    void fetchData()

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filterKeyword,
    perPageCount,
    filterDate,
    filterStatus,
    filterCasher,
    filterPaymentType,
  ])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (
    !(hasAccess('manage_pos') || hasAccess('cashers')) &&
    !superAdmins.includes(session.user.email)
  )
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <PosSideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Purchase Transactions" />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterDate={setFilterDate}
              setFilterStatus={setFilterStatus}
              setFilterPaymentType={setFilterPaymentType}
              setFilterCasher={setFilterCasher}
            />
          </div>

          {/* Totals */}
          <div className="px-4 pb-4 flex items-center justify-end space-x-2">
            <div className="text-xs font-semibold bg-green-100 border border-green-400 px-2 py-px rounded-lg">
              Total Sales:{' '}
              <span className="font-bold text-lg">
                {Number(totalSales).toLocaleString('en-US')}
              </span>
            </div>
          </div>

          {/* Per Page */}
          <PerPage
            showingCount={resultsCounter.showing}
            resultsCount={resultsCounter.results}
            perPageCount={perPageCount}
            setPerPageCount={setPerPageCount}
          />

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                <tr>
                  <th className="hidden md:table-cell app__th pl-4"></th>
                  <th className="hidden md:table-cell app__th_firstcol">
                    Customer
                  </th>
                  <th className="hidden md:table-cell app__th">Date</th>
                  <th className="hidden md:table-cell app__th">Status</th>
                  <th className="hidden md:table-cell app__th">Payment Type</th>
                  <th className="hidden md:table-cell app__th">Cash</th>
                  <th className="hidden md:table-cell app__th">Change</th>
                  <th className="hidden md:table-cell app__th">Total Amount</th>
                  <th className="hidden md:table-cell app__th">Casher</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: TransactionTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <td className="w-6 pl-4 app__td">
                        <Menu
                          as="div"
                          className="app__menu_container">
                          <div>
                            <Menu.Button className="app__dropdown_btn">
                              <ChevronDownIcon
                                className="h-5 w-5"
                                aria-hidden="true"
                              />
                            </Menu.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95">
                            <Menu.Items className="app__dropdown_items">
                              <div className="py-1">
                                <Menu.Item>
                                  <div
                                    onClick={() =>
                                      handleViewSales(item.rdt_sales)
                                    }
                                    className="app__dropdown_item">
                                    <TruckIcon className="w-4 h-4" />
                                    <span>View Products Purchased</span>
                                  </div>
                                </Menu.Item>
                                {item.status !== 'Cancelled' && (
                                  <Menu.Item>
                                    <div
                                      onClick={() => handleCancel(item.id)}
                                      className="app__dropdown_item">
                                      <TrashIcon className="w-4 h-4 text-red-500" />
                                      <span className="text-red-500 font-medium">
                                        Cancel this Transaction
                                      </span>
                                    </div>
                                  </Menu.Item>
                                )}
                                {item.status !== 'Cancelled' &&
                                  item.status !== 'Paid' &&
                                  item.payment_type === 'credit' && (
                                    <Menu.Item>
                                      <div
                                        onClick={() => handlePaid(item.id)}
                                        className="app__dropdown_item">
                                        <CheckCircleIcon className="w-4 h-4 text-green-500" />
                                        <span className="text-green-500 font-medium">
                                          Set as PAID
                                        </span>
                                      </div>
                                    </Menu.Item>
                                  )}
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th className="app__th_firstcol">
                        {item.customer_name}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>
                              Date:{' '}
                              {format(
                                new Date(item.created_at),
                                'MMMM dd, yyyy HH:mm aaa'
                              )}
                            </div>
                            <div>
                              Payment Type:
                              {item.payment_type === 'cash' && (
                                <span>Cash</span>
                              )}
                              {item.payment_type === 'check' && (
                                <div>
                                  <div>Check</div>
                                  <div className="text-[10px]">
                                    {format(
                                      new Date(item.check_date),
                                      'MMMM dd, yyyy'
                                    )}
                                  </div>
                                </div>
                              )}
                              {item.payment_type === 'credit' && (
                                <span>Credit ({item.terms} days)</span>
                              )}
                            </div>
                            <div>
                              Total:{' '}
                              {Number(item.total).toLocaleString('en-US')}
                            </div>
                            <div>
                              Cash/Cheque Amount:{' '}
                              {(item.payment_type === 'cash' ||
                                item.payment_type === 'check') && (
                                <span>
                                  {Number(item.cash).toLocaleString('en-US')}
                                </span>
                              )}
                            </div>
                            <div>
                              Change:{' '}
                              {item.payment_type === 'cash' && (
                                <span>
                                  {(
                                    Number(item.cash) - Number(item.total)
                                  ).toLocaleString('en-US')}
                                </span>
                              )}
                            </div>
                            <div>
                              {item.status === 'Cancelled' && (
                                <span className="app__status_container_red">
                                  Cancelled
                                </span>
                              )}
                            </div>
                            <div>
                              <CustomButton
                                containerStyles="app__btn_red_xs mt-2"
                                title="Cancel Transaction"
                                btnType="button"
                                handleClick={() => handleCancel(item.id)}
                              />
                            </div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>

                      <td className="hidden md:table-cell app__td">
                        {format(
                          new Date(item.created_at),
                          'MMMM dd, yyyy hh:mm aaa'
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.status === 'Cancelled' && (
                          <span className="app__status_container_red">
                            Cancelled
                          </span>
                        )}
                        {item.status === 'Paid' && (
                          <span className="app__status_container_green">
                            Paid
                          </span>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.payment_type === 'cash' && <span>Cash</span>}
                        {item.payment_type === 'check' && <span>Cheque</span>}
                        {item.payment_type === 'card' && (
                          <span>Credit/Debit Card</span>
                        )}
                        {item.payment_type === 'credit' && (
                          <span>Credit Terms ({item.terms} days)</span>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {(item.payment_type === 'cash' ||
                          item.payment_type === 'check') && (
                          <span>
                            {Number(item.cash).toLocaleString('en-US')}
                          </span>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {(item.payment_type === 'cash' ||
                          item.payment_type === 'check') && (
                          <span>
                            {(
                              Number(item.cash) - Number(item.total)
                            ).toLocaleString('en-US')}
                          </span>
                        )}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.total}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        <UserBlock user={item.rdt_users} />
                      </td>
                    </tr>
                  ))}
                {loading && (
                  <TableRowLoading
                    cols={9}
                    rows={2}
                  />
                )}
              </tbody>
            </table>
            {!loading && isDataEmpty && (
              <div className="app__norecordsfound">No records found.</div>
            )}
          </div>

          {/* Show More */}
          {resultsCounter.results > resultsCounter.showing && !loading && (
            <ShowMore handleShowMore={handleShowMore} />
          )}
        </div>
      </div>
      {/* Add/Edit Modal */}
      {showProductsModal && (
        <ProductsModal
          sales={sales}
          hideModal={() => setShowProductsModal(false)}
        />
      )}
      {/* Confirm Cancel Modal */}
      {showConfirmCancelModal && (
        <ConfirmModal
          header="Confirmation"
          btnText="Confirm"
          message="All purchased product will be returned, please confirm this action; it cannot be undone."
          onConfirm={handleCancelConfirmed}
          onCancel={() => setShowConfirmCancelModal(false)}
        />
      )}
      {/* Confirm Paid Modal */}
      {showConfirmPaidModal && (
        <ConfirmModal
          header="Confirmation"
          btnText="Confirm"
          message="Please confirm this action; it cannot be undone."
          onConfirm={handlePaidConfirmed}
          onCancel={() => setShowConfirmPaidModal(false)}
        />
      )}
    </>
  )
}
export default Page
