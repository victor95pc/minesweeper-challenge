class Game < ApplicationRecord
  validates_presence_of :amount_bombs, :board_width, :board_height

  validates_numericality_of :board_width,  only_integer: true, greater_than: 1
  validates_numericality_of :board_height, only_integer: true, greater_than: 1
  validates_numericality_of :amount_bombs, only_integer: true, greater_than: 0

  validate :has_more_bombs_than_board_supports

  before_create :generate_bombs

  private

  def has_more_bombs_than_board_supports
    errors.add(:amount_bombs, "Not enough board space to place all bombs") if amount_bombs >= board_width * board_height
  end

  def generate_bombs
    _amount_bombs = amount_bombs

    loop do
      break if _amount_bombs == 0

      x, y = [rand(1..board_width), rand(1..board_height)]

      position = [x,y]

      if not(position.in?(bombs))
        bombs.push(position)
        _amount_bombs -= 1
      end
    end
  end
end
