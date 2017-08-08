class IpController < ApplicationController

    def new
        machineName = params[:name].to_s
        machineIp = "https://" + params[:ip].to_s + ":8443"
        ip = IpAddress.create(machine: machineName, ip: machineIp)
    end

    def change
        currentMachine = IpAddress.find_by(currently_used: 1)
        currentMachine.currently_used = 0
        currentMachine.save

        newMachineName = params[:name].to_s
        newMachine = IpAddress.find_by(name: newMachineName)
        newMachine.currently_used = 1
        newMachine.save
    end

    def update
        machineName = params[:name].to_s
        machineIp = "https://" + params[:ip].to_s + ":8443"

        machine = IpAddress.find_by(name: machineName)
        machine.update(name: machineName, ip: machineIp)
    end

    def delete
        machine = IpAddress.find_by(name: machineName)
        machine.destroy
    end

    def show
        @machines = IpAddress.all
    end

end
