class LxdController < ApplicationController

    def configure
        Hyperkit.configure do |c|
            c.client_cert = "#{Rails.root}/client.crt"
            c.client_key = "#{Rails.root}/client.key"
            
            # IP Akasuke
            c.api_endpoint = 'https://192.168.43.231:8443'
            
            # IP Gojek
            # c.api_endpoint = 'https://10.10.15.140:8443'
            
            c.verify_ssl = false
        end
    end

    def index
        configure

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

    def restart
        containerName = params[:name].to_s
        Hyperkit.restart_container(containerName)

        redirect_back fallback_location: root_path
    end

    def start
        containerName = params[:name].to_s
        Hyperkit.start_container(containerName)

        redirect_back fallback_location: root_path
    end
    
    def stop
        containerName = params[:name].to_s
        Hyperkit.stop_container(containerName)

        redirect_back fallback_location: root_path
    end

    def delete
        containerName = params[:name].to_s
        Hyperkit.delete_container(containerName)

        redirect_back fallback_location: root_path
    end

    def new
        image_aliases = Hyperkit.image_aliases
        aliases = Hash.new

        image_aliases.each.with_index do |image_alias, index|
            aliases[image_alias] = index + 1
        end

        @image_aliases = image_aliases.to_a
    end

    def create
        containerName = params[:name]
        containerAlias = params[:image_alias]
        Hyperkit.create_container(containerName, alias: containerAlias)

        redirect_to root_path
    end

end

