Rails.application.routes.draw do
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

    root 'login#login'

    get '/lxd/', to: 'lxd#index', as: 'lxd_index'
    put '/lxd/stop/:name', to: 'lxd#stop', as: 'lxd_stop'
    put '/lxd/start/:name', to: 'lxd#start', as: 'lxd_start'
    put '/lxd/restart/:name', to: 'lxd#restart', as: 'lxd_restart'
    delete '/lxd/delete/:name', to: 'lxd#delete', as: 'lxd_delete'
    get '/lxd/new', to: 'lxd#new', as: 'lxd_new'
    post '/lxd/create', to: 'lxd#create', as: 'lxd_create'
    get '/lxd/edit/:name', to: 'lxd#edit', as: 'lxd_edit'
    put '/lxd/update/:name', to: 'lxd#update', as: 'lxd_update'
    get '/lxd/detail/:name', to: 'lxd#detail', as: 'lxd_detail'

    get '/ip/', to: 'ip#show', as: 'ip_show'
    get '/ip/new', to: 'ip#new', as: 'ip_new'
    post '/ip/create/', to: 'ip#create', as: 'ip_create'
    get '/ip/change/:name', to: 'ip#change', as: 'ip_change'
    put '/ip/update/:name', to: 'ip#update', as: 'ip_update'
    delete '/ip/delete/:name', to: 'ip#delete', as: 'ip_delete'
    put 'ip/set/', to: 'ip#set', as: 'ip_set'
    put 'logout', to: 'ip#logout', as: 'ip_logout'

end
