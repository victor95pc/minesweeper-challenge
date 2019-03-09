class Game < ApplicationRecord
  validates_presence_of :amount_bombs, :board_width, :board_height

  validates_numericality_of :board_width,  only_integer: true, greater_than: 1
  validates_numericality_of :board_height, only_integer: true, greater_than: 1
  validates_numericality_of :amount_bombs, only_integer: true, greater_than: 0

  validate :has_more_bombs_than_board_supports

  before_create :generate_bombs

  def revealed_positions
    clicked_cells[0..0].map { |c_c| get_revealed_positions(*c_c) }.flatten(1).uniq
  end

  def is_gameover?
    clicked_cells.any? { |clicked_cell| clicked_cell.in?(bombs) }
  end

  private

  def has_more_bombs_than_board_supports
    errors.add(:amount_bombs, "Not enough board space to place all bombs") if amount_bombs >= board_width * board_height
  end

  def get_revealed_positions(x, y, blocked_search = [])
    positions = []
    position  = [x,y]

    positions.push(position)

    return positions if has_mine_around?(*position)

    neighbors = get_neighbors_cells(*position)
    neighbors = neighbors - blocked_search

    neighbors.each do |neighbor|
      positions += get_revealed_positions(*neighbor, blocked_search + neighbors + [position] + positions)
    end

    positions
  end

  def get_neighbors_cells(x,y)
    west      = [x-1, y]
    northwest = [x-1, y+1]
    north     = [x,   y+1]
    northeast = [x+1, y+1]
    east      = [x+1, y]
    southeast = [x+1, y-1]
    south     = [x,   y-1]
    southwest = [x+1, y-1]

    [west, northwest, north, northeast, east, southeast, south, southwest].select do |pos|
      x,y = pos
      x >= 1 && y >= 1 && x <= board_width && y <= board_height
    end
  end

  def has_mine_around?(x,y)
    get_neighbors_cells(x,y).any? { |position| position.in?(bombs) }
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
