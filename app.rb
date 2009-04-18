Dir["#{File.expand_path(File.dirname(__FILE__))}/vendor/*/lib"].each{ |path| $:.unshift path }
require 'rubygems'
gem 'sinatra'
require 'sinatra'
require 'lighthouse'

if ENV['APP_ENV'] == 'production'
  Lighthouse.domain_format = '%s.lighthouseapp.com'
  $host = "http://bulletin.heroku.com/"
else 
  Lighthouse.domain_format = '%s.local.i'
  Lighthouse.port          = '3001'
  $host = "http://localhost:4567/"
end

get '/main.js' do
  erb :main
end

get '/' do
	erb :index
end

get '/:account/:token/:project_id/:number/:state' do
  raise Lighthouse.domain_format % "entp"
  Lighthouse.account  = params.delete("account")
  Lighthouse.token    = params.delete("token")
	ticket = Lighthouse::Ticket.new params
	ticket.save
end
