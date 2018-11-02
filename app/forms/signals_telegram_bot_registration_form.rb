class SignalsTelegramBotRegistrationForm < Patterns::Form
  param_key 'signals_telegram_bot'

  attribute :telegram_username
  attribute :chat_id
  attribute :started_at

  validates :telegram_username, presence: true
  validates :user, presence: true, :if => proc { |f| f.telegram_username.present? }
  validates :chat_id, presence: true
  validates :started_at, presence: true
  validate :validate_user_access, :if => proc { |f| f.user.present? }

  def persist
    user.token_sale[:signals_telegram_bot_chat_id] = chat_id
    user.token_sale[:signals_telegram_bot_started_at] = started_at
    user.save
  end

  protected

  def user
    @user ||= User.where("(token_sale->>'telegram_username') ILIKE ?", telegram_username).first
  end

  def validate_user_access
    signals_access_override = user.token_sale.fetch('signals_access_override', nil)

    # Handle `signals_access_override` values
    unless signals_access_override.nil?
      if signals_access_override == true
        return
      elsif signals_access_override == false
        errors.add(
          :user,
          :access_override,
          message: "has not been allowed access"
        )
        return
      end

      raise "Invalid `signals_access_override` value: #{signals_access_override}"
    end

    # Perform amount validation if not set
    self.validate_user_staked_cofi_amount
  end

  def validate_user_staked_cofi_amount
    min_staking_amount = ENV.fetch('SIGNALS_MIN_STAKING_AMOUNT').to_d
    if user.staked_cofi_amount < min_staking_amount
      errors.add(
        :user,
        :min_staked_cofi_amount,
        message: "has not staked more than #{min_staking_amount} COFI tokens"
      )
    end
  end
end
