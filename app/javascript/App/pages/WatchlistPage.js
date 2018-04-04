import React, { Component } from 'react'
import Container from '../containers/WatchlistContainer'
import WatchedItem from '../components/WatchlistItem'
import WatchlistSearch from '../components/WatchlistSearch'
import LoadingIndicator from '../components/LoadingIndicator'
import Article from '../components/Article'

class WatchlistPage extends Component {
  render() {
    const { entities, isLoading } = this.props
    const { coins, articles } = entities.toObject()
    return (
      <div className="pa2">
        <div className="container">
          <div className="row narrow-gutter flex">
            <div className="col-xs-12 col-md-5 flex flex-column">
              <WatchlistSearch {...this.props} />
              <div className="mt3">
                {isLoading && <LoadingIndicator className="h5e mb3" />}
                {coins &&
                  coins
                    .valueSeq()
                    .map(coin => (
                      <WatchedItem coin={coin} key={coin.get('id')} />
                    ))}
              </div>
            </div>
            <div className="col-xs-12 col-md-7 flex">
              <div className="bg-white w-100 pa3 pa4-m">
                {articles &&
                  articles
                    .valueSeq()
                    .map(article => (
                      <Article
                        article={article}
                        tags={entities.get('tags')}
                        key={article.get('id')}
                      />
                    ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Container(WatchlistPage)
