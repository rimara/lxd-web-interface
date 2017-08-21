class AddCurrentlyUsedInIpAddresses < ActiveRecord::Migration[5.1]
  def change
    add_column :ip_addresses, :currently_used, :integer   
  end
end
