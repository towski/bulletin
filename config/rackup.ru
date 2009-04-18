require File.dirname(__FILE__) + "/../app.rb"

set :run, false
set :environment, ENV['APP_ENV'] ||= "production"

run Sinatra::Application
