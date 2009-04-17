var Bulletin = Class.create({
  apiURL: null,
	ticketsURL: null,
	ticketURL: null,
  currentData: null,
	updateForm: null,
	projectId: null,
	apiToken: null,
	hostName: null,
	account: null,

  initialize: function(hostName, projectId, apiToken){
		this.projectId = projectId
		this.apiToken = apiToken
		//this.hostName = hostName + ".lighthouseapp.com"
		this.account = hostName
		this.hostName = hostName + ".local.i:3001"
    this.callbackFunction = "response" + Math.ceil(Math.random()*10000);
    Bulletin[this.callbackFunction] = this.handleResults.bind(this);
		this.apiURL = "http://" + this.hostName + "/projects/" + this.projectId + "/"
		this.ticketsURL = this.apiURL + "tickets.json?callback=Bulletin." + this.callbackFunction;
		this.ticketURL = this.apiURL + "tickets/"
    this.getTickets();
		this.updateForm = document.getElementById('ticket-updater');
	},

  getTickets: function(){
    var requestURL = this.ticketsURL + "&q="+ escape("milestone:next") + "&_token=" + this.apiToken;
    this._scriptTag(requestURL)
  },

	requestURL: function(ticketNumber, state){
		var host = "http://localhost:4567/"
		//var host = "http://bulletin.heroku.com/"
		return host + this.account + "/" + this.apiToken + "/" + this.projectId + "/" + ticketNumber + "/" + state
	},

  handleResults: function(json){
    if (json.tickets != null){
			this.build(json.tickets);
      this.currentData = json.tickets;
    }else{
      var sorry = new Element('p').update('Sorry, but your search didn&rsquo;t return any results');
      //this.resultsElement.innerHTML = '';
      //this.resultsElement.appendChild(sorry);
      this.currentData = {}
    }
  },

	build: function(tickets){
		tickets.each(function(ticket){
			ticket = ticket.ticket
			var state = document.getElementById(ticket.state)
			var ticketDiv = new Element('div', {'id':ticket.number,'class': ticket.state + " ticket",'title': ticket.body});
			ticketDiv.update(ticket.title)
			state.appendChild(ticketDiv);
		})
		$$('.ticket').each(function(item){ new Draggable(item, {revert: false, ghosting: false})});
    $$('.state').each(function(item){ Droppables.add(item.id, {hoverclass: 'hoverActive', onDrop: moveItem})});
    $('bulletin').cleared = false;
	},

  _scriptTag: function(path){
    var element = document.createElement('script');
    element.setAttribute("type", "text/javascript");
    element.setAttribute("charset", "utf-8");
    element.setAttribute("src", path);
    
    document.getElementsByTagName("head").item(0).appendChild(element);
  }
});