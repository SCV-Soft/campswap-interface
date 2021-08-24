import { useCallback, useEffect, useState } from 'react'
import { useCampBarContract, useCampContract } from './useContract'

import Fraction from '../entities/Fraction'
import { ethers } from 'ethers'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useTransactionAdder } from '../state/transactions/hooks'

const { BigNumber } = ethers

const useCampBar = () => {
  const { account } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const campContract = useCampContract(true) // withSigner
  const barContract = useCampBarContract(true) // withSigner

  const [allowance, setAllowance] = useState('0')

  const fetchAllowance = useCallback(async () => {
    if (account) {
      try {
        const allowance = await campContract?.allowance(account, barContract?.address)
        const formatted = Fraction.from(BigNumber.from(allowance), BigNumber.from(10).pow(18)).toString()
        setAllowance(formatted)
      } catch (error) {
        setAllowance('0')
        throw error
      }
    }
  }, [account, barContract, campContract])

  useEffect(() => {
    if (account && barContract && campContract) {
      fetchAllowance()
    }
    const refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, barContract, fetchAllowance, campContract])

  const approve = useCallback(async () => {
    try {
      const tx = await campContract?.approve(barContract?.address, ethers.constants.MaxUint256.toString())
      return addTransaction(tx, { summary: 'Approve' })
    } catch (e) {
      return e
    }
  }, [addTransaction, barContract, campContract])

  const enter = useCallback(
    // todo: this should be updated with BigNumber as opposed to string
    async (amount: string) => {
      try {
        const tx = await barContract?.enter(ethers.utils.parseUnits(amount))
        return addTransaction(tx, { summary: 'Enter CampBar' })
      } catch (e) {
        return e
      }
    },
    [addTransaction, barContract]
  )

  const leave = useCallback(
    // todo: this should be updated with BigNumber as opposed to string
    async (amount: string) => {
      try {
        const tx = await barContract?.leave(ethers.utils.parseUnits(amount))
        return addTransaction(tx, { summary: 'Leave CampBar' })
      } catch (e) {
        console.error(e)
        return e
      }
    },
    [addTransaction, barContract]
  )

  return { allowance, approve, enter, leave }
}

export default useCampBar
