import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { fullTextQuery } from '@/utils/text-helper'
import { format } from 'date-fns'

import type { Employee, excludedItemsTypes } from '@/types'

const supabase = createClientComponentClient()

export async function fetchEmployees (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_employees')
      .select('*', { count: 'exact' })
      .eq('org_id', process.env.NEXT_PUBLIC_ORG_ID)

    // Search match
    if (filters.filterKeyword && filters.filterKeyword !== '') {
      const searchQuery: string = fullTextQuery(filters.filterKeyword)
      query = query.textSearch('fts', searchQuery)
    }

    // filter status
    if (filters.filterStatus && filters.filterStatus !== '') {
      query = query.neq('status', filters.filterStatus)
    }

    // Per Page from context
    const from = rangeFrom
    const to = from + (perPageCount - 1)

    // Per Page from context
    query = query.range(from, to)

    // Order By
    query = query.order('id', { ascending: false })

    const { data: userData, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const data: Employee[] = userData

    return { data, count }
  } catch (error) {
    console.error('fetch employee error', error)
    return { data: [], count: 0 }
  }
}

export async function fetchAccounts (filters: { filterKeyword?: string, filterStatus?: string }, perPageCount: number, rangeFrom: number) {
  try {
    let query = supabase
      .from('rdt_users')
      .select('*', { count: 'exact' })
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

    const { data: userData, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const data: Employee[] = userData

    return { data, count }
  } catch (error) {
    console.error('fetch employee error', error)
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
