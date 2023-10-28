import { ConfirmModal, CustomButton } from '@/components'
import { useSupabase } from '@/context/SupabaseProvider'
import type { DepartmentTypes, Employee, PayrollEmployeeTypes, PayrollTypes } from '@/types'
import { useEffect, useState } from 'react'
import AddEmployeeModal from './AddEmployeeModal'
import { useFilter } from '@/context/FilterContext'
import { TrashIcon } from '@heroicons/react/20/solid'
import TwoColTableLoading from '@/components/Loading/TwoColTableLoading'
import { getCaBalance } from '@/utils/text-helper'

interface ModalProps {
  hideModal: () => void
  selectedPayroll: PayrollTypes | null
}

interface SelelectedEmployeeTypes {
  id: string
  payroll_id: string
  employee_id: string
  days: string
  rate: string
  ca_deduction: string
  gross_pay: string
  net_pay: string
  rdt_employees: Employee
}

const countDateDays = (startDate: string, endDate: string) => {
  // Create new date objects to avoid modifying the original dates
  const start = new Date(startDate)
  const end = new Date(endDate)

  // Calculate the time difference in milliseconds
  const timeDifference: number = end.getTime() - start.getTime()

  // Calculate the number of days by dividing the time difference by the number of milliseconds in a day
  const daysDifference = Math.floor(timeDifference / (1000 * 60 * 60 * 24))

  return daysDifference + 1
}

export default function EmployeesModal ({ hideModal, selectedPayroll }: ModalProps) {
  const { supabase } = useSupabase()
  const { setToast } = useFilter()

  const [showAddEmployeeModal, setShowAddEmployeeModal] = useState(false)
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const [allEmployees, setAllEmployees] = useState<Employee[] | []>([])
  const [departments, setDepartments] = useState<DepartmentTypes[] | []>([])
  const [selectedEmployees, setSelectedEmployees] = useState<SelelectedEmployeeTypes[] | []>([])

  const handleShowAddEmployeeModal = () => {
    setShowAddEmployeeModal(true)
  }

  const handleDelete = (id: string) => {
    setSelectedId(id)
    setShowConfirmDeleteModal(true)
  }

  const handleDeleteConfirmed = async () => {
    // update list
    const updatedData = selectedEmployees.filter((item: any) => item.id.toString() !== selectedId.toString())
    setSelectedEmployees(updatedData)

    setShowConfirmDeleteModal(false)
  }

  const handleAddToList = async (employees: Employee[]) => {
    if (!selectedPayroll) return

    const workingDays = countDateDays(selectedPayroll.from, selectedPayroll.to)

    const insertData = employees.map((employee: Employee, index) => {
      return {
        id: index.toString(),
        payroll_id: selectedPayroll.id,
        employee_id: employee.id,
        days: workingDays.toString(),
        rate: employee.rate,
        ca_deduction: '0',
        gross_pay: (Number(workingDays) * Number(employee.rate)).toString(),
        net_pay: (Number(workingDays) * Number(employee.rate)).toString(),
        rdt_employees: employee
      }
    })

    setSelectedEmployees([...selectedEmployees, ...insertData])
  }

  const handleWorkedDaysChange = (days: string, id: string) => {
    const list = selectedEmployees.map((item: SelelectedEmployeeTypes) => {
      if (item.id.toString() === id.toString()) {
        const grossPay = Number(days) * Number(item.rate)
        const netPay = grossPay - Number(item.ca_deduction)
        return { ...item, days, gross_pay: grossPay.toString(), net_pay: netPay.toString() }
      }
      return item
    })
    setSelectedEmployees(list)
  }

  const handleAddCaDeduction = (value: string, id: string) => {
    const list = selectedEmployees.map((item: SelelectedEmployeeTypes) => {
      if (item.id.toString() === id.toString()) {
        const grossPay = Number(item.days) * Number(item.rate)
        const netPay = grossPay - Number(value)
        return { ...item, ca_deduction: value, net_pay: netPay.toString() }
      }
      return item
    })
    setSelectedEmployees(list)
  }

  const saveChanges = async () => {
    // store each employee to payroll
    try {
      // delete the data from database first
      const { error: deleteError } = await supabase
        .from('rdt_payroll_employees')
        .delete()
        .eq('payroll_id', selectedPayroll?.id)

      if (deleteError) throw new Error(deleteError.message)

      // then create new one
      const insertData = selectedEmployees.map((item: SelelectedEmployeeTypes) => {
        return {
          payroll_id: item.payroll_id,
          employee_id: item.employee_id,
          days: item.days,
          rate: item.rate,
          ca_deduction: item.ca_deduction,
          gross_pay: item.gross_pay,
          net_pay: item.net_pay
        }
      })
      const { error } = await supabase
        .from('rdt_payroll_employees')
        .insert(insertData)
        .select()

      if (error) throw new Error(error.message)
      setToast('success', 'Successfully saved.')
    } catch (e) {
      console.error(e)
    }
  }

  useEffect(() => {
    void ((async () => {
      setLoading(true)

      // fetch current payroll employees
      const { data } = await supabase
        .from('rdt_payroll_employees')
        .select('*, rdt_employees(*, rdt_cash_advances(amount), rdt_payroll_employees(*, rdt_payrolls(reference_code)))')
        .eq('payroll_id', selectedPayroll?.id)

      // fetch employees
      const { data: allEmployeesData } = await supabase
        .from('rdt_employees')
        .select('*, rdt_departments(name), rdt_cash_advances(amount), rdt_payroll_employees(*, rdt_payrolls(reference_code))')
        // .eq('status', 'Active')
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

      // fetch departments
      const { data: departmentsData } = await supabase
        .from('rdt_departments')
        .select()
        .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

      setSelectedEmployees(data || [])
      setAllEmployees(allEmployeesData)
      setDepartments(departmentsData)
      setLoading(false)
    })())

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2_large">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Employees Payroll
            </h5>
            <button onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <div className="app__modal_body">
            <div className='text-right'>
              <CustomButton
                  btnType='button'
                  title='Add Employee/s'
                  handleClick={handleShowAddEmployeeModal}
                  containerStyles="app__btn_blue"
                />
            </div>
            {
              (!loading && selectedEmployees.length > 0) &&
                <>
                  <div className='my-2'>
                    <table className="app__table">
                      <thead className="app__thead">
                        <tr>
                          <th className="app__th pl-4"></th>
                          <th className="app__th">
                              Employee
                          </th>
                          <th className="app__th">
                              Rate
                          </th>
                          <th className="app__th">
                              CA Balance
                          </th>
                          <th className="app__th">
                              Worked Days
                          </th>
                          <th className="app__th">
                              Gross Pay
                          </th>
                          <th className="app__th">
                              CA Deduction
                          </th>
                          <th className="app__th">
                              Net Pay
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {
                          selectedEmployees.map((item: SelelectedEmployeeTypes, index: number) =>
                            <tr key={index} className="app__tr">
                              <td
                                className="w-6 pl-4 app__td">
                                  <TrashIcon onClick={() => handleDelete(item.id)} className='w-4 h-4 cursor-pointer'/>
                                </td>
                              <th className="app__td">
                                {item.rdt_employees.firstname} {item.rdt_employees.middlename} {item.rdt_employees.lastname}
                              </th>
                              <td className="app__td">
                                <div>{item.rate}</div>
                              </td>
                              <td
                                className="app__td">
                                { getCaBalance(item.rdt_employees) }
                              </td>
                              <td className="app__td">
                                <div>
                                  <SelectWorkedDays
                                    employee={item}
                                    handleWorkedDaysChange={handleWorkedDaysChange}
                                    payroll={selectedPayroll}/>
                                </div>
                              </td>
                              <td className="app__td">
                                <div>{item.gross_pay}</div>
                              </td>
                              <td className="app__td">
                                <InputDeduction
                                  id={item.id}
                                  maxValue={getCaBalance(item.rdt_employees)}
                                  currentValue={item.ca_deduction}
                                  handleAddCaDeduction={handleAddCaDeduction}/>
                              </td>
                              <td className="app__td">
                                <div>{item.net_pay}</div>
                              </td>
                            </tr>
                          )
                        }
                      </tbody>
                    </table>
                  </div>
                  <div className="app__modal_footer">
                      <CustomButton
                        btnType='button'
                        title='Save Changes'
                        handleClick={saveChanges}
                        containerStyles="app__btn_green"
                      />
                      <CustomButton
                        btnType='button'
                        title='Close'
                        handleClick={hideModal}
                        containerStyles="app__btn_gray"
                      />
                  </div>
                </>
            }
            {
              (!loading && selectedEmployees.length === 0) && <div className='text-sm my-4'>No employees added yet.</div>
            }
            {
              loading && <TwoColTableLoading/>
            }
          </div>
        </div>
      </div>
    </div>
    {/* Add Employee Modal */}
    {
      showAddEmployeeModal && (
        <AddEmployeeModal
          employees={selectedEmployees}
          departments={departments}
          allEmployees={allEmployees}
          handleAddToList={handleAddToList}
          hideModal={() => setShowAddEmployeeModal(false)}/>
      )
    }
    {/* Confirm Delete Modal */}
    {
      showConfirmDeleteModal && (
        <ConfirmModal
          header='Confirmation'
          btnText='Confirm'
          message="Please confirm this action"
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setShowConfirmDeleteModal(false)}
        />
      )
    }
  </>
  )
}

