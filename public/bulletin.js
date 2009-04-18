var Bulletin = Class.create({
  apiURL: null,
	ticketsURL: null,
  currentData: null,
	project: null,
	token: null,
	account: null,
	host: null,

  initialize: function(account, project, token){
		this.project = project
		this.token = token
		this.account = account
		this.host = account + Bulletin.lighthouse_domain
		this.apiURL = "http://" + this.host + "/projects/" + this.project + "/"
    this.getStates();
    this.getTickets();
	},
	
  getStates: function(){
    var callbackFunction = "response" + Math.ceil(Math.random()*10000);
    Bulletin[callbackFunction] = this.buildStates.bind(this);
    this._scriptTag("http://"+this.host+"/projects/"+this.project+".json?_token="+this.token+"&_method=put&callback=Bulletin."+callbackFunction)
  },
  
  buildStates: function(project){
    project = project.project
    var main_div = document.getElementById('bulletin')
		var colors = {open:"aaa", blocked:"a00", verify:"099", resolved:"6A0", staged:"ada"}
    project.open_states.split("\n").each(function(state){
			var state_and_color = state.match(/.*[^ ]/)[0].split("/")
			state = state_and_color[0]
			var color = state_and_color[1]
			if(color == undefined){ color = colors[state] }
      var state_div = new Element('div', {id:state, class:'state'});
		  state_div.update('<h6 style="color:#'+color+"\">"+state+"</h6>")
		  main_div.appendChild(state_div);
	  })
    project.closed_states.split("\n").each(function(state){
			var state_and_color = state.match(/.*[^ ]/)[0].split("/")
			state = state_and_color[0]
			var color = state_and_color[1]
			if(color == undefined){ color = colors[state] }
      var state_div = new Element('div', {id:state, class:'state'});
		  state_div.update('<h6 style="color:#'+color+"\">"+state+"</h6>")
		  main_div.appendChild(state_div);
	  })
	  $A(["invalid","blocked","hold"]).each(function(state){
	    var state = $(state);
	    if(state){ state.hide(); }
    });
  },

  getTickets: function(){
    var callbackFunction = "response" + Math.ceil(Math.random()*10000);
    Bulletin[callbackFunction] = this.handleResults.bind(this);
    var ticketsURL = this.apiURL + "tickets.json?callback=Bulletin." + callbackFunction;
    this._scriptTag(ticketsURL + "&q="+ escape("milestone:next") + "&_token=" + this.token)
  },

	requestURL: function(number, state){
    return Bulletin.domain + this.account + "/" + this.token + "/" + this.project + "/" + number + "/" + state
	},

  handleResults: function(json){
    if (json.tickets != null){
			this.build(json.tickets);
      this.currentData = json.tickets;
    }else{
      var sorry = new Element('p').update('Sorry, but your search didn&rsquo;t return any results');
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
		$$('.ticket').each(function(item){ new Draggable(item, {revert: false, ghosting: true})});
    $$('.state').each(function(item){ Droppables.add(item.id, {hoverclass: 'hoverActive', onDrop: moveItem})});
    $('bulletin').cleared = false;
		$('setup').hide();
		$('bulletin').show();
	},

  _scriptTag: function(path){
    var element = document.createElement('script');
    element.setAttribute("type", "text/javascript");
    element.setAttribute("charset", "utf-8");
    element.setAttribute("src", path);
    
    document.getElementsByTagName("head").item(0).appendChild(element);
  }
});