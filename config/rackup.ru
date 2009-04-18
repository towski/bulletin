require File.dirname(__FILE__) + "/../app.rb"

ENV['APP_ENV'] ||= :production
set :run, false
set :environment, ENV['APP_ENV']

run Sinatra::Application
