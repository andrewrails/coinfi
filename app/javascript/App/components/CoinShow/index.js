import React, { Component, Fragment } from 'react'
import {
  Layout,
  Card,
  Button,
  Menu,
  Dropdown,
  Icon,
  List,
  Col,
  Row,
  Avatar,
} from 'antd'
import styled from 'styled-components'
import axios from 'axios'
import FlexGrid from './../shared/FlexGrid'
import FlexGridItem from './../shared/FlexGridItem'
import SearchCoins from './../shared/SearchCoins'
import CoinCharts from './../CoinCharts'
import SectionHeader from './../shared/SectionHeader'
import SectionHeaderTight from './../shared/SectionHeaderTight'
import CustomIcon from '../Icon'
import CoinListDrawer from './../shared/CoinListDrawer'
import CoinList from './../shared/CoinList'
import newsfeedContainer from './../../containers/newsfeed'
import FundamentalsData from './FundamentalsData'
import LinksData from './LinksData'

const { Header, Footer, Content } = Layout

class CoinShow extends Component {
  state = {
    liveCoinArr: [],
    currency: 'USD',
    watched: this.props.watching,
    iconLoading: false,
  }

  watchlistHandler(coin) {
    if (window.location == `/coins/${coin.get('name')}`) {
      window.location = `/coins/${coin
        .get('name')
        .replace(/ /, '-')
        .toLowerCase()}`
    }
  }

  watchCoinHandler = () => {
    this.setState({
      watched: !this.state.watched,
      iconLoading: true,
    })

    let params
    !this.state.watched
      ? (params = { watchCoin: this.props.coinObj.id })
      : (params = { unwatchCoin: this.props.coinObj.id })
    axios
      .patch('/api/user', params)
      .then((data) => {
        this.setState({
          iconLoading: false,
        })
      })
      .catch((error) => {
        console.log(error)
      })
  }

  changeCurrencyHandler = ({ key }) => {
    this.setState({
      currency: key,
    })
  }

