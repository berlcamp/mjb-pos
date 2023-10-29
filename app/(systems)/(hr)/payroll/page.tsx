'use client'

import { fetchPayrolls } from '@/utils/fetchApi'
import React, { Fragment, useEffect, useState } from 'react'
import { Sidebar, PerPage, TopBar, TableRowLoading, ShowMore, Title, Unauthorized, UserBlock, EmployeesSideBar, CustomButton, DeleteModal } from '@/components'
import uuid from 'react-uuid'
import { superAdmins } from '@/constants'
import Filters from './Filters'
import { useFilter } from '@/context/FilterContext'
import { useSupabase } from '@/context/SupabaseProvider'
// Types
import type { PayrollEmployeeTypes, PayrollTypes } from '@/types'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { updateResultCounter } from '@/GlobalRedux/Features/resultsCounterSlice'
import { Menu, Transition } from '@headlessui/react'
import { ChevronDownIcon, PencilSquareIcon, PrinterIcon, TrashIcon } from '@heroicons/react/20/solid'
import { format } from 'date-fns'
import EmployeesModal from './EmployeesModal'
import AddEditModal from './AddEditModal'

const Page: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [list, setList] = useState<PayrollTypes[]>([])

  const [filterKeyword, setFilterKeyword] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')

  const [showAddModal, setShowAddModal] = useState(false)
  const [showEmployeesModal, setShowEmployeesModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [selectedPayroll, setSelectedPayroll] = useState<PayrollTypes | null>(null)
  const [editData, setEditData] = useState<PayrollTypes | null>(null)

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
      const result = await fetchPayrolls({ filterKeyword, filterDate }, perPageCount, 0)

      // update the list in redux
      dispatch(updateList(result.data))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: result.data.length, results: result.count ? result.count : 0 }))
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
      const result = await fetchPayrolls({ filterKeyword, filterDate }, perPageCount, list.length)

      // update the list in redux
      const newList = [...list, ...result.data]
      dispatch(updateList(newList))

      // Updating showing text in redux
      dispatch(updateResultCounter({ showing: newList.length, results: result.count ? result.count : 0 }))
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

  const handleEdit = (item: PayrollTypes) => {
    setShowAddModal(true)
    setEditData(item)
  }

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowDeleteModal(true)
  }

  // view employees in modal
  const handleViewEmployees = (item: PayrollTypes) => {
    setSelectedPayroll(item)
    setShowEmployeesModal(true)
  }

  // Generate payroll summary PDF
  const handleGenerateSummary = async (item: PayrollTypes) => {
    // Create a new jsPDF instance
    // eslint-disable-next-line new-cap
    const doc = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })

    const pageWidth = doc.internal.pageSize.getWidth()

    // Add a header to the PDF
    const fontSize = 12
    doc.setFontSize(fontSize)
    const titleText = process.env.NEXT_PUBLIC_ORG_NAME ?? ''
    const titleText2 = 'Payroll Summary'
    const titleText3 = `${format(new Date(item.from), 'MMM dd, yyyy')} - ${format(new Date(item.to), 'MMM dd, yyyy')}`
    const titleWidth = doc.getStringUnitWidth(titleText) * fontSize / doc.internal.scaleFactor
    const titleWidth2 = doc.getStringUnitWidth(titleText2) * 16 / doc.internal.scaleFactor // font size 16
    const titleWidth3 = doc.getStringUnitWidth(titleText3) * fontSize / doc.internal.scaleFactor

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
    currentY += 15

    // Define your data for the table
    const { data: payrollEmployees } = await supabase
      .from('rdt_payroll_employees')
      .select('*, rdt_employees(*, rdt_departments(name))')
      .eq('payroll_id', item.id)

    payrollEmployees.sort((a: PayrollEmployeeTypes, b: PayrollEmployeeTypes) => {
      const nameA = a.rdt_employees.lastname.toUpperCase()
      const nameB = b.rdt_employees.lastname.toUpperCase()

      if (nameA < nameB) {
        return -1
      } else if (nameA > nameB) {
        return 1
      } else {
        return 0
      }
    })

    const data = payrollEmployees.map((employee: PayrollEmployeeTypes) => {
      const fullname = `${employee.rdt_employees.lastname}, ${employee.rdt_employees.firstname} ${employee.rdt_employees.middlename}`
      return {
        name: fullname,
        department: employee.rdt_employees.rdt_departments.name,
        days: employee.days,
        gross_pay: Number(employee.gross_pay).toLocaleString('en-US'),
        ca_deduction: Number(employee.ca_deduction).toLocaleString('en-US'),
        net_pay: Number(employee.net_pay).toLocaleString('en-US')
      }
    })

    const grossTotal = payrollEmployees.reduce((accumulator: number, item: PayrollEmployeeTypes) => accumulator + Number(item.gross_pay), 0)
    const netTotal = payrollEmployees.reduce((accumulator: number, item: PayrollEmployeeTypes) => accumulator + Number(item.net_pay), 0)
    const caDeductionTotal = payrollEmployees.reduce((accumulator: number, item: PayrollEmployeeTypes) => accumulator + Number(item.ca_deduction), 0)

    data.push({ days: 'Total: ', gross_pay: grossTotal.toLocaleString('en-US'), ca_deduction: caDeductionTotal.toLocaleString('en-US'), net_pay: netTotal.toLocaleString('en-US') })

    // Define the table columns
    const columns = [
      { header: 'Name', dataKey: 'name' },
      { header: 'Department', dataKey: 'department' },
      { header: 'Worked Days', dataKey: 'days' },
      { header: 'Gross Pay', dataKey: 'gross_pay' },
      { header: 'CA Deducation', dataKey: 'ca_deduction' },
      { header: 'Net Pay', dataKey: 'net_pay' }
    ]

    const options = {
      margin: { top: 20 },
      startY: currentY,
      headStyles: { fillColor: [252, 164, 96] } // Header cell background color (red)
    }

    // Create a new table object
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    doc.autoTable(columns, data, options)

    // Save the PDF with a unique name
    doc.save(`Payroll Summary ${item.reference_code}.pdf`)
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
  }, [filterKeyword, perPageCount, filterDate])

  const isDataEmpty = !Array.isArray(list) || list.length < 1 || !list

  // Check access from permission settings or Super Admins
  if (!(hasAccess('human_resource') || hasAccess('cashers')) && !superAdmins.includes(session.user.email)) return <Unauthorized/>

  return (
    <>
    <Sidebar>
      <EmployeesSideBar/>
    </Sidebar>
    <TopBar/>
    <div className="app__main">
      <div>
          <div className='app__title'>
            <Title title='Payroll'/>
            <CustomButton
              containerStyles='app__btn_green'
              title='Create New Payroll'
              btnType='button'
              handleClick={handleAdd}/>
          </div>

          {/* Filters */}
          <div className='app__filters'>
            <Filters
              setFilterKeyword={setFilterKeyword}
              setFilterDate={setFilterDate}/>
          </div>

          {/* Per Page */}
          <PerPage
            showingCount={resultsCounter.showing}
            resultsCount={resultsCounter.results}
            perPageCount={perPageCount}
            setPerPageCount={setPerPageCount}/>

          {/* Main Content */}
          <div>
            <table className="app__table">
              <thead className="app__thead">
                  <tr>
                      <th className="hidden md:table-cell app__th pl-4"></th>
                      <th className="hidden md:table-cell app__th">
                          Reference&nbsp;Code
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Description
                      </th>
                      <th className="hidden md:table-cell app__th">
                          Period
                      </th>
                      <th className="hidden md:table-cell app__th"></th>
                      <th className="hidden md:table-cell app__th">
                          Added By
                      </th>
                  </tr>
              </thead>
              <tbody>
                {
                  !isDataEmpty && list.map((item: PayrollTypes) => (
                    <tr
                      key={uuid()}
                      className="app__tr">
                      <td
                        className="w-6 pl-4 app__td">
                        <Menu as="div" className="app__menu_container">
                          <div>
                            <Menu.Button className="app__dropdown_btn">
                              <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                            </Menu.Button>
                          </div>

                          <Transition
                            as={Fragment}
                            enter="transition ease-out duration-100"
                            enterFrom="transform opacity-0 scale-95"
                            enterTo="transform opacity-100 scale-100"
                            leave="transition ease-in duration-75"
                            leaveFrom="transform opacity-100 scale-100"
                            leaveTo="transform opacity-0 scale-95"
                          >
                            <Menu.Items className="app__dropdown_items">
                              <div className="py-1">
                                <Menu.Item>
                                  <div
                                      onClick={() => handleEdit(item)}
                                      className='app__dropdown_item'
                                    >
                                      <PencilSquareIcon className='w-4 h-4'/>
                                      <span>Edit Details</span>
                                    </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                      onClick={async () => await handleGenerateSummary(item)}
                                      className='app__dropdown_item'
                                    >
                                      <PrinterIcon className='w-4 h-4'/>
                                      <span>Print Summary</span>
                                    </div>
                                </Menu.Item>
                                <Menu.Item>
                                  <div
                                      onClick={ () => handleDelete(item.id) }
                                      className='app__dropdown_item'
                                    >
                                      <TrashIcon className='w-4 h-4'/>
                                      <span>Delete</span>
                                    </div>
                                </Menu.Item>
                              </div>
                            </Menu.Items>
                          </Transition>
                        </Menu>
                      </td>
                      <th
                        className="app__th_firstcol">
                        <span className='font-medium'>{item.reference_code}</span>
                        {/* Mobile View */}
                        <div>
                          <div className="md:hidden app__td_mobile">
                            <div>Date: {format(new Date(item.from), 'MMMM dd, yyyy')} - {format(new Date(item.to), 'MMMM dd, yyyy')}</div>
                            <div>{item.description}</div>
                          </div>
                        </div>
                        {/* End - Mobile View */}

                      </th>
                      <td
                        className="hidden md:table-cell app__td">
                        {item.description}
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        {format(new Date(item.from), 'MMM dd, yyyy')} - {format(new Date(item.to), 'MMM dd, yyyy')}
                      </td>
                      <td
                        className="app__td">
                        <CustomButton
                          containerStyles='app__btn_blue'
                          title='Manage&nbsp;Employees'
                          btnType='button'
                          handleClick={() => handleViewEmployees(item)}/>
                      </td>
                      <td
                        className="hidden md:table-cell app__td">
                        <UserBlock user={item.rdt_users}/>
                      </td>
                    </tr>
                  ))
                }
                { loading && <TableRowLoading cols={6} rows={2}/> }
              </tbody>
            </table>
            {
              (!loading && isDataEmpty) &&
                <div className='app__norecordsfound'>No records found.</div>
            }
          </div>

          {/* Show More */}
          {
            (resultsCounter.results > resultsCounter.showing && !loading) &&
              <ShowMore
                handleShowMore={handleShowMore}/>
          }
      </div>
    </div>
    {/* Show Employees Modal */}
    {
      showEmployeesModal && (
        <EmployeesModal
          selectedPayroll={selectedPayroll}
          hideModal={() => setShowEmployeesModal(false)}/>
      )
    }
    {/* Add/Edit Modal */}
    {
      showAddModal && (
        <AddEditModal
          editData={editData}
          hideModal={() => setShowAddModal(false)}/>
      )
    }
    {/* Delete Modal */}
    {
      showDeleteModal && (
        <DeleteModal
          id={selectedId}
          table='rdt_payrolls'
          hideModal={() => setShowDeleteModal(false)}/>
      )
    }
  </>
  )
}
export default Page
