namespace :data_migrations do
  desc 'Delete problem records to ensure referencial integrity'
  task :fix_referential_integrity => :environment do
    ActiveRecord::Base.transaction do
      NewsCoinMention.includes(:coin, :news_item).find_each(batch_size: 50) do |mention|
        if mention.coin_id && mention.coin.nil?
          puts "Destroying NewsCoinMention(#{mention.id}): missing Coin(#{mention.coin_id})"
          mention.destroy!
          next
        end

        if mention.news_item_id && mention.news_item.nil?
          puts "Destroying NewsCoinMention(#{mention.id}): missing NewsItem(#{mention.news_item_id})"
          mention.destroy!
          next
        end

      end

      NewsItemCategorization.includes(:news_category, :news_item).find_each(batch_size: 50) do |categorization|
        if categorization.news_item_id && categorization.news_item.nil?
          puts "Destroying NewsItemCategorization(#{categorization.id}): missing NewsItem(#{categorization.news_item_id})"
          categorization.destroy!
          next
        end

        if categorization.news_category_id && categorization.news_category.nil?
          puts "Destroying NewsItemCategorization(#{categorization.id}): missing NewsCategory(#{categorization.news_category_id})"
          categorization.destroy!
          next
        end
      end

      NewsItem.includes(:feed_source).find_each(batch_size: 50) do |item|
        if item.feed_source_id && item.feed_source.nil?
          puts "Destroying NewsItem(#{item.id}): missing FeedSource(#{item.feed_source_id})"
          item.destroy!
          next
        end
      end

      WatchlistItem.includes(:coin).find_each(batch_size: 50) do |item|
        if item.coin_id && item.coin.nil?
          puts "Destroying WatchlistItem(#{item.id}): missing Coin(#{item.coin_id})"
          item.destroy!
          next
        end
      end
    end
  end
end
