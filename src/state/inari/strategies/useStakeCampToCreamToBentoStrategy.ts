import { t } from '@lingui/macro'
import { CRXCAMP, CAMP } from '../../../constants'
import { ChainId, CAMP_ADDRESS, Token } from '@sushiswap/sdk'
import { e10, tryParseAmount } from '../../../functions'
import { useBentoBalance } from '../../bentobox/hooks'
import { useActiveWeb3React, useZenkoContract } from '../../../hooks'
import { useTokenBalances } from '../../wallet/hooks'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import { useCallback, useEffect, useMemo } from 'react'
import useCampPerXCamp from '../../../hooks/useXCampPerCamp'
import { BigNumber } from 'ethers'
import useBaseStrategy from './useBaseStrategy'
import useBentoBoxTrait from '../traits/useBentoBoxTrait'

export const general: StrategyGeneralInfo = {
  name: 'Cream → Bento',
  steps: ['CAMP', 'crXCAMP', 'BentoBox'],
  zapMethod: 'stakeCampToCreamToBento',
  unzapMethod: 'unstakeCampFromCreamFromBento',
  description: t`Stake CAMP for xCAMP into Cream and deposit crXCAMP into BentoBox in one click.`,
  inputSymbol: 'CAMP',
  outputSymbol: 'crXCAMP in BentoBox',
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
    address: '0x228619cca194fbe3ebeb2f835ec1ea5080dafbb2',
    decimals: 8,
    symbol: 'crXCAMP',
  },
}

const useStakeCampToCreamToBentoStrategy = (): StrategyHook => {
  const { account } = useActiveWeb3React()
  const zenkoContract = useZenkoContract()
  const balances = useTokenBalances(account, [CAMP[ChainId.MAINNET]])
  const campPerXCamp = useCampPerXCamp(true)
  const crxCampBentoBalance = useBentoBalance(CRXCAMP.address)

  // Strategy ends in BentoBox so use BaseBentoBox strategy
  const baseStrategy = useBaseStrategy({
    id: 'stakeCampToCreamToBentoStrategy',
    general,
    tokenDefinitions,
  })

  // Add in BentoBox trait as output is in BentoBox
  const { setBalances, calculateOutputFromInput: _, ...strategy } = useBentoBoxTrait(baseStrategy)

  useEffect(() => {
    if (!balances) return

    setBalances({
      inputTokenBalance: balances[CAMP[ChainId.MAINNET].address],
      outputTokenBalance: tryParseAmount(crxCampBentoBalance?.value?.toFixed(8) || '0', CRXCAMP),
    })
  }, [balances, setBalances, crxCampBentoBalance?.value])

  const calculateOutputFromInput = useCallback(
    async (zapIn: boolean, inputValue: string, inputToken: Token, outputToken: Token) => {
      if (!campPerXCamp || !inputValue || !zenkoContract) return null

      if (zapIn) {
        const value = inputValue.toBigNumber(18).mulDiv(e10(18), campPerXCamp.toString().toBigNumber(18)).toString()
        const cValue = await zenkoContract.toCtoken(CRXCAMP.address, value)
        return cValue.toFixed(outputToken.decimals)
      } else {
        const cValue = await zenkoContract.fromCtoken(CRXCAMP.address, inputValue.toBigNumber(inputToken.decimals))
        const value = BigNumber.from(cValue).mulDiv(campPerXCamp.toString().toBigNumber(18), e10(18))
        return value.toFixed(outputToken.decimals)
      }
    },
    [campPerXCamp, zenkoContract]
  )

  return useMemo(
    () => ({
      ...strategy,
      setBalances,
      calculateOutputFromInput,
    }),
    [strategy, calculateOutputFromInput, setBalances]
  )
}

export default useStakeCampToCreamToBentoStrategy
