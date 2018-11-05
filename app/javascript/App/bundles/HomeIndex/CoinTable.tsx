import * as React from 'react'
import * as _ from 'lodash'
import { AgGridReact } from 'ag-grid-react'
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Grid,
  createStyles,
  withStyles,
  Typography,
} from '@material-ui/core'
import Icon from '~/bundles/common/components/Icon'
import ColumnNames from './ColumnNames'
import {
  formatAbbreviatedPrice,
  formatValue,
} from '~/bundles/common/utils/numberFormatters'
import { CoinData, EnhancedCoinData } from './types'
import SearchCoins from '../common/components/SearchCoins'

interface Props {
  classes: any
  isMobile: boolean
  currency: string
  coins: CoinData[]
  watchList: number[]
}

interface State {
  columnDefs: any
  rowData: EnhancedCoinData[]
}

const styles = (theme) =>
  createStyles({
    tableContainer: {
      width: '100%',
      maxWidth: '1200px',
      height: '100%',
      display: 'flex',
      flex: 1,
      [theme.breakpoints.up('md')]: {
        margin: '0 auto',
      },
    },
    headerContainer: {
      [theme.breakpoints.up('md')]: {
        width: '100%',
        maxWidth: '1200px',
        margin: '0 auto',
      },
    },
    title: {
      backgroundColor: '#fff',
      [theme.breakpoints.down('sm')]: {
        borderBottom: '1px solid #e5e8ed',
        paddingTop: `${theme.spacing.unit * 2}px !important`,
        paddingBottom: `${theme.spacing.unit}px !important`,
      },
    },
    search: {
      padding: `${theme.spacing.unit}px !important`,
      textAlign: 'center',
      [theme.breakpoints.up('md')]: {
        padding: `${theme.spacing.unit * 2}px !important`,
        backgroundColor: '#fff',
      },
    },
    nav: {
      backgroundColor: '#fff',
      paddingTop: `${theme.spacing.unit}px !important`,
      paddingBottom: `${theme.spacing.unit}px !important`,
      textAlign: 'center',
      [theme.breakpoints.down('sm')]: {
        borderBottom: '1px solid #e5e8ed',
      },
      [theme.breakpoints.up('md')]: {
        padding: `${theme.spacing.unit * 2}px !important`,
        textAlign: 'right',
      },
    },
    tableHeader: {
      height: '32px',
    },
    watchedColumnHeader: {
      paddingLeft: '4px !important',
    },
    watchedColumn: {
      paddingLeft: '4px !important',
      paddingBottom: '3px !important',
    },
    rankingColumnHeader: {
      paddingRight: '4px !important',
      color: '#333',
    },
    rankingColumn: {
      paddingRight: '4px !important',
      color: '#777',
    },
    coinColumnHeader: {
      color: '#333',
    },
    coinColumn: {
      color: '#777',
    },
    coinWrapper: {
      marginTop: '5px',
      marginBottom: '5px',
    },
    coinIcon: {
      width: '36px',
      maxWidth: '36px',
      flexShrink: 0,
      paddingRight: '4px',
    },
    coinSymbol: {},
    coinTitle: {
      fontSize: '0.8rem',
      fontWeight: 600,
    },
    coinDetailsLeft: {
      width: '40px',
      fontSize: '0.6rem',
    },
    coinDetailsRight: {
      width: '40px',
      fontSize: '0.6rem',
      textAlign: 'right',
    },
    priceColumnHeader: {
      paddingRight: '8px !important',
      textAlign: 'right',
      color: '#333',
    },
    priceColumn: {
      paddingRight: '8px !important',
      textAlign: 'right',
      color: '#333',
    },
  })

class CoinTable extends React.Component<Props, State> {
  public api
  public columnApi

  constructor(props) {
    super(props)

    // combine stars with coins
    const coins = props.coins || []
    const enhancedCoins = props.watchList
      ? coins.map((coin) => {
          const isWatched =
            _.findIndex(props.watchList, (id) => coin.id === id) >= 0

          return {
            ...coin,
            isWatched,
          }
        })
      : [...props.coins]

    const currency = 'USD'
    this.state = {
      columnDefs: ColumnNames(currency),
      rowData: enhancedCoins,
    }
  }

  // TODO: add lifecycle handlers for updated props

  public onGridReady = (params) => {
    this.api = params.api
    this.columnApi = params.columnApi

    this.api.sizeColumnsToFit()
  }

