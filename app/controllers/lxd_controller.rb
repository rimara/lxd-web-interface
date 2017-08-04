class LxdController < ApplicationController

    def index
        Hyperkit.configure do |c|
            c.client_cert = "#{Rails.root}/client.crt"
            c.client_key = "#{Rails.root}/client.key"
            c.api_endpoint = 'https://192.168.70.173:8443'
            c.verify_ssl = false
        end
        
        container_details = Hash.new
        container_states = Hash.new
        containers = Hyperkit.containers
        
        containers.each do |container|
            container_details[container] = Hyperkit.container(container).to_hash
            container_states[container] = Hyperkit.container_state(container).to_hash
        end

        @details = container_details
        @states = container_states

    end


end

