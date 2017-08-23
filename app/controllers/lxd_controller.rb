class LxdController < ApplicationController

    def configure
        Hyperkit.configure do |c|
            c.client_cert = "#{Rails.root}/client.crt"
            c.client_key = "#{Rails.root}/client.key"

            c.api_endpoint = IpAddress.find_by(currently_used: 1).ip

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

        @machine = IpAddress.find_by(currently_used: 1).machine
        machineIPs = IpAddress.all

        allMachines = Hash.new
        machineIPs.each do | ip |
            allMachines[ip.machine] = ip.machine
        end

        @machines = allMachines.to_a.sort
    end

    def detail
        containerName = params[:name].to_s
        @containerDetail = Hyperkit.container(containerName).to_hash
        @cert = File.read(Rails.root + 'client.crt')
        @key = File.read(Rails.root + 'client.key')
    end

    def restart
        containerName = params[:name].to_s
        Hyperkit.restart_container(containerName)

        redirect_back fallback_location: lxd_index_path
    end

    def start
        containerName = params[:name].to_s
        Hyperkit.start_container(containerName)

        redirect_back fallback_location: lxd_index_path
    end

    def stop
        containerName = params[:name].to_s
        Hyperkit.stop_container(containerName)

        redirect_back fallback_location: lxd_index_path
    end

    def delete
        containerName = params[:name].to_s
        Hyperkit.delete_container(containerName)

        redirect_back fallback_location: lxd_index_path
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

        redirect_to lxd_index_path
    end

    def update
        containerName = params[:name].to_s
        currentConfig = Hyperkit.container(containerName)
        newConfiguration = Hash.new
        newConfiguration = currentConfig[:expanded_config].to_hash

        newConfiguration[:"limits.cpu"] = params[:new_limits_cpu]
        newConfiguration[:"limits.memory"] = params[:new_limits_memory] + 'MB'
        Hyperkit.rename_container(containerName, params[:rename])
        Hyperkit.update_container(containerName, newConfiguration)

        redirect_back fallback_location: lxd_index_path
    end

    def edit
        containerName = params[:name].to_s
        @container_name = containerName
        currentConfig = Hyperkit.container(@container_name)
        currentConfigHash = Hash.new
        currentConfigHash = currentConfig[:expanded_config].to_hash
        @limits_cpu = currentConfigHash[:"limits.cpu"]
        @limits_memory = currentConfigHash[:"limits.memory"].chomp('MB')


    end

end
