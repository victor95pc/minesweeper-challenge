class CellClicksController < ApplicationController
  resource_description do
    formats [:json]

    description <<-EOS
      == About
      From here you add/remove cell clicks on the game
    EOS
  end

  before_action :get_game

  respond_to :json

  api :POST, '/games/:game_id/cell_clicks', 'Register a click'
  param :game_id, String, required: true, desc: 'Game ID'
  param :x, Integer, required: true, desc: 'X position'
  param :y, Integer, required: true, desc: 'Y position'
  def create
    x = cell_click_params[:x]
    y = cell_click_params[:y]
    clicked_cells = @game.clicked_cells + [[x, y]]

    @game.update_attributes(clicked_cells: clicked_cells)

    render json: clicked_cells
  end

  api :DESTROY, '/games/:game_id/cell_clicks/:id', 'Update a old game'
  param :game_id, String, required: true, desc: 'Game ID'
  param :id, Integer, required: true, desc: 'cell click index position'
  def destroy
    clicked_cells = @game.clicked_cells.delete_at(params[:id])

    @game.update_attributes(clicked_cells: clicked_cells)

    render json: clicked_cells
  end

  private

  def get_game
    @game = Game.find(params[:game_id])
  end

  def cell_click_params
    params.permit(:x, :y)
  end
end
