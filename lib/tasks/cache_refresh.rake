namespace :cache_refresh do
  desc "Refresh Sparkline Chart Data Cache"
  task :sparkline => :environment do
    Coin.legit.find_each do |coin|
      coin.sparkline
    end
  end
end