  render() {
    const {
      symbol,
      priceData,
      annotations,
      isTradingViewVisible,
      coinObj,
      watching,
    } = this.props

    let coinsCollection
    if (this.state.liveCoinArr.length) {
      coinsCollection = this.state.liveCoinArr
    } else {
      coinsCollection = this.props.coins
    }

    const percentChange1h = {
      positive: coinObj.change1h > 0,
      value: coinObj.change1h,
    }

    const currencyMenu = (
      <Menu onClick={this.changeCurrencyHandler}>
        <Menu.Item key="USD">USD</Menu.Item>
        <Menu.Item key="BTC">BTC</Menu.Item>
      </Menu>
    )

    return (
      <Fragment>
        <Layout>
          <Content>
            {window.isDesktop && (
              <Wrapper>
                <CoinList
                  {...this.props}
                  watchlistHandler={this.watchlistHandler}
                />
              </Wrapper>
            )}
            <div style={window.isDesktop ? { marginLeft: 200 } : {}}>
              <SectionHeader>
                <HideLarge>
                  <Button
                    type="primary"
                    icon="bars"
                    onClick={() =>
                      this.props.enableUI('coinListDrawer', {
                        fullScreen: true,
                      })
                    }
                    style={{ marginRight: '1rem' }}
                  >
                    Coin List
                  </Button>
                </HideLarge>

                <SearchCoins {...this.props} coinShow />
              </SectionHeader>

              <div style={{ background: '#fff' }}>
                <ButtonWrap>
                  <Dropdown overlay={currencyMenu}>
                    <Button size="small" style={{ marginLeft: 8, margin: 10 }}>
                      {this.state.currency} <Icon type="down" />
                    </Button>
                  </Dropdown>
                  <Button
                    icon="star"
                    size="small"
                    type="primary"
                    onClick={this.watchCoinHandler}
                    ghost={!this.state.watched}
                    loading={this.state.iconLoading}
                  >
                    {this.state.watched ? 'Unwatch coin' : 'Watch coin'}
                  </Button>
                </ButtonWrap>
                <Section>
                  <Div style={{ marginBottom: '1.5rem' }}>
                    <img alt={coinObj.name} src={coinObj.image_url} />
                  </Div>
                  <Div marginBottom>
                    <SpanTitle>{coinObj.name}</SpanTitle>
                    <Span style={{ fontSize: 16 }}>{symbol}</Span>
                  </Div>
                  <Div>
                    <Span
                      style={{
                        fontSize: 18,
                        fontWeight: 'bold',
                        marginRight: '.75rem',
                      }}
                    >
                      {this.state.currency === 'USD' ? '$' : ''}
                      {coinObj.price[this.state.currency.toLowerCase()]}{' '}
                      {this.state.currency}
                    </Span>
                    <Span
                      style={
                        ({ fontSize: 14 },
                        percentChange1h.positive
                          ? { color: '#12d8b8' }
                          : { color: '#ff6161' })
                      }
                    >
                      {percentChange1h.value > 0 ? (
                        <Icon
                          type="caret-up"
                          style={{ marginRight: '.25rem' }}
                        />
                      ) : (
                        <Icon
                          type="caret-down"
                          style={{ marginRight: '.25rem' }}
                        />
                      )}
                      <span>{percentChange1h.value}%</span>
                    </Span>
                  </Div>
                </Section>

                <FlexGridWrapper>
                  <FlexGrid>
                    <FlexGridItem component={'fundamentals'}>
                      <Card
                        title="Team"
                        style={{ ...cardStyle, ...{ display: 'none' } }}
                      >
                        <TeamDiv style={{ marginLeft: 0 }}>
                          <Avatar
                            size={64}
                            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                            style={{ marginBottom: 20 }}
                          />
                          <strong>Name</strong>
                          <p>title</p>
                        </TeamDiv>
                        <TeamDiv style={{ marginRight: 0 }}>
                          <Avatar
                            size={64}
                            src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png"
                            style={{ marginBottom: 20 }}
                          />
                          <strong>Name</strong>
                          <p>title</p>
                        </TeamDiv>
                      </Card>
                    </FlexGridItem>

                    <FlexGridItem component={'fundamentals'}>
                      <Card
                        title="Ratings"
                        style={{ ...cardStyle, ...{ display: 'none' } }}
                      >
                        <RatingsDiv style={{ marginLeft: 0 }}>
                          <strong>4.0</strong>
                          <span>
                            ICO bench <br />expert rating
                          </span>
                        </RatingsDiv>
                        <RatingsDiv style={{ marginRight: 0 }}>
                          <strong>Very High</strong>
                          <span>
                            ICO drops<br /> score (interest)
                          </span>
                        </RatingsDiv>
                      </Card>
                    </FlexGridItem>

                    <FlexGridItem component={'fundamentals'}>
                      <Card
                        title="Summary"
                        style={{ ...cardStyle, ...{ display: 'none' } }}
                      >
                        <p>
                          {' '}
                          Lorem ipsum dolor sit amet, consectetur adipiscing
                          elit. Integer nec odio. Praesent libero. Sed cursus
                          ante dapibus diam. Sed nisi. Nulla quis sem at nibh
                          elementum imperdiet. Duis sagittis ipsum. Praesent
                          mauris. Fusce nec tellus sed augue semper porta.
                          Mauris massa. Vestibulum lacinia arcu eget nulla.
                          Class aptent taciti sociosqu ad litora torquent per
                          conubia nostra, per inceptos himenaeos. Curabitur
                          sodales ligula in libero.{' '}
                        </p>
                      </Card>
                    </FlexGridItem>

                    <FlexGridItem component={'fundamentals'}>
                      <Card title="Fundamentals" style={cardStyle}>
                        <List
                          itemLayout="horizontal"
                          dataSource={FundamentalsData(
                            coinObj,
                            this.state.currency,
                          )}
                          renderItem={(item) => {
                            if (item.title === '24HR') {
                              return (
                                <Fragment>
                                  <span
                                    style={{
                                      ...{ marginRight: '.4rem' },
                                      ...{ top: -6, position: 'relative' },
                                    }}
                                    className="ant-list-item-meta-title"
                                  >
                                    {item.title}
                                  </span>
                                  <span
                                    style={{
                                      ...{ marginRight: '1.5rem' },
                                      ...{ top: -6, position: 'relative' },
                                    }}
                                  >
                                    {item.value}
                                  </span>
                                </Fragment>
                              )
                            }
                            if (item.title === '7D') {
                              return (
                                <Fragment>
                                  <span
                                    style={{
                                      marginRight: '.4rem',
                                      top: -6,
                                      position: 'relative',
                                    }}
                                    className="ant-list-item-meta-title"
                                  >
                                    {item.title}
                                  </span>
                                  <span
                                    style={{
                                      marginRight: '1.5rem',
                                      top: -6,
                                      position: 'relative',
                                    }}
                                  >
                                    {item.value}
                                  </span>
                                </Fragment>
                              )
                            }
                            return (
                              <List.Item>
                                <List.Item.Meta
                                  title={item.title}
                                  description={item.value}
                                />
                              </List.Item>
                            )
                          }}
                        />
                      </Card>
                    </FlexGridItem>

                    <FlexGridItem colWidth={2} component={'chart'}>
                      <Card title="Price chart" style={cardStyle}>
                        <CoinCharts
                          symbol={symbol}
                          priceData={priceData}
                          annotations={annotations}
                          isTradingViewVisible={isTradingViewVisible}
                        />
                      </Card>
                    </FlexGridItem>
                    <FlexGridItem>
                      <Card title="Links" style={cardStyle}>
                        <List
                          itemLayout="horizontal"
                          dataSource={LinksData(coinObj)}
                          renderItem={(item) => {
                            if (item.value) {
                              return (
                                <List.Item>
                                  <Icon type={item.icon} />
                                  <a
                                    href={item.value}
                                    target="_blank"
                                    style={{
                                      color: '#000',
                                      marginLeft: '.5rem',
                                      marginTop: '-.25rem',
                                    }}
                                  >
                                    {item.linkType}
                                  </a>
                                </List.Item>
                              )
                            }
                            return <Fragment />
                          }}
                        />
                      </Card>
                    </FlexGridItem>
                  </FlexGrid>
                </FlexGridWrapper>
              </div>
            </div>
            <CoinListDrawer {...this.props} coins={coinsCollection} />
          </Content>
          <Footer />
        </Layout>
      </Fragment>
    )
  }
}

