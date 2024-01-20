import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import type { excludedItemsTypes } from '@/types'
import { format } from 'date-fns'
import { fullTextQuery } from './text-helper'
// import { fullTextQuery } from './text-helper'

const supabase = createClientComponentClient()

export async function fetchEmployees (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_employees')
      .select('*, rdt_users(name,avatar_url), rdt_departments(id,name), rdt_cash_advances(amount), rdt_payroll_employees(*, rdt_payrolls(reference_code))', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      const searchQuery: string = fullTextQuery(filters.filterKeyword)
      query = query.textSearch('fts', searchQuery)
      // query = query.or(`firstname.ilike.%${filters.filterKeyword}%,middlename.ilike.%${filters.filterKeyword}%,lastname.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch employee error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchDepartments (filters: { filterKeyword?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_departments')
      .select('*', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      // const searchQuery: string = fullTextQuery(filters.filterKeyword)
      // query = query.textSearch('fts', searchQuery)
      query = query.or(`name.ilike.%${filters.filterKeyword}%`)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch employee error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchFixedDeductions (perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_fixed_deductions')
      .select('*', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchCashAdvances (filters: { filterKeyword?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_cash_advances')
      .select('*, rdt_users(name,avatar_url), rdt_employees(firstname,middlename,lastname)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      const result = await fetchEmployees({ filterKeyword: filters.filterKeyword }, 9999, 0)
      const ids: number[] = []
      result.data.forEach(employee => {
        ids.push(employee.id)
      })

      query = query.in('employee_id', ids)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAccounts (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_users')
      .select('*', { count: 'exact' })
      .neq('email', 'berlcamp@gmail.com')
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchErrorLogs (perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('query_errors')
      .select('*', { count: 'exact' })

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchProjects (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_projects')
      .select('*, rdt_users(name,avatar_url)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`description.ilike.%${filters.filterKeyword}%,name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchLocations (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_project_locations')
      .select('*, rdt_users(name,avatar_url), rdt_projects(name)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`description.ilike.%${filters.filterKeyword}%,name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchSuppliers (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_suppliers')
      .select('*, rdt_users(name,avatar_url)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`description.ilike.%${filters.filterKeyword}%,name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchProducts (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_products')
      .select('*, rdt_users(name,avatar_url), rdt_product_categories(name), rdt_product_units(name)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      const searchQuery: string = fullTextQuery(filters.filterKeyword)
      query = query.textSearch('fts', searchQuery)
      // query = query.or(`description.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchProductUnits (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_product_units')
      .select('*, rdt_users(name,avatar_url)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchProductCategories (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_product_categories')
      .select('*, rdt_users(name,avatar_url)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    } else {
      query = query.eq('status', 'Active')
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchCanvass (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_canvasses')
      .select('*, rdt_users(name,avatar_url)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`description.ilike.%${filters.filterKeyword}%,name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchPurchaseOrders (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_purchase_orders')
      .select('*, rdt_users(name,avatar_url), rdt_suppliers(name)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`description.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchSaleTransactions (filters: { filterKeyword?: string, filterStatus?: string, filterDate?: string, filterCasher?: string, filterPaymentType?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_sale_transactions')
      .select('*, rdt_users(name,avatar_url), rdt_sales(*, rdt_products(description))', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.or(`customer_name.ilike.%${filters.filterKeyword}%`)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    // if (!filters.filterDateFrom && !filters.filterDateTo) {
    //   const date = format(new Date(), 'yyyy-MM-dd')
    //   const date2 = format(new Date(), 'yyyy-MM-dd')
    //   query = query.gte('transaction_date', date)
    //   query = query.lte('transaction_date', date2)
    // } else {
    //   // filter date from
    //   if (filters.filterDateFrom && filters.filterDateFrom !== '') {
    //     const date = format(new Date(filters.filterDateFrom), 'yyyy-MM-dd')
    //     query = query.gte('transaction_date', date)
    //   }

    //   // filter date to
    //   if (filters.filterDateTo && filters.filterDateTo !== '') {
    //     const date = format(new Date(filters.filterDateTo), 'yyyy-MM-dd')
    //     query = query.lte('transaction_date', date)
    //   }
    // }

    // filter date
    if (filters.filterDate && filters.filterDate !== '') {
      query = query.eq('transaction_date', format(new Date(filters.filterDate), 'yyyy-MM-dd'))
    } else {
      const date = format(new Date(), 'yyyy-MM-dd')
      query = query.eq('transaction_date', date)
    }

    // filter casher
    if (filters.filterCasher && filters.filterCasher !== '') {
      query = query.eq('casher_id', filters.filterCasher)
    }

    // filter payment type
    if (filters.filterPaymentType && filters.filterPaymentType !== '') {
      query = query.eq('payment_type', filters.filterPaymentType)
    }

    if (perPageCount > 0) {
      // Per Page from context
      const from = rangeFrom
      const to = from + (perPageCount - 1)

      // Per Page from context
      query = query.range(from, to)
    }

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchSales (filters: { filterKeyword?: string, filterStatus?: string, filterDateFrom?: string, filterDateTo?: string, filterCasher?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_sales')
      .select('*, rdt_users(name,avatar_url), rdt_products(description), rdt_sale_transactions(*)', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      const { data: products } = await supabase.from('rdt_products').select('id').or(`description.ilike.%${filters.filterKeyword}%`)
      const productIds: number[] = []
      products?.forEach(product => {
        productIds.push(product.id)
      })

      query = query.in('product_id', productIds)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.eq('status', filters.filterStatus)
    }

    if (!filters.filterDateFrom && !filters.filterDateTo) {
      const date = format(new Date(), 'yyyy-MM-dd')
      const date2 = format(new Date(), 'yyyy-MM-dd')
      query = query.gte('transaction_date', date)
      query = query.lte('transaction_date', date2)
    } else {
      // filter date from
      if (filters.filterDateFrom && filters.filterDateFrom !== '') {
        const date = format(new Date(filters.filterDateFrom), 'yyyy-MM-dd')
        query = query.gte('transaction_date', date)
      }

      // filter date to
      if (filters.filterDateTo && filters.filterDateTo !== '') {
        const date = format(new Date(filters.filterDateTo), 'yyyy-MM-dd')
        query = query.lte('transaction_date', date)
      }
    }

    // filter casher
    if (filters.filterCasher && filters.filterCasher !== '') {
      query = query.eq('casher_id', filters.filterCasher)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchPayrolls (filters: { filterKeyword?: string, filterDate?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_payrolls')
      .select('*, rdt_users(name,avatar_url), rdt_payroll_employees(*, rdt_employees(*))', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      query = query.eq('reference_code', filters.filterKeyword)
    }

    // filter date from
    if (filters.filterDate && filters.filterDate !== '') {
      const date = format(new Date(filters.filterDate), 'yyyy-MM-dd')
      // console.log('date', date)
      query = query.lte('from', date)
      query = query.gte('to', date)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    return { data, count }
  } catch (error) {
    console.error('fetch error', error)
    return { data: [], count: 0 }
  }
}

export async function searchActiveEmployees (searchTerm: string, excludedItems: excludedItemsTypes[]) {
  let query = supabase
    .from('rdt_employees')
    .select()
    .eq('status', 'Active')
    .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

  // Search match
  query = query.or(`firstname.ilike.%${searchTerm}%,middlename.ilike.%${searchTerm}%,lastname.ilike.%${searchTerm}%`)

  // Excluded already selected items
  excludedItems.forEach(item => {
    query = query.neq('id', item.id)
  })

  // Limit results
  query = query.limit(3)

  const { data, error } = await query

  if (error) console.error(error)

  return data ?? []
}
