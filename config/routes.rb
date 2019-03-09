Rails.application.routes.draw do
  resources :games
  apipie
  # For details on the DSL available within this file, see http://guides.rubyonrails.org/routing.html

  API_ACTIONS = [:index, :show, :create, :update]

  scope :api, defaults: { format: 'json', only: API_ACTIONS } do
    resources :games do
      resources :flags
      resources :cell_clicks
    end
  end
end
