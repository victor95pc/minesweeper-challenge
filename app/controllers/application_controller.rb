require "application_responder"

class ApplicationController < ActionController::Base
  skip_before_action :verify_authenticity_token, if: :json_request?

  self.responder = ApplicationResponder
  respond_to :json

  private

  def json_request?
    request.format.json?
  end
end
