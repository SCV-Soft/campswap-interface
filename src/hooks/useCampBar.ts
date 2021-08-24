import { Currency, CurrencyAmount, Token } from '@sushiswap/sdk'

import { useCallback } from 'react'
import { useCampBarContract } from '../hooks/useContract'
import { useTransactionAdder } from '../state/transactions/hooks'

const useCampBar = () => {
  const addTransaction = useTransactionAdder()
  const barContract = useCampBarContract()

  const enter = useCallback(
    async (amount: CurrencyAmount<Token> | undefined) => {
      if (amount?.quotient) {
        try {
          const tx = await barContract?.enter(amount?.quotient.toString())
          return addTransaction(tx, { summary: 'Enter CampBar' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  const leave = useCallback(
    async (amount: CurrencyAmount<Token> | undefined) => {
      if (amount?.quotient) {
        try {
          const tx = await barContract?.leave(amount?.quotient.toString())
          return addTransaction(tx, { summary: 'Leave CampBar' })
        } catch (e) {
          return e
        }
      }
    },
    [addTransaction, barContract]
  )

  return { enter, leave }
}

export default useCampBar
