# ABBC Interface

[![Lint](https://github.com/ABBC/uniswap-interface/workflows/Lint/badge.svg)](https://github.com/ABBC/uniswap-interface/actions?query=workflow%3ALint)
[![Tests](https://github.com/ABBC/uniswap-interface/workflows/Tests/badge.svg)](https://github.com/ABBC/uniswap-interface/actions?query=workflow%3ATests)
[![Styled With Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)

An open source interface for ABBC -- a protocol for decentralized exchange of Ethereum tokens.

- Website: [uniswap.org](https://uniswap.org/)
- Interface: [app.uniswap.org](https://app.uniswap.org)
- Docs: [uniswap.org/docs/](https://uniswap.org/docs/)
- Twitter: [@ABBCProtocol](https://twitter.com/ABBCProtocol)
- Reddit: [/r/ABBC](https://www.reddit.com/r/ABBC/)
- Email: [contact@uniswap.org](mailto:contact@uniswap.org)
- Discord: [ABBC](https://discord.gg/Y7TF6QA)
- Whitepaper: [Link](https://hackmd.io/C-DvwDSfSxuh-Gd4WKE_ig)

## Accessing the ABBC Interface

To access the ABBC Interface, use an IPFS gateway link from the
[latest release](https://github.com/ABBC/uniswap-interface/releases/latest), 
or visit [app.uniswap.org](https://app.uniswap.org).

## Listing a token

Please see the
[@uniswap/default-token-list](https://github.com/uniswap/default-token-list) 
repository.

## Development

### Install Dependencies

```bash
yarn
```

### Run

```bash
yarn start
```

### Configuring the environment (optional)

To have the interface default to a different network when a wallet is not connected:

1. Make a copy of `.env` named `.env.local`
2. Change `REACT_APP_NETWORK_ID` to `"{YOUR_NETWORK_ID}"`
3. Change `REACT_APP_NETWORK_URL` to e.g. `"https://{YOUR_NETWORK_ID}.infura.io/v3/{YOUR_INFURA_KEY}"` 

Note that the interface only works on testnets where both 
[ABBC V2](https://uniswap.org/docs/v2/smart-contracts/factory/) and 
[multicall](https://github.com/makerdao/multicall) are deployed.
The interface will not work on other networks.

## Contributions

**Please open all pull requests against the `master` branch.** 
CI checks will run against all PRs.

## Accessing ABBC Interface V1

The ABBC Interface supports swapping against, and migrating or removing liquidity from ABBC V1. However,
if you would like to use ABBC V1, the ABBC V1 interface for mainnet and testnets is accessible via IPFS gateways 
linked from the [v1.0.0 release](https://github.com/ABBC/uniswap-interface/releases/tag/v1.0.0).
