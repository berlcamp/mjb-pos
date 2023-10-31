import type { Employee } from '@/types'

export function fullTextQuery (string: string): string {
  // const isStringAllNumbers = (str: string) => {
  //   return /^\d+$/.test(str)
  // }

  // if (isStringAllNumbers(string)) {
  //   return parseInt(string, 10)
  // }

  const searchSplit = string.split(' ')

  const keywordArray: any[] = []
  searchSplit.forEach(item => {
    if (item !== '') keywordArray.push(`'${item}'`)
  })
  const searchQuery = keywordArray.join(' & ')

  return searchQuery
}

export function capitalizeWords (inputString: string) {
  return inputString
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function getAvatar (userId: string) {
  //
}

export function generateReferenceCode () {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const charactersLength = characters.length
  let counter = 0
  while (counter < 8) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
    counter += 1
  }
  return result
}

export function getCaBalance (item: Employee) {
  const totalCashAdvance = item.rdt_cash_advances ? item.rdt_cash_advances.reduce((accumulator, currentValue) => accumulator + Number(currentValue.amount), 0) : 0
  const totalPayrollDeduction = item.rdt_payroll_employees ? item.rdt_payroll_employees.reduce((accumulator, currentValue) => accumulator + Number(currentValue.ca_deduction), 0) : 0
  return totalCashAdvance - totalPayrollDeduction
}
