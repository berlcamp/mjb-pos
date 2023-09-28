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
  address: string
  contact_number: string
  created_by: string
  rdt_users: AccountTypes
  org_id: string
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

export interface CanvassTypes {
  id: string
  name: string
  description: string
  created_by: string
  rdt_users: AccountTypes
  status: string
  org_id: string
}
