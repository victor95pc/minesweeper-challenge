class AddColumnFlagsToGame < ActiveRecord::Migration[5.2]
  def change
    add_column :games, :flags, :integer, array: true, default: []
  end
end
