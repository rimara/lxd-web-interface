Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
    
    root 'lxd#index'

    put '/lxd/stop/:name', to: 'lxd#stop', as: 'lxd_stop'
    put '/lxd/start/:name', to: 'lxd#start', as: 'lxd_start'
    put '/lxd/restart/:name', to: 'lxd#restart', as: 'lxd_restart'
    delete '/lxd/delete/:name', to: 'lxd#delete', as: 'lxd_delete'
    get '/lxd/new', to: 'lxd#new', as: 'lxd_new'
    post '/lxd/create', to: 'lxd#create', as: 'lxd_create'

    get '/ip/', to: 'ip#show', as: 'ip_show'
    get '/ip/new', to: 'ip#new', as: 'ip_new'
    post '/ip/create/', to: 'ip#create', as: 'ip_create'
    get '/ip/change/:name', to: 'ip#change', as: 'ip_change'
    put '/ip/update/:name', to: 'ip#update', as: 'ip_update'
    delete '/ip/delete/:name', to: 'ip#delete', as: 'ip_delete'

end

