import type { ReactNode, MouseEventHandler } from 'react'

export interface SelectUserNamesProps {
  settingsData: any[]
  multiple: boolean
  type: string
  handleManagerChange: (newdata: any[], type: string) => void
  title: string
}

export interface searchUser {
  firstname: string
  middlename: string
  lastname: string
  uuid?: string
  id: string
}

export interface namesType {
  firstname: string
  middlename: string
  lastname: string
  uuid?: string
  id: string
}

export interface accountNamesType {
  name: string
  uuid: string
  id: string
}

export interface settingsDataTypes {
  access_type: string
  data: namesType
}

export interface CustomButtonTypes {
  isDisabled?: boolean
  btnType?: 'button' | 'submit'
  containerStyles?: string
  textStyles?: string
  title: string
  rightIcon?: ReactNode
  handleClick?: MouseEventHandler<HTMLButtonElement>
}

export interface NotificationTypes {
  id: string
  message: string
  created_at: string
  url: string
  type: string
  user_id: string
  reference_id?: string
  is_read: boolean
}

export interface Employee {
  id: string
  status: string
  firstname: string
  middlename: string
  lastname: string
  position: string
  rate: string
  address: string
  contact_number: string
  created_by: string
  rdt_users: AccountTypes
  org_id: string
  department_id: string
  rdt_departments: DepartmentTypes
  rdt_cash_advances: CashAdvanceTypes[]
  rdt_payroll_employees: PayrollEmployeeTypes[]
}

export interface AccountTypes {
  id: string
  name: string
  status: string
  password: string
  avatar_url: string
  email: string
  org_id: string
  created_by: string
  rdt_users: AccountTypes
  temp_password: string
}

export interface excludedItemsTypes {
  id: string
}

export interface ProjectTypes {
  id: string
  name: string
  description: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
}

export interface LocationTypes {
  id: string
  name: string
  description: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
  project_id: string
  rdt_projects: ProjectTypes
}

export interface SupplierTypes {
  id: string
  name: string
  description: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
}

export interface ProductTypes {
  id: string
  uuid: string
  description: string
  category_id: string
  unit_id: string
  available_stocks: string
  quantity: number
  price: string
  total: number
  created_by: string
  rdt_users: AccountTypes
  rdt_product_categories: ProductCategoryTypes
  rdt_product_units: ProductUnitTypes
  status: string
  org_id: string
}
export interface ProductCategoryTypes {
  id: string
  name: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
}

export interface ProductUnitTypes {
  id: string
  name: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
}

export interface CanvassTypes {
  id: string
  canvass_number: string
  description: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
}

export interface SupplierPricesTypes {
  supplier_id: string
  supplier_name: string
  price: string
  unit: string
  ref: number
  checked: boolean
}

export interface CanvassItemTypes {
  id: string
  product_name: string
  canvas_id: string
  prices: SupplierPricesTypes[]
}

export interface RemarksTypes {
  id: string
  sender_id?: string
  rdt_users?: AccountTypes
  message: string
  parent_id?: string
  type: string
  reply_type?: string
  reference_id?: string
  created_at: string
}

export interface PurchaseOrderTypes {
  id: string
  date: string
  supplier_id: string
  po_number: string
  description: string
  created_by: string
  rdt_users: AccountTypes
  rdt_suppliers: SupplierTypes
  status: string
  org_id: string
}

export interface PurchaseOrderItemTypes {
  id: string
  product_name: string
  purchase_order_id: string
  quantity: string
  price: string
  total: string
}

export interface SalesTypes {
  id: string
  product_id: string
  rdt_products: ProductTypes
  quantity: string
  unit_price: string
  total: string
  sale_transaction_id: string
  rdt_sale_transactions: TransactionTypes
  casher_id: string
  rdt_users: AccountTypes
  status: string
  created_at: string
  transaction_date: string
}

export interface TransactionTypes {
  id: string
  customer_name: string
  casher_id: string
  rdt_users: AccountTypes
  rdt_sales: SalesTypes[]
  created_at: string
  total: string
  cash: string
  terms: string
  payment_type: string
  status: string
  transaction_date: string
}

export interface DepartmentTypes {
  id: string
  name: string
  org_id: string
}

export interface FixedDeductionTypes {
  id: string
  name: string
  amount: string
  org_id: string
}

export interface CashAdvanceTypes {
  id: string
  user_id: string
  amount: string
  org_id: string
  create_by: string
  rdt_users: AccountTypes
  employee_id: string
  rdt_employees: Employee
}

export interface PayrollTypes {
  id: string
  created_by: string
  rdt_users: AccountTypes
  rdt_payroll_employees: PayrollEmployeeTypes[]
  from: string
  to: string
  reference_code: string
  org_id: string
  description: string
}

export interface PayrollEmployeeTypes {
  id: string
  employee_id: string
  rdt_employees: Employee
  payroll_id: string
  days: string
  rate: string
  gross_pay: string
  net_pay: string
  ca_deduction: string
}
