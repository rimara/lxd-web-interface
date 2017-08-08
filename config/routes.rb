Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html
    root 'lxd#index'
    put '/lxd/stop/:name', to: 'lxd#stop', as: 'lxd_stop'
    put '/lxd/start/:name', to: 'lxd#start', as: 'lxd_start'
    put '/lxd/restart/:name', to: 'lxd#restart', as: 'lxd_restart'
    delete '/lxd/delete/:name', to: 'lxd#delete', as: 'lxd_delete'
    post '/lxd/create/:name', to: 'lxd#create', as: 'lxd_create'
end
