import { ChainId } from '@sushiswap/sdk'
import LPToken from '../types/LPToken'
import ReactGA from 'react-ga'
import { ethers } from 'ethers'
import { signERC2612Permit } from 'eth-permit'
import { useActiveWeb3React } from '../hooks/useActiveWeb3React'
import { useCallback } from 'react'
import { useCampRollContract } from '../hooks/useContract'

const useCampRoll = (version: 'v1' | 'v2' = 'v2') => {
  const { chainId, library, account } = useActiveWeb3React()
  const campRoll = useCampRollContract(version)
  const ttl = 60 * 20

  let from = ''

  if (chainId === ChainId.MAINNET) {
    from = 'Uniswap'
  } else if (chainId === ChainId.BSC) {
    from = 'PancakeSwap'
  }

  const migrate = useCallback(
    async (lpToken: LPToken, amount: ethers.BigNumber) => {
      if (campRoll) {
        const deadline = Math.floor(new Date().getTime() / 1000) + ttl
        const args = [
          lpToken.tokenA.address,
          lpToken.tokenB.address,
          amount,
          ethers.constants.Zero,
          ethers.constants.Zero,
          deadline,
        ]

        const gasLimit = await campRoll.estimateGas.migrate(...args)
        const tx = campRoll.migrate(...args, {
          gasLimit: gasLimit.mul(120).div(100),
        })

        ReactGA.event({
          category: 'Migrate',
          action: `${from}->Campswap`,
          label: 'migrate',
        })

        return tx
      }
    },
    [campRoll, ttl, from]
  )

  const migrateWithPermit = useCallback(
    async (lpToken: LPToken, amount: ethers.BigNumber) => {
      if (account && campRoll) {
        const deadline = Math.floor(new Date().getTime() / 1000) + ttl
        const permit = await signERC2612Permit(
          library,
          lpToken.address,
          account,
          campRoll.address,
          amount.toString(),
          deadline
        )
        const args = [
          lpToken.tokenA.address,
          lpToken.tokenB.address,
          amount,
          ethers.constants.Zero,
          ethers.constants.Zero,
          deadline,
          permit.v,
          permit.r,
          permit.s,
        ]

        const gasLimit = await campRoll.estimateGas.migrateWithPermit(...args)
        const tx = await campRoll.migrateWithPermit(...args, {
          gasLimit: gasLimit.mul(120).div(100),
        })

        ReactGA.event({
          category: 'Migrate',
          action: `${from}->Campswap`,
          label: 'migrateWithPermit',
        })

        return tx
      }
    },
    [account, library, campRoll, ttl, from]
  )

  return {
    migrate,
    migrateWithPermit,
  }
}

export default useCampRoll
