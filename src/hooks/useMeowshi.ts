import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMeowshiContract, useCampBarContract, useCampContract } from './useContract'

import { BalanceProps } from './useTokenBalance'
import Fraction from '../entities/Fraction'
import { ethers } from 'ethers'
import { useActiveWeb3React } from './useActiveWeb3React'
import { useTransactionAdder } from '../state/transactions/hooks'
import { ApprovalState } from './useApproveCallback'

const { BigNumber } = ethers

const useMeowshi = (camp: boolean) => {
  const { account } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()
  const campContract = useCampContract(true)
  const barContract = useCampBarContract(true)
  const meowshiContract = useMeowshiContract(true)
  const [pendingApproval, setPendingApproval] = useState(false)

  const [allowance, setAllowance] = useState('0')
  const fetchAllowance = useCallback(async () => {
    if (account) {
      try {
        let allowance
        if (camp) {
          allowance = await campContract?.allowance(account, meowshiContract?.address)
        } else {
          allowance = await barContract?.allowance(account, meowshiContract?.address)
        }

        const formatted = Fraction.from(BigNumber.from(allowance), BigNumber.from(10).pow(18)).toString()
        setAllowance(formatted)
      } catch (error) {
        setAllowance('0')
      }
    }
  }, [account, camp, campContract, meowshiContract?.address, barContract])

  useEffect(() => {
    if (account && meowshiContract) {
      if ((camp && campContract) || (!camp && barContract)) {
        fetchAllowance()
      }
    }

    const refreshInterval = setInterval(fetchAllowance, 10000)
    return () => clearInterval(refreshInterval)
  }, [account, meowshiContract, fetchAllowance, campContract, barContract, camp])

  const approvalState: ApprovalState = useMemo(() => {
    if (!account) return ApprovalState.UNKNOWN
    if (pendingApproval) return ApprovalState.PENDING
    if (!allowance || Number(allowance) === 0) return ApprovalState.NOT_APPROVED

    return ApprovalState.APPROVED
  }, [account, allowance, pendingApproval])

  const approve = useCallback(async () => {
    try {
      setPendingApproval(true)

      let tx
      if (camp) {
        tx = await campContract?.approve(meowshiContract?.address, ethers.constants.MaxUint256.toString())
      } else {
        tx = await barContract?.approve(meowshiContract?.address, ethers.constants.MaxUint256.toString())
      }

      addTransaction(tx, { summary: 'Approve' })
      await tx.wait()
      return tx
    } catch (e) {
      return e
    } finally {
      setPendingApproval(false)
    }
  }, [camp, addTransaction, campContract, meowshiContract?.address, barContract])

  const meow = useCallback(
    async (amount: BalanceProps | undefined) => {
      if (amount?.value) {
        try {
          const tx = await meowshiContract?.meow(account, amount?.value)
          addTransaction(tx, { summary: 'Enter Meowshi' })
          return tx
        } catch (e) {
          return e
        }
      }
    },
    [account, addTransaction, meowshiContract]
  )

  const unmeow = useCallback(
    async (amount: BalanceProps | undefined) => {
      if (amount?.value) {
        try {
          const tx = await meowshiContract?.unmeow(account, amount?.value)
          addTransaction(tx, { summary: 'Leave Meowshi' })
          return tx
        } catch (e) {
          return e
        }
      }
    },
    [account, addTransaction, meowshiContract]
  )

  const meowCamp = useCallback(
    async (amount: BalanceProps | undefined) => {
      if (amount?.value) {
        try {
          const tx = await meowshiContract?.meowCamp(account, amount?.value)
          addTransaction(tx, { summary: 'Enter Meowshi' })
          return tx
        } catch (e) {
          return e
        }
      }
    },
    [account, addTransaction, meowshiContract]
  )

  const unmeowCamp = useCallback(
    async (amount: BalanceProps | undefined) => {
      if (amount?.value) {
        try {
          const tx = await meowshiContract?.unmeowCamp(account, amount?.value)
          addTransaction(tx, { summary: 'Leave Meowshi' })
          return tx
        } catch (e) {
          return e
        }
      }
    },
    [account, addTransaction, meowshiContract]
  )

  return {
    approvalState,
    approve,
    meow,
    unmeow,
    meowCamp,
    unmeowCamp,
  }
}

export default useMeowshi
