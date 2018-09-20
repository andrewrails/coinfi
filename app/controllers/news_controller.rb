class NewsController < ApplicationController
  before_action :set_body_class

  def index
    return render_404 unless has_news_feature?
  end

  protected

  def set_body_class
    @body_class = 'page page--fullscreen'
  end
end
