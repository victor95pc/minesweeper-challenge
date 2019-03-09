Rails.application.routes.draw do
  apipie
  get 'app', to: 'app#index'

  API_ACTIONS = [:index, :show, :create, :update]

  scope :api, defaults: { format: 'json', only: API_ACTIONS } do
    resources :games do
      resources :flags
      resources :cell_clicks
    end
  end
end
