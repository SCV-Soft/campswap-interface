import { t } from '@lingui/macro'
import { AXCAMP, CAMP } from '../../../constants'
import { ChainId, SUSHI_ADDRESS as CAMP_ADDRESS } from '@sushiswap/sdk'
import { useActiveWeb3React } from '../../../hooks'
import { useTokenBalances } from '../../wallet/hooks'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import useBaseStrategy from './useBaseStrategy'
import { useEffect, useMemo } from 'react'

export const general: StrategyGeneralInfo = {
  name: 'CAMP → Aave',
  steps: ['CAMP', 'xCAMP', 'Aave'],
  zapMethod: 'stakeCampToAave',
  unzapMethod: 'unstakeCampFromAave',
  description: t`Stake CAMP for xCAMP and deposit into Aave in one click. xCAMP in Aave (aXCAMP) can be lent or used as collateral for borrowing.`,
  inputSymbol: 'CAMP',
  outputSymbol: 'xCAMP in Aave',
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
    address: '0xf256cc7847e919fac9b808cc216cac87ccf2f47a',
    decimals: 18,
    symbol: 'aXCAMP',
  },
}

const useStakeCampToAaveStrategy = (): StrategyHook => {
  const { account } = useActiveWeb3React()
  const balances = useTokenBalances(account, [CAMP[ChainId.MAINNET], AXCAMP])
  const { setBalances, ...strategy } = useBaseStrategy({
    id: 'stakeCampToAaveStrategy',
    general,
    tokenDefinitions,
  })

  useEffect(() => {
    if (!balances) return

    setBalances({
      inputTokenBalance: balances[CAMP[ChainId.MAINNET].address],
      outputTokenBalance: balances[AXCAMP.address],
    })
  }, [balances, setBalances])

  return useMemo(
    () => ({
      ...strategy,
      setBalances,
    }),
    [strategy, setBalances]
  )
}

export default useStakeCampToAaveStrategy
