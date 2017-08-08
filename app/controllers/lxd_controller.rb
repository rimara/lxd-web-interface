class LxdController < ApplicationController

    def configure
        Hyperkit.configure do |c|
            c.client_cert = "#{Rails.root}/client.crt"
            c.client_key = "#{Rails.root}/client.key"
            c.api_endpoint = 'https://192.168.43.231:8443'
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
        configure
        containerName = params[:name].to_s
        Hyperkit.restart_container(containerName)

        redirect_back fallback_location: root_path
    end

    def start
        configure
        containerName = params[:name].to_s
        Hyperkit.start_container(containerName)

        redirect_back fallback_location: root_path
    end
    
    def stop
        configure
        containerName = params[:name].to_s
        Hyperkit.stop_container(containerName)

        redirect_back fallback_location: root_path
    end

    def delete
        configure
        containerName = params[:name].to_s
        Hyperkit.delete_container(containerName)

        redirect_back fallback_location: root_path
    end

    def create
        configure
        containerName = params[:name].to_s
        Hyperkit.create_container(containerName, alias: "container")

        redirect_back fallback_location: root_path
    end

end

