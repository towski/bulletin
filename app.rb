require 'rubygems'
gem 'sinatra', '~> 0.3.3'
require 'sinatra'
require 'lighthouse-api-1.0.0/lib/lighthouse'
Lighthouse.domain_format = '%s.local.i'
Lighthouse.port          = '3001'

# index
get '/' do
	#@projects = Project.all
	erb :index
end

get '/:account/:token/:project_id/:number/:state' do
  Lighthouse.account  = params.delete("account")
  Lighthouse.token    = params.delete("token")
	ticket = Lighthouse::Ticket.new params
	ticket.save
end
