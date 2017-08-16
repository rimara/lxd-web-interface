class CronTask

    class << self
        def perform(method)
            with_logging method do
                self.new.send(method)
            end
        end

        def with_logging(method, &block)
            log("starting...", method)

            time = Benchmark.ms do
                yield block
            end

            log("completed in (%.1fms)" % [time], method)
        end

        def log(message, method = nil)
            now = Time.now.strftime("%Y-%m-%d %H:%M:%S")
            puts "#{now} %s#%s - #{message}" % [self.name, method]
        end
    end

    # lxd/create
    def create_container
        containerName = params[:name]
        containerAlias = params[:image_alias]
        Hyperkit.create_container(containerName, alias: containerAlias)
    end

    # lxd/detail
    def read_container
        containerName = params[:name].to_s
        @containerDetail = Hyperkit.container(containerName).to_hash
    end

    # To-do: update container
    def update_container
        # Logic here
    end

    # lxd/delete
    def delete_container
        containerName = params[:name].to_s
        Hyperkit.delete_container(containerName)
    end

    ## Ouside of CRUD: stop, restart
    # lxd/stop
    def stop_container
        containerName = params[:name].to_s
        Hyperkit.stop_container(containerName)
    end

    # lxd/restart
    def restart_container
        containerName = params[:name].to_s
        Hyperkit.restart_container(containerName)
    end

end
