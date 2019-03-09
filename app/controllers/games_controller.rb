class GamesController < ApplicationController
  resource_description do
    formats [:json]

    description <<-EOS
      == About
      From here you can manage your games
    EOS
  end

  before_action :apipie_validations
  before_action :set_game, only: [:show, :update]

  respond_to :json

  api :GET, '/games', 'List all games'
  returns code: 200, desc: "Detailed info about all games" do
    property :name, String, desc: 'name of the Game'
    property :board_width, Integer, desc: 'board width'
    property :board_height, Integer, desc: 'board height'
    property :amount_bombs, Integer, desc: 'Amount of bombs in the board'
    property :is_gameover, :boolean, desc: 'Show if the player click on a bomb'
    property :revealed_positions, Array, desc: 'Array showing revealed positions'
  end

  def index
    render json: Game.all, methods: [:is_gameover, :revealed_positions]
  end

  api :GET,  '/games/:id', 'To get Game by ID'
  param :id, String, required: true, desc: 'Game ID'
  def show
    respond_with @game
  end

  api :POST, '/games', 'Create a new game'
  param :name, String, required: true, desc: 'name of the Game'
  param :board_width, Integer, required: true, desc: 'board width'
  param :board_height, Integer, required: true, desc: 'board height'
  param :amount_bombs, Integer, required: true, desc: 'Amount of bombs in the board, must be less than the board total size'
  def create
    respond_with Game.create(game_params)
  end

  api :PUT, '/games/:id', 'Update a old game'
  param :id, Integer, required: true, desc: 'Game ID'
  param :name, String, required: true, desc: 'name of the Game'
  def update
    respond_with Game.update_attributes(game_update_params)
  end

  private

  def set_game
    @game = Game.find(params[:id])
  end

  def game_params
    params.require(:game).permit(:name, :board_width, :board_height, :amount_bombs)
  end

  def game_update_params
    params.require(:game).permit(:name)
  end
end
