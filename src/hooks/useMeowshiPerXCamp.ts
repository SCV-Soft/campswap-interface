import { useBentoBoxContract } from './useContract'
import { useEffect, useState } from 'react'
import { XCAMP } from '../constants'
import { BigNumber } from 'ethers'

export default function useMeowshiPerXCamp() {
  const bentoboxContract = useBentoBoxContract()
  const [state, setState] = useState<[BigNumber, BigNumber]>([BigNumber.from('0'), BigNumber.from('0')])

  useEffect(() => {
    if (!bentoboxContract) return
    ;(async () => {
      const toShare = await bentoboxContract.toShare(XCAMP.address, '1'.toBigNumber(XCAMP.decimals), false)
      const toAmount = await bentoboxContract.toAmount(XCAMP.address, '1'.toBigNumber(XCAMP.decimals), false)
      setState([toShare, toAmount])
    })()
  }, [bentoboxContract])

  return state
}
