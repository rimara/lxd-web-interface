class IpController < ApplicationController

    def create
        machineName = params[:name].to_s
        machineIp = "https://" + params[:ip].to_s + ":8443"
        ip = IpAddress.create(machine: machineName, ip: machineIp)
    end

    def change
        set
    end

    def set
        unless IpAddress.find_by(currently_used: 1).nil?
            unset
        end

        newMachineName = params[:name]
        newMachine = IpAddress.find_by(machine: newMachineName)
        newMachine.currently_used = 1
        newMachine.save

        redirect_to lxd_index_path
    end

    def unset
        currentMachine = IpAddress.find_by(currently_used: 1)
        currentMachine.currently_used = 0
        currentMachine.save
    end

    def logout
        unset

        redirect_to root_path
    end

    def update
        machineName = params[:name].to_s
        machineIp = "https://" + params[:ip].to_s + ":8443"

        machine = IpAddress.find_by(machine: machineName)
        machine.update(name: machineName, ip: machineIp)
    end

    def delete
        machine = IpAddress.find_by(machine: machineName)
        machine.destroy
    end

    def show
        @machines = IpAddress.all
    end

end
