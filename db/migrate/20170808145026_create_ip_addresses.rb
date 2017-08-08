class CreateIpAddresses < ActiveRecord::Migration[5.1]
  def change
    create_table :ip_addresses do |t|
      t.string :machine
      t.string :ip
      t.timestamps
    end
  end
end
