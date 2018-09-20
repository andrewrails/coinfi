class NewsController < ApplicationController
  before_action :check_permissions
  before_action :set_body_class
  before_action :set_view_data

  def index
    @news_items_data = serialize_news_items(
      NewsItems::WithFilters.call()
        .includes(:coins, :news_categories)
        .order_by_published
        .limit(25)
    )
  end

  def coin_index
    coin = Coin.find_by!(slug: params[:coin_slug])
    @news_items_data = serialize_news_items(
      NewsItems::WithFilters.call(coins: [coin])
        .includes(:coins, :news_categories)
        .order_by_published
        .limit(25)
    )
  end

  def show
    @news_items_data = serialize_news_items(
      NewsItems::WithFilters.call(coins: [coin])
        .includes(:coins, :news_categories)
        .order_by_published
        .limit(25)
    )
    @news_item_data = serialize_news_items(
      NewsItem.published.find(params[:id])
    )
  end

  protected

  def check_permissions
    return render_404 unless has_news_feature?
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

  def serialize_news_items(news_items)
    data = news_items.as_json(
      only: %i[id title summary feed_item_published_at updated_at url content],
      methods: %i[tag_scoped_coin_link_data categories]
    )
    format_item = Proc.new do |item, *args|
      item
        .except('tag_scoped_coin_link_data')
        .merge({
          coin_link_data: item['tag_scoped_coin_link_data'],
        })
    end

    # Handle both hashes and arrays of hashes
    if (data.kind_of?(Array))
      formatted_data = data.map(&format_item)
    else
      formatted_data = format_item.call(data)
    end
  end
end
