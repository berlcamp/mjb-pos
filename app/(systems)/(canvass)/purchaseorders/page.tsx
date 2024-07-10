'use client'

import {
  CustomButton,
  PerPage,
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
import { fetchPurchaseOrders } from '@/utils/fetchApi'
import { Menu, Transition } from '@headlessui/react'
import React, { Fragment, useEffect, useState } from 'react'
import uuid from 'react-uuid'
import Filters from './Filters'
// Types
import type { PurchaseOrderItemTypes, PurchaseOrderTypes } from '@/types'

// Redux imports
import SupplySideBar from '@/components/Sidebars/SupplySideBar'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import {
  ChevronDownIcon,
  PencilSquareIcon,
  PrinterIcon,
} from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'
import Link from 'next/link'
import { useDispatch, useSelector } from 'react-redux'
import AddEditModal from './AddEditModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<PurchaseOrderTypes[]>([])

  const [showAddModal, setShowAddModal] = useState(false)
  const [editData, setEditData] = useState<PurchaseOrderTypes | null>(null)

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('')

  const [perPageCount, setPerPageCount] = useState<number>(10)

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const resultsCounter = useSelector((state: any) => state.results.value)
  const dispatch = useDispatch()

  const { supabase, session } = useSupabase()
  const { hasAccess } = useFilter()

  const fetchData = async () => {
    setLoading(true)

    try {
      const result = await fetchPurchaseOrders(
        { filterKeyword, filterStatus },
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
      const result = await fetchPurchaseOrders(
        { filterKeyword, filterStatus },
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

  const handleAdd = () => {
    setShowAddModal(true)
    setEditData(null)
  }

  const handleEdit = (item: PurchaseOrderTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  // Generate payroll summary PDF
  const handlePrintPo = async (item: PurchaseOrderTypes) => {
    // Create a new jsPDF instance
    // eslint-disable-next-line new-cap
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    })

    const pageWidth = doc.internal.pageSize.getWidth()

    // Add a header to the PDF
    const fontSize = 12
    doc.setFontSize(fontSize)

    const titleText = process.env.NEXT_PUBLIC_ORG_NAME ?? ''
    const titleText2 = 'Purchase Order'
    const titleText3 = `${format(new Date(item.date), 'MMMM dd, yyyy')}`
    const titleWidth =
      (doc.getStringUnitWidth(titleText) * fontSize) / doc.internal.scaleFactor
    const titleWidth2 =
      (doc.getStringUnitWidth(titleText2) * 16) / doc.internal.scaleFactor // font size 16
    const titleWidth3 =
      (doc.getStringUnitWidth(titleText3) * fontSize) / doc.internal.scaleFactor

    let currentY = 20

    doc.setFont('helvetica', 'bold')

    doc.text(titleText, (pageWidth - titleWidth) / 2, currentY)
    currentY += 15
    doc.setFontSize(16)
    doc.text(titleText2, (pageWidth - titleWidth2) / 2, currentY)
    currentY += 7
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(12)

    doc.text(titleText3, (pageWidth - titleWidth3) / 2, currentY)
    currentY += 20

    doc.text(`Supplier: ${item.rdt_suppliers.name}`, 15, currentY)
    currentY += 5

    // Define your data for the table
    const { data: poItems } = await supabase
      .from('rdt_purchase_order_items')
      .select()
      .eq('purchase_order_id', item.id)

    const data = poItems.map(
      (product: PurchaseOrderItemTypes, index: number) => {
        return {
          item_no: index,
          description: product.product_name,
          quantity: Number(product.quantity).toLocaleString('en-US'),
          unit_price: Number(product.price).toLocaleString('en-US'),
          total: Number(product.total).toLocaleString('en-US'),
        }
      }
    )

    const grossTotal = poItems.reduce(
      (accumulator: number, item: PurchaseOrderItemTypes) =>
        accumulator + Number(item.total),
      0
    )

    data.push({
      unit_price: 'Total: ',
      total: grossTotal.toLocaleString('en-US'),
    })

    // Define the table columns
    const columns = [
      { header: 'Item #', dataKey: 'item_no' },
      { header: 'Description', dataKey: 'description' },
      { header: 'Quantity', dataKey: 'quantity' },
      { header: 'Unit Price', dataKey: 'unit_price' },
      { header: 'Total', dataKey: 'total' },
    ]

    const options = {
      margin: { top: 20 },
      startY: currentY,
      headStyles: { fillColor: [252, 164, 96] }, // Header cell background color (red)
    }

    // Create a new table object
    // @ts-ignore
    doc.autoTable(columns, data, options)

    // Save the PDF with a unique name
    doc.save(`Purchase Order #${item.po_number}.pdf`)
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
  }, [filterKeyword, perPageCount, filterStatus])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!hasAccess('canvass') && !superAdmins.includes(session.user.email))
    return <Unauthorized />

  return (
    <>
      <Sidebar>
        <SupplySideBar />
      </Sidebar>
      <TopBar />
      <div className="app__main">
        <div>
          <div className="app__title">
            <Title title="Purchase Orders" />
            <CustomButton
              containerStyles="app__btn_green"
              title="Create New P.O."
              btnType="button"
              handleClick={handleAdd}
            />
          </div>

          {/* Filters */}
          <div className="app__filters">
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterStatus={setFilterStatus}
            />
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
                  <th className="hidden md:table-cell app__th">PO #</th>
                  <th className="hidden md:table-cell app__th">Description</th>
                  <th className="hidden md:table-cell app__th">Date</th>
                  <th className="hidden md:table-cell app__th">Supplier</th>
                  <th className="hidden md:table-cell app__th">Status</th>
                  <th className="hidden md:table-cell app__th"></th>
                  <th className="hidden md:table-cell app__th">Added By</th>
                </tr>
              </thead>
              <tbody>
                {!isDataEmpty &&
                  list.map((item: PurchaseOrderTypes) => (
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
                                    onClick={() => handleEdit(item)}
                                    className="app__dropdown_item">
                                    <PencilSquareIcon className="w-4 h-4" />
                                    <span>Edit Details</span>
                                  </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                    onClick={async () =>
                                      await handlePrintPo(item)
                                    }
                                    className="app__dropdown_item">
                                    <PrinterIcon className="w-4 h-4" />
                                    <span>Print P.O.</span>
                                  </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th className="app__th_firstcol">
                        {item.po_number}
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>
                              {item.status === 'Pending approval' ? (
                                <span className="app__status_container_orange">
                                  {item.status}
                                </span>
                              ) : (
                                <span className="app__status_container_green">
                                  {item.status}
                                </span>
                              )}
                            </div>
                            <div>
                              <span className="app_td_mobile_label">
                                Description:
                              </span>{' '}
                              {item.description}
                            </div>
                          </div>
                        </div>
                        {/* End - Mobile View */}
                      </th>
                      <td className="hidden md:table-cell app__td">
                        {item.description}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {format(new Date(item.date), 'MMMM dd, yyyy')}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.rdt_suppliers?.name}
                      </td>
                      <td className="hidden md:table-cell app__td">
                        {item.status === 'Pending approval' ? (
                          <span className="app__status_container_orange">
                            {item.status}
                          </span>
                        ) : (
                          <span className="app__status_container_green">
                            {item.status}
                          </span>
                        )}
                      </td>
                      <td className="app__td">
                        <Link
                          href={`/purchaseorders/${item.id}`}
                          className="app__btn_blue">
                          <span>Manage&nbsp;Items</span>
                        </Link>
                      </td>
                      <td className="hidden md:table-cell app__td">
                        <UserBlock user={item.rdt_users} />
                      </td>
                    </tr>
                  ))}
                {loading && (
                  <TableRowLoading
                    cols={8}
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
      {showAddModal && (
        <AddEditModal
          editData={editData}
          hideModal={() => setShowAddModal(false)}
        />
      )}
    </>
  )
}
export default Page
