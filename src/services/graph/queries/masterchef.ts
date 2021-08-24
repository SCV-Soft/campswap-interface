import gql from 'graphql-tag'

export const poolsQuery = gql`
  query poolsQuery($first: Int! = 1000, $skip: Int! = 0, $orderBy: String! = "id", $orderDirection: String! = "desc") {
    pools(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      pair
      allocPoint
      lastRewardBlock
      accCampPerShare
      balance
      userCount
      owner {
        id
        campPerBlock
        totalAllocPoint
      }
    }
  }
`

export const masterChefV1PairAddressesQuery = gql`
  query masterChefV1PairAddresses(
    $first: Int! = 1000
    $skip: Int! = 0
    $orderBy: String! = "id"
    $orderDirection: String! = "desc"
  ) {
    pools(first: $first, skip: $skip, orderBy: $orderBy, orderDirection: $orderDirection) {
      id
      allocPoint
      accCampPerShare
      pair {
        id
      }
    }
  }
`

export const masterChefV1TotalAllocPointQuery = gql`
  query masterChefV1TotalAllocPoint($id: String! = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd") {
    masterChef(id: $id) {
      id
      totalAllocPoint
    }
  }
`

export const masterChefV1CampPerBlockQuery = gql`
  query masterChefV1CampPerBlock($id: String! = "0xc2edad668740f1aa35e4d8f227fb8e17dca888cd") {
    masterChef(id: $id) {
      id
      campPerBlock
    }
  }
`
