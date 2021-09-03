import { t } from '@lingui/macro'
import { CAMP, XCAMP } from '../../../constants'
import { ChainId } from '@sushiswap/sdk'
import { CAMP_ADDRESS } from '../../../constants/campswapAddresses'
import { tryParseAmount } from '../../../functions'
import { useBentoBalance } from '../../bentobox/hooks'
import { useActiveWeb3React } from '../../../hooks'
import { useTokenBalances } from '../../wallet/hooks'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import { useEffect, useMemo } from 'react'
import useBaseStrategy from './useBaseStrategy'
import useBentoBoxTrait from '../traits/useBentoBoxTrait'

export const general: StrategyGeneralInfo = {
  name: 'CAMP → Bento',
  steps: ['CAMP', 'xCAMP', 'BentoBox'],
  zapMethod: 'stakeCampToBento',
  unzapMethod: 'unstakeCampFromBento',
  description: t`Stake CAMP for xCAMP and deposit into BentoBox in one click. xCAMP in BentoBox is automatically
                invested into a passive yield strategy, and can be lent or used as collateral for borrowing in Kashi.`,
  inputSymbol: 'CAMP',
  outputSymbol: 'xCAMP in BentoBox',
}

export const tokenDefinitions: StrategyTokenDefinitions = {
  inputToken: {
    chainId: ChainId.MAINNET,
    address: CAMP_ADDRESS[ChainId.MAINNET],
    decimals: 18,
    symbol: 'CAMP',
  },
  outputToken: {
    chainId: ChainId.MAINNET,
    address: '0x8798249c2E607446EfB7Ad49eC89dD1865Ff4272',
    decimals: 18,
    symbol: 'XCAMP',
  },
}

const useStakeCampToBentoStrategy = (): StrategyHook => {
  const { account } = useActiveWeb3React()
  const balances = useTokenBalances(account, [CAMP[ChainId.MAINNET], XCAMP])
  const xCampBentoBalance = useBentoBalance(XCAMP.address)

  // Strategy ends in BentoBox so use BaseBentoBox strategy
  const baseStrategy = useBaseStrategy({
    id: 'stakeCampToBentoStrategy',
    general,
    tokenDefinitions,
  })

  // Add in BentoBox trait as output is in BentoBox
  const { setBalances, ...strategy } = useBentoBoxTrait(baseStrategy)

  useEffect(() => {
    if (!balances) return

    setBalances({
      inputTokenBalance: balances[CAMP[ChainId.MAINNET].address],
      outputTokenBalance: tryParseAmount(xCampBentoBalance?.value?.toFixed(18) || '0', XCAMP),
    })
  }, [balances, setBalances, xCampBentoBalance?.value])

  return useMemo(
    () => ({
      setBalances,
      ...strategy,
    }),
    [strategy, setBalances]
  )
}

export default useStakeCampToBentoStrategy
