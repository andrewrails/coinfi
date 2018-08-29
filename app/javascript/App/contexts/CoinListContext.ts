import * as React from 'react'
import { ICoin } from '~/bundles/common/types'

export interface ICoinListContextType {
  status: string
  watchlist: ICoin[]
  toplist: ICoin[]
  isInitializing: () => boolean
  isWatchlist: boolean
  getWatchlist: () => ICoin[]
  getToplist: () => ICoin[]
  showWatchlist: () => void
  showToplist: () => void
  isCoinInWatchlist: (id: number) => boolean
  addCoinToWatchlist: (id: number) => void
  removeCoinFromWatchlist: (id: number) => void
  coinlist: ICoin[]
  selectedCoinSlug: string | null
  isLoading: boolean
  isReady: boolean
  selectCoinBySlug: (coinSlug: string) => void
}

const CoinListContext = React.createContext(null)

export default CoinListContext