  public render() {
    const { isMobile, currency, classes } = this.props
    const currencyKey = currency.toLowerCase()

    return (
      <React.Fragment>
        <Grid container={true} className={classes.headerContainer}>
          <Grid item={true} xs={12}>
            <Typography variant="h5" align="center" className={classes.title}>
              Cryptocurrency prices today
            </Typography>
          </Grid>
          <Grid item={true} xs={12} md={9} className={classes.search}>
            <SearchCoins
              onSelect={(suggestion) =>
                (window.location.href = `/coins/${suggestion.slug}`)
              }
              unstyled={true}
            />
          </Grid>
          <Grid item={true} xs={12} md={3} className={classes.nav}>
            <a href="/coins?page=2">Next</a>
          </Grid>
        </Grid>

        {isMobile ? (
          <Table padding="none">
            <TableHead>
              <TableRow className={classes.tableHeader}>
                <TableCell className={classes.watchedColumnHeader} />
                <TableCell className={classes.rankingColumnHeader}>#</TableCell>
                <TableCell className={classes.coinColumnHeader}>
                  <Grid
                    container={true}
                    direction="row"
                    alignContent="flex-start"
                    alignItems="stretch"
                    wrap="nowrap"
                    className={classes.coinWrapper}
                  >
                    <Grid item={true} className={classes.coinIcon} />
                    <Grid item={true}>Coin</Grid>
                  </Grid>
                </TableCell>
                <TableCell className={classes.priceColumnHeader}>
                  Price
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {this.state.rowData.map((row) => {
                const {
                  id,
                  isWatched,
                  ranking,
                  price,
                  market_cap,
                  volume24,
                  name,
                  symbol,
                  slug,
                  image_url,
                } = row

                const formattedPrice =
                  typeof price !== 'undefined'
                    ? `$${formatValue(price[currencyKey], 4)}`
                    : ''
                const formattedMarketCap =
                  typeof market_cap !== 'undefined'
                    ? `$${formatAbbreviatedPrice(market_cap[currencyKey])}`
                    : ''
                const formattedVolume =
                  typeof volume24 !== 'undefined'
                    ? `$${formatAbbreviatedPrice(volume24[currencyKey])}`
                    : ''

                return (
                  <TableRow key={id}>
                    <TableCell className={classes.watchedColumn}>
                      <Icon
                        name="star"
                        solid={isWatched}
                        light={!isWatched}
                        className={isWatched ? 'aqua' : 'light-silver'}
                      />
                    </TableCell>
                    <TableCell className={classes.rankingColumn}>
                      {ranking}
                    </TableCell>
                    <TableCell className={classes.coinColumn}>
                      <Grid
                        container={true}
                        direction="row"
                        alignContent="flex-start"
                        alignItems="stretch"
                        wrap="nowrap"
                        className={classes.coinWrapper}
                      >
                        <Grid item={true} className={classes.coinIcon}>
                          <img alt={name} src={image_url} />
                        </Grid>
                        <Grid item={true}>
                          <Grid container={true}>
                            <Grid
                              item={true}
                              xs={12}
                              className={classes.coinTitle}
                            >
                              <a href={`/coins/${slug}`}>{name}</a>
                              <span className={classes.coinSymbol}>
                                {' '}
                                [{symbol}]
                              </span>
                            </Grid>
                            <Grid
                              item={true}
                              xs={3}
                              className={classes.coinDetailsLeft}
                            >
                              Mkt Cap
                            </Grid>
                            <Grid
                              item={true}
                              xs={3}
                              className={classes.coinDetailsRight}
                            >
                              {formattedMarketCap}
                            </Grid>
                            <Grid item={true} xs={6} />
                            <Grid
                              item={true}
                              xs={3}
                              className={classes.coinDetailsLeft}
                            >
                              Volume
                            </Grid>
                            <Grid
                              item={true}
                              xs={3}
                              className={classes.coinDetailsRight}
                            >
                              {formattedVolume}
                            </Grid>
                            <Grid item={true} xs={6} />
                          </Grid>
                        </Grid>
                      </Grid>
                    </TableCell>
                    <TableCell className={classes.priceColumn}>
                      <div>{formattedPrice}</div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        ) : (
          <div className={classes.tableContainer}>
            <div
              className="ag-theme-material"
              style={{
                width: '100%',
              }}
            >
              <AgGridReact
                enableSorting={true}
                suppressCellSelection={true}
                domLayout="autoHeight"
                columnDefs={this.state.columnDefs}
                rowData={this.state.rowData}
                onGridReady={this.onGridReady}
              />
            </div>
          </div>
        )}
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(CoinTable)
