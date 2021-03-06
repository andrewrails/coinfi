class NewsItem < ApplicationRecord
  belongs_to :feed_source
  has_one :user # References the Admin user who tagged this NewsItem
  has_one :news_item_raw
  has_many :news_item_categorizations, dependent: :destroy
  has_many :news_categories, through: :news_item_categorizations
  has_many :news_coin_mentions, class_name: 'NewsCoinMention'
  has_many :machine_tagged_news_coin_mentions, -> { NewsCoinMention.machine_tagged }, class_name: 'NewsCoinMention'
  has_many :human_tagged_news_coin_mentions, -> { NewsCoinMention.human_tagged }, class_name: 'NewsCoinMention'
  has_many :coins, through: :news_coin_mentions
  has_many :machine_tagged_coins, through: :machine_tagged_news_coin_mentions, source: :coin
  has_many :human_tagged_coins, through: :human_tagged_news_coin_mentions, source: :coin

  scope :general, -> { where(feed_source: FeedSource.general) }
  scope :no_category, -> { where("news_items.id NOT IN (SELECT news_item_categorizations.news_item_id FROM news_item_categorizations)") }
  scope :pending, -> { where(is_human_tagged: nil) }
  scope :published, -> { where(is_published: true) }
  scope :reddit, -> { where(feed_source: FeedSource.reddit) }
  scope :tagged, -> { where(is_human_tagged: true) }
  scope :twitter, -> { where(feed_source: FeedSource.twitter) }
  scope :order_by_published, -> (order = nil) { order(feed_item_published_at: order || :desc) }

  alias_method :categories, :news_categories
  alias_method :mentions, :news_coin_mentions

  before_create :set_unpublished_if_feed_source_inactive
  before_create :set_unpublished_if_duplicate
  before_create :assign_default_news_categories

  after_create_commit :notify_news_tagger, :link_coin_from_feedsource

  def self.categorized(categories = nil)
    if categories
      joins(:news_categories).where(news_categories: { name: categories })
    else
      where("EXISTS(SELECT 1 FROM news_item_categorizations WHERE news_items.id = news_item_categorizations.news_item_id)")
    end
  end

  def self.chart_data(is_topcoin = false)
    if is_topcoin
      categories = ["Exchange Announcements", "Regulatory", "Project Announcements"]
    else
      categories = nil
    end

    select(:url, :title, :feed_item_published_at)
      .general
      .published
      .categorized(categories)
      .order_by_published(:asc)
  end

  def tag_scoped_coins
    case ENV.fetch('NEWS_COIN_MENTION_TAG_SCOPE')
    when 'human'
      self.human_tagged_coins
    when 'machine'
      self.machine_tagged_coins
    when 'combo'
      self.human_tagged_coins.or(self.machine_tagged_coins).distinct()
    else
      raise "Invalid NEWS_COIN_MENTION_TAG_SCOPE environment variable"
    end
  end

  def tag_scoped_coin_link_data
    tag_scoped_coins.map { |coin| coin.as_json(only: [:symbol, :slug, :id] ) }
  end

  def tag_scoped_coin_symbols
    tag_scoped_coins.pluck(:symbol).join(', ')
  end

  def coin_symbols
    coins.pluck(:symbol).join(', ')
  end

  # This is used in Administrate to override the `categories` and `coins` filters.
  def all_coin_symbols
    mentions = NewsCoinMention.where(news_item_id: id)
    coin_symbols = Coin.where(id: mentions.pluck(:coin_id)).pluck(:symbol).join(', ')
  end

  def news_category_names
    news_categories.pluck(:name).join(', ')
  end

  # This is used in Administrate to override the `categories` and `coins` filters.
  def all_news_category_names
    categorizations = NewsItemCategorization.where(news_item_id: id)
    category_names = NewsCategory.where(id: categorizations.pluck(:news_category_id)).pluck(:name).join(', ')
  end

  def feed_source_name
    feed_source.name
  end

  def published_date
    feed_item_published_at
  end

  def published_epoch
    feed_item_published_at.to_i * 1000
  end

  private

  def set_unpublished_if_feed_source_inactive
    if !feed_source.is_active
      self.is_published = false
    end
  end

  def set_unpublished_if_duplicate
    if !self.is_published
      return
    end

    duplicate_exists = NewsItem.exists?(title: self.title)
    if duplicate_exists
      self.is_published = false
    end
  end

  def assign_default_news_categories
    assign_service = AssignNewsItemDefaultNewsCategories.new(news_item: self)
    assign_service.call
  end

  def link_coin_from_feedsource
    if feed_source.coin.present?
      feed_source.coin.news_items |= [self]
    end
  end

  def notify_news_tagger
    # Don't want to notify news tagger when running tests
    if Rails.env.test?
      return
    end

    news_tagger_endpoint = ENV['NEWS_TAGGER_ENDPOINT']
    return unless news_tagger_endpoint.present?

    auth = {
      username: ENV.fetch('NEWS_TAGGER_BASIC_AUTH_USERNAME'),
      password: ENV.fetch('NEWS_TAGGER_BASIC_AUTH_PASSWORD')
    }
    puts HTTParty.post "#{news_tagger_endpoint}/#{self.id}/assign_entities", basic_auth: auth
  end
end
