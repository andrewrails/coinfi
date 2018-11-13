class NewsController < ApplicationController
  before_action :check_permissions, :set_body_class, :set_view_data
  before_action :set_default_news_items, only: [:index, :show]

  include NewsHelper

  def index
    set_meta_tags(
      title: "Latest Cryptocurrency News Today - Current Crypto News Today",
      description: "CoinFi’s #1 crypto news aggregator gives you the latest cryptocurrency news, so you can be the first to know what news moved the crypto markets today."
    )
  end

  def coin_index
    coin = Coin.find_by!(slug: params[:coin_slug])
    @coin_with_details_data = serialize_coin_with_details(coin)

    @news_items_data = serialize_news_items(
      NewsItems::WithFilters.call(NewsItem.published, coins: [coin])
        .includes(:coins, :news_categories)
        .order_by_published
        .limit(25)
    )

    set_meta_tags(
      title: "Latest (#{coin.symbol}) #{coin.name} News - #{coin.name} Crypto News (#{Date.today.strftime("%b %e, %Y")})"
    )
  end

  def show
    distribute_reads(max_lag: MAX_ACCEPTABLE_REPLICATION_LAG, lag_failover: true) do
      news_item = NewsItem.published.find(params[:id])
      @news_item_data = serialize_news_items(news_item)

      set_meta_tags canonical: news_item.url
    end
  end

  protected

  def check_permissions
    if !user_signed_in?
      redirect_to '/login', alert: "Please login first"
    elsif !has_news_feature?
      render_404
    end
  end

  def set_default_news_items
    @news_items_data = get_default_news_items
  end

  def set_view_data
    @feed_sources = (FeedSource.feed_types - ['general']) +
      FeedSource.where(feed_type: 'general').pluck(:site_hostname)
    @top_coin_slugs = Coin.top(5).pluck(:slug)
    @categories = NewsCategory.pluck(:name)

    @top_coins_data = serialize_coins(
      Rails.cache.fetch("coins/toplist", expires_in: 1.hour) do
        Coin.order(:ranking).limit(20)
      end
    )
    @watched_coins_data = serialize_coins(
      current_user.watchlist.coins.order(:ranking)
    ) if current_user
  end

  def set_body_class
    @body_class = 'page page--fullscreen'
  end

  def serialize_coins(coins)
    coins.as_json(
      only: %i[id name symbol slug price_usd],
      methods: %i[market_info]
    )
  end

  def serialize_coin_with_details(coin)
    related_coins_data = coin.related_coins.as_json(
      only: %i[id coin_key name symbol slug]
    )

    return {
      id: coin.id,
      coin_key: coin.coin_key,
      name: coin.name,
      image_url: coin.image_url,
      symbol: coin.symbol,
      slug: coin.slug,
      prices_data: coin.prices_data,
      news_data: coin.news_data,
      market_info: coin.market_info,
      is_being_watched: coin.is_being_watched,
      related_coins_data: related_coins_data,
      summary: coin.summary,
    }
  end
end
