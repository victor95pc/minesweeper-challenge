class FlagsController < ApplicationController
  resource_description do
    formats [:json]

    description <<-EOS
      == About
      From here you add/remove the flags on the game
    EOS
  end

  before_action :apipie_validations
  before_action :get_game

  respond_to :json

  api :POST, '/games/:game_id/flags', 'Register a flag on the cell'
  param :game_id, String, required: true, desc: 'Game ID'
  param :x, Integer, required: true, desc: 'X position'
  param :y, Integer, required: true, desc: 'Y position'
  def create
    x = flag_params[:x]
    y = flag_params[:y]
    flags = @game.flags + [[x, y]]

    @game.update_attributes(flags: flags)

    render json: flags
  end

  api :DESTROY, '/games/:game_id/flags/:id', 'Remove the flag'
  param :game_id, String, required: true, desc: 'Game ID'
  param :id, Integer, required: true, desc: 'flag index position'
  def destroy
    flags = @game.flags.delete_at(params[:id])

    @game.update_attributes(flags: flags)

    render json: flags
  end

  private

  def get_game
    @game = Game.find(params[:game_id])
  end

  def flag_params
    params.require(:flag).permit(:x, :y)
  end
end
