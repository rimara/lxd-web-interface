class IpAddress < ApplicationRecord
    
    validates_presence_of :machine
    validates_presence_of :ip

end
