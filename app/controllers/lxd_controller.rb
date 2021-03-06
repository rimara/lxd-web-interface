class LxdController < ApplicationController

    def configure
        Hyperkit.configure do |c|
            c.client_cert = "#{Rails.root}/client.crt"
            c.client_key = "#{Rails.root}/client.key"
            c.auto_sync = true

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
        current_ip = IpAddress.find_by(currently_used: 1).ip
        current_ip = current_ip[8..-1]
        current_ip.chomp!(":8443")
        @address = "http://" + current_ip + ":8081/terminals/"
        @websocket = "ws://" + current_ip + ":8081/terminals/"
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
        Hyperkit.create_container(containerName,
            alias: containerAlias,
            expanded_config: {
                "limits.cpu" => params[:new_limits_cpu],
                "limits.memory" => params[:new_limits_memory],
                "limits.memory.swap" => params[:new_limits_memory_swap]
            })
        redirect_to lxd_index_path
    end

    def update
        containerName = params[:name].to_s
        @containerDetail = Hyperkit.container(containerName).to_hash
        puts "Before"
        puts @containerDetail[:expanded_config][:"limits.cpu"]
        @containerDetail[:expanded_config][:"limits.cpu"] = params[:new_limits_cpu]
        @containerDetail[:expanded_config][:"limits.memory"] = params[:new_limits_memory]
        @containerDetail.devices.eth1 = {nictype: params[:new_nictype], parent: params[:new_parent], type: params[:new_type]}
        #currentConfig[:expanded_config] = newConfiguration
        puts @containerDetail[:expanded_config][:"limits.cpu"]
        puts Hyperkit.update_container(containerName, @containerDetail, sync: true)
        puts Hyperkit.container(containerName)[:expanded_config][:"limits.cpu"]

        redirect_to lxd_index_path
    end

    def edit
        containerName = params[:name].to_s
        @containerDetail = Hyperkit.container(containerName).to_hash
    end

end
