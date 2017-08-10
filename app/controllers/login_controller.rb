class LoginController < ApplicationController
    def login
        machineIPs = IpAddress.all

        allMachines = Hash.new
        machineIPs.each do | ip |
            allMachines[ip.machine] = ip.machine
        end

        @machines = allMachines.to_a.sort
    end
end
