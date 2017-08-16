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

    def create_container
        containerName = params[:name]
        containerAlias = params[:image_alias]
        Hyperkit.create_container(containerName, alias: containerAlias)
        redirect_to lxd_index_path
    end

    def stop_container
        # logic here
    end

end


