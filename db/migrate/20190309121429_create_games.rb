class CreateGames < ActiveRecord::Migration[5.2]
  def change
    create_table :games do |t|
      t.string :name
      t.integer :amount_bombs
      t.integer :board_width
      t.integer :board_height
      t.integer :bombs, array: true, default: []

      t.timestamps
    end
  end
end
