class AddColumnClickedCellsToGame < ActiveRecord::Migration[5.2]
  def change
    add_column :games, :clicked_cells, :integer, array: true, default: []
  end
end
