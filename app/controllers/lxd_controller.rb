class LxdController < ApplicationController

    def index
        Hyperkit.configure do |c|
            c.client_cert = "#{Rails.root}/client.crt"
            c.client_key = "#{Rails.root}/client.key"
            c.api_endpoint = 'https://192.168.70.173:8443'
            c.verify_ssl = false
        end
        @containers = Hyperkit.containers
    end


end
