import React, { useEffect, useState } from 'react'
import { CustomButton } from '@/components'

// Types
import type { DepartmentTypes, Employee, PayrollEmployeeTypes } from '@/types'

interface ModalProps {
  hideModal: () => void
  allEmployees: Employee[] | []
  employees: PayrollEmployeeTypes[] | []
  handleAddToList: (employees: Employee[]) => void
  departments: DepartmentTypes[] | []
}

const AddEmployeeModal = ({ hideModal, employees, departments, allEmployees, handleAddToList }: ModalProps) => {
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [items, setItems] = useState<Employee[] | []>([])
  const [department, setDepartment] = useState('')

  const handleCheckboxChange = (id: string) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter((i) => i !== id))
    } else {
      setSelectedItems([...selectedItems, id])
    }
  }

  // uncheck/check all items
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([])
    } else {
      const allItemIds = items.map((item) => item.id)
      setSelectedItems(allItemIds)
    }
    setSelectAll(!selectAll)
  }

  // clear filters
  const handleClearFilter = () => {
    setDepartment('')
  }

  // add employees to list
  const handleAddSelectedToList = () => {
    const filterItems = allEmployees.filter(item => {
      if (selectedItems.includes(item.id)) {
        return true
      } else {
        return false
      }
    })
    if (filterItems.length > 0) {
      handleAddToList(filterItems)
      hideModal()
    }
  }

  // default checked the "Check all" checkbox if all items are checked
  useEffect(() => {
    if (selectedItems.length === 0) {
      setSelectAll(false)
    } else if (selectedItems.length === items.length) {
      setSelectAll(true)
    } else {
      setSelectAll(false)
    }
  }, [selectedItems, items])

  useEffect(() => {
    // filter list to exclude already added employees
    const filterItems = allEmployees.filter(item => {
      if (!employees.find((employee: PayrollEmployeeTypes) => employee.employee_id === item.id)) {
        // filter list by department if specified
        if (department !== '' && item.department_id.toString() !== department.toString()) {
          return false
        }
        return true
      } else {
        return false
      }
    })
    setItems(filterItems)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [department])

  return (
  <>
    <div className="app__modal_wrapper">
      <div className="app__modal_wrapper2_medium">
        <div className="app__modal_wrapper3">
          <div className="app__modal_header">
            <h5 className="app__modal_header_text">
              Add Employee
            </h5>
            <button onClick={hideModal} type="button" className="app__modal_header_btn">&times;</button>
          </div>

          <div className="app__modal_body">
            <div className='flex space-x-1 items-center'>
              <div className='space-x-1'>
                <span className='text-xs text-gray-600'>Filter by Department:</span>
                <select
                  onChange={e => setDepartment(e.target.value)}
                  value={department}
                  className='w-24 text-gray-500 border bg-transparent focus:ring-0 focus:outline-none text-sm py-px text-center inline-flex'>
                    <option value=''>All</option>
                    {
                      departments.map((department: DepartmentTypes, index) => (
                        <option key={index} value={department.id}>{department.name}</option>
                      ))
                    }
                </select>
              </div>
              <CustomButton
                containerStyles='app__btn_gray_xs inline-flex'
                title='Clear Filter'
                btnType='button'
                handleClick={handleClearFilter}
              />
            </div>
            <table className="app__table my-4">
              <thead className="app__thead">
                <tr>
                  <th className="app__th">
                    <label className='space-x-2 items-center flex'>
                      <input
                        type="checkbox"
                        checked={selectAll}
                        onChange={handleSelectAll}/>
                      <span>Employee Name</span>
                    </label>
                  </th>
                  <th className="app__th">
                    Department
                  </th>
                  <th className="app__th">
                    Position
                  </th>
                </tr>
              </thead>
              <tbody>
                {
                  items.map((item: Employee, index: number) =>
                    <tr key={index} className="app__tr">
                      <th className="app__td">
                        <label className='space-x-2 items-center flex'>
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleCheckboxChange(item.id)}
                            className=""/>
                          <span>{item.firstname} {item.middlename} {item.lastname}</span>
                        </label>
                      </th>
                      <th className="app__td">
                        {item.rdt_departments?.name}
                      </th>
                      <th className="app__td">
                        {item.position}
                      </th>
                    </tr>
                  )
                }
              </tbody>
            </table>
            <div className="app__modal_footer">
                  <CustomButton
                    btnType='submit'
                    title='Add Selected Employee/s'
                    containerStyles="app__btn_green"
                    handleClick={handleAddSelectedToList}
                  />
                  <CustomButton
                    btnType='submit'
                    title='Cancel'
                    containerStyles="app__btn_gray"
                    handleClick={hideModal}
                  />
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  )
}

export default AddEmployeeModal
