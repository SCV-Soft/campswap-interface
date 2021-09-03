import { t } from '@lingui/macro'
import { CRXCAMP, CAMP, XCAMP } from '../../../constants'
import { ChainId, CurrencyAmount, SUSHI_ADDRESS as CAMP_ADDRESS, Token } from '@sushiswap/sdk'
import { tryParseAmount } from '../../../functions'
import { useActiveWeb3React, useApproveCallback, useInariContract, useZenkoContract } from '../../../hooks'
import { useTokenBalances } from '../../wallet/hooks'
import { StrategyGeneralInfo, StrategyHook, StrategyTokenDefinitions } from '../types'
import useBaseStrategy from './useBaseStrategy'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useDerivedInariState } from '../hooks'

export const general: StrategyGeneralInfo = {
  name: 'CAMP → Cream',
  steps: ['CAMP', 'xCAMP', 'Cream'],
  zapMethod: 'stakeCampToCream',
  unzapMethod: 'unstakeCampFromCream',
  description: t`Stake CAMP for xCAMP and deposit into Cream in one click. xCAMP in Cream (crXCAMP) can be lent or used as collateral for borrowing.`,
  inputSymbol: 'CAMP',
  outputSymbol: 'xCAMP in Cream',
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

const useStakeCampToCreamStrategy = (): StrategyHook => {
  const { account } = useActiveWeb3React()
  const { zapIn, inputValue } = useDerivedInariState()
  const zenkoContract = useZenkoContract()
  const inariContract = useInariContract()
  const balances = useTokenBalances(account, [CAMP[ChainId.MAINNET], CRXCAMP])
  const cTokenAmountRef = useRef<CurrencyAmount<Token>>(null)
  const approveAmount = useMemo(() => (zapIn ? inputValue : cTokenAmountRef.current), [inputValue, zapIn])

  // Override approveCallback for this strategy as we need to approve CRXCAMP on zapOut
  const approveCallback = useApproveCallback(approveAmount, inariContract?.address)
  const { execute, setBalances, ...baseStrategy } = useBaseStrategy({
    id: 'stakeCampToCreamStrategy',
    general,
    tokenDefinitions,
  })

  const toCTokenAmount = useCallback(
    async (val: CurrencyAmount<Token>) => {
      if (!zenkoContract || !val) return null

      const bal = await zenkoContract.toCtoken(CRXCAMP.address, val.quotient.toString())
      return CurrencyAmount.fromRawAmount(CRXCAMP, bal.toString())
    },
    [zenkoContract]
  )

  // Run before executing transaction creation by transforming from xCAMP value to crXCAMP value
  // As you will be spending crXCAMP when unzapping from this strategy
  const preExecute = useCallback(
    async (val: CurrencyAmount<Token>) => {
      if (zapIn) return execute(val)
      return execute(await toCTokenAmount(val))
    },
    [execute, toCTokenAmount, zapIn]
  )

  useEffect(() => {
    toCTokenAmount(inputValue).then((val) => (cTokenAmountRef.current = val))
  }, [inputValue, toCTokenAmount])

  useEffect(() => {
    if (!zenkoContract || !balances) return

    const main = async () => {
      if (!balances[CRXCAMP.address]) return tryParseAmount('0', XCAMP)
      const bal = await zenkoContract.fromCtoken(
        CRXCAMP.address,
        balances[CRXCAMP.address].toFixed().toBigNumber(CRXCAMP.decimals).toString()
      )
      setBalances({
        inputTokenBalance: balances[CAMP[ChainId.MAINNET].address],
        outputTokenBalance: CurrencyAmount.fromRawAmount(XCAMP, bal.toString()),
      })
    }

    main()
  }, [balances, setBalances, zenkoContract])

  return useMemo(
    () => ({
      ...baseStrategy,
      approveCallback: [...approveCallback, approveAmount],
      setBalances,
      execute: preExecute,
    }),
    [approveAmount, approveCallback, baseStrategy, preExecute, setBalances]
  )
}

export default useStakeCampToCreamStrategy