export default newsfeedContainer(CoinShow)

const ButtonWrap = styled.div`
  text-align: right;
  margin: 0 1rem;
  margin-right: 1.2rem;
  padding-top: 0.5rem;
  @media (min-width: 900px) {
    float: right;
    margin-top: 2.5rem;
  }
`

const Section = styled.section`
  text-align: center;
  margin: 3rem 0;
  @media (min-width: 900px) {
    text-align: left;
    margin: 0 0 0 1rem;
    padding-top: 1rem;
    padding-left: 1rem;
  }
`

const Div = (props) => {
  const InDiv = styled.div`
    margin-bottom: ${props.marginBottom ? '0' : '1.5rem'};
    height: 56px;
    @media (min-width: 900px) {
      display: inline-block;
      margin-right: 0.75rem;
      height: 32px;
    }
    > img {
      height: 100%;
      width: auto;
      margin-top: -7px;
    }
  `
  return <InDiv>{props.children}</InDiv>
}

const Span = styled.span`
  margin: 0 0.5rem 0 0;
`

const SpanTitle = styled.span`
  margin: 0 0.5rem 0 0;
  font-size: 24px;
  font-weight: bold;
`

const HideLarge = styled.div`
  display: block;
  @media (min-width: 1100px) {
    display: none;
  }
`
const FlexGridItemWrap = styled.div`
  width: 100%;
  @media (min-width: 900px) {
    width: auto;
    width: 32%;
  }
`

const RatingsDiv = styled.div`
  display: inline-block;
  width: 47%;
  background: #f6f8fa;
  margin: 0.5rem;
  padding: 0.5rem;
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: center;
  font-size: 12px;
  > strong {
    display: block;
    margin-bottom: 0.4rem;
  }
`

const cardStyle = {
  flexGrow: 1,
  margin: '1rem .5rem 0 .5rem',
}

const Wrapper = styled.div`
  width: 200px;
  float: left;
  background: #fff;
  border-right: 1px solid #e8e8e8;
`

const FlexGridWrapper = styled.div`
  background: #f6f8fa;
  padding: 0 0.5rem;
  border: 1px solid #e5e6e6;
  width: 100%;
  overflow: auto;
`

const TeamDiv = styled.div`
  display: inline-block;
  width: 47%;
  margin: 0.5rem;
  padding: 0.5rem;
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: center;
  font-size: 12px;
  border: 1px solid #e5e6e6;
  > strong {
    display: block;
    font-size: 14px;
  }
`