const InputDeduction = ({ id, currentValue, maxValue, handleAddCaDeduction }: { id: string, maxValue: number, currentValue: string, handleAddCaDeduction: (value: string, id: string) => void }) => {
  const [deduction, setDeduction] = useState(currentValue)

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const amount = event.target.value
    setDeduction(amount)
    handleAddCaDeduction(amount, id)
  }

  return (
    <div>
      <input
        type='number'
        step='any'
        max={maxValue}
        value={deduction}
        onChange={handleChange}
        className='w-14 text-gray-500 border focus:ring-0 focus:outline-none text-sm py-px text-center inline-flex'
        />
    </div>
  )
}

const SelectWorkedDays = ({ payroll, employee, handleWorkedDaysChange }: { payroll: PayrollTypes | null, employee: PayrollEmployeeTypes, handleWorkedDaysChange: (days: string, id: string) => void }) => {
  //
  const [days, setDays] = useState(employee.days)

  const rangeDays = payroll ? countDateDays(payroll.from, payroll.to) : 1
  const selectOptions = []
  for (let i = 0.5; i <= rangeDays; i = i + 0.5) {
    selectOptions.push(
      <option key={i} value={i}>
        {i}
      </option>
    )
  }

  const workedDaysChange = (days: string) => {
    setDays(days)
    handleWorkedDaysChange(days, employee.id)
  }

  return (
    <select
      onChange={e => workedDaysChange(e.target.value)}
      value={days}
      className='w-14 text-gray-500 border focus:ring-0 focus:outline-none text-sm py-px text-center inline-flex'>
      {selectOptions}
    </select>
  )
}
