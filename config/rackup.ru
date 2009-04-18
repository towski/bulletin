require File.dirname(__FILE__) + "/../app.rb"

set :run, false
set :env, ENV['APP_ENV'] || :production

run Sinatra.application
