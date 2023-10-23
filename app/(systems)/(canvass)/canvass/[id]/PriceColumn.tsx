import React from 'react'
import type { SupplierPricesTypes } from '@/types'
import { useSupabase } from '@/context/SupabaseProvider'
// Redux imports
import { useSelector, useDispatch } from 'react-redux'
import { updateList } from '@/GlobalRedux/Features/listSlice'
import { useFilter } from '@/context/FilterContext'
import { CheckCircleIcon, StopIcon } from '@heroicons/react/20/solid'

function PriceColumn ({ itemId, prices, supplierId, status }: { itemId: string, prices: SupplierPricesTypes[], supplierId: string, status: string }) {
  const { supabase } = useSupabase()
  const { setToast, hasAccess } = useFilter()

  // Redux staff
  const globallist = useSelector((state: any) => state.list.value)
  const dispatch = useDispatch()

  const handleCheck = async (checked: boolean) => {
    // is Approver?
    if (!hasAccess('approve_price_canvass') || status === 'Approved') return

    const newPrices = prices.map(p => {
      if (p.supplier_id.toString() === supplierId.toString()) {
        return { ...p, checked }
      }
      // uncheck all other suppliers
      return { ...p, checked: false }
    })

    try {
      const { error } = await supabase
        .from('rdt_canvass_items')
        .update({
          prices: newPrices
        })
        .eq('id', itemId)

      if (error) throw new Error(error.message)

      // Update data in redux
      const items = [...globallist]
      const updatedData = { prices: newPrices, id: itemId }
      const foundIndex = items.findIndex(x => x.id === itemId)
      items[foundIndex] = { ...items[foundIndex], ...updatedData }
      dispatch(updateList(items))

      // pop up the success message
      setToast('success', 'Successfully saved.')
    } catch (e) {
      console.error(e)
    }
  }

  // get the price of specific supplier
  let price = ''
  let unit = ''
  let isChecked = false
  prices.forEach(p => {
    if (p.supplier_id.toString() === supplierId.toString()) {
      price = p.price
      unit = p.unit
      isChecked = p.checked
    }
  })

  // is Approver?
  const isApprover = hasAccess('approve_price_canvass')

  return (
    <td className='app__td'>
      <label className={`flex items-center space-x-1 ${isApprover && 'cursor-pointer'}`} htmlFor={`chk-${itemId}-${supplierId}`} onClick={async () => await handleCheck(!isChecked)}>
        {
          (price !== '' && !isChecked && isApprover) && <StopIcon id={`chk-${itemId}-${supplierId}`} className='w-5 h-5 text-gray-300'/>
        }
        {
          (price !== '' && isChecked) && <CheckCircleIcon id={`chk-${itemId}-${supplierId}`} className='w-5 h-5 text-green-500'/>
        }
        <span>{price} {unit !== '' && `(${unit})`}</span>
      </label>
    </td>
  )
}

export default PriceColumn
