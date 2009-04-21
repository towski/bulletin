var Bulletin = Class.create({
  currentData: null,
	assigned_user_hash: {},

  initialize: function(options){
		this.project = options.project
		this.token = options.token
		this.account = options.account
		this.host = options.account + Bulletin.lighthouse_domain
		this.apiURL = "http://" + this.host + "/projects/" + this.project + "/"
		Bulletin.apiURL = this.apiURL
		Bulletin.assigned_user_hash = this.assigned_user_hash
    this.getStates();
    this.getTickets();
		this.getMemberships();
	},
	
  getStates: function(){
    var callbackFunction = "response" + Math.ceil(Math.random()*10000);
    Bulletin[callbackFunction] = this.buildStates.bind(this);
    this._scriptTag("http://"+this.host+"/projects/"+this.project+".json?_token="+this.token+"&_method=put&callback=Bulletin."+callbackFunction)
  },
  
  buildStates: function(project){
    project = project.project
    var main_div = $('bulletin')
	  var title = new Element('h4', {'style':'margin:auto;width:200px; height:30px'});
		title.update(project.name)
	  main_div.appendChild(title);
		var state_divs = 0;
		var colors = {open:"aaa", blocked:"a00", verify:"099", resolved:"6A0", staged:"ada"}
		var open_states = project.open_states_list.split(",")
		var new_index = open_states.indexOf("new")
		if(new_index != -1){ open_states.splice(new_index, 1) }
		var state_div = new Element('div', {'id':"new", 'class':'state','style':'clear:both'});
		state_div.update("<h6>new</h6>")
		main_div.appendChild(state_div);
		state_divs++;
    open_states.each(function(state){
      var state_div = new Element('div', {'id':state, 'class':'state'});
      state_div.update("<h6>"+state+"</h6>")
      main_div.appendChild(state_div);
			state_divs++;
    })
		var closed_states = project.closed_states_list.split(",")
		var resolved_index = closed_states.indexOf("resolved")
		if(resolved_index != -1){ closed_states.splice(resolved_index, 1) }
    closed_states.each(function(state){
      var state_div = new Element('div', {'id':state, 'class':'state'});
		  state_div.update("<h6>"+state+"</h6>")
		  main_div.appendChild(state_div);
			state_divs++;
	  })
	  var state_div = new Element('div', {'id':"resolved", 'class':'state'});
	  state_div.update("<h6>resolved</h6>")
	  main_div.appendChild(state_div);
		state_divs++;
	  $A(["invalid","blocked","hold"]).each(function(state){
	    var state = $(state);
	    if(state){ state.hide(); state_divs--; }
    });
		$$('.state').each(function(state){ state.style.width = (100/state_divs) + "%" })
  },

	requestURL: function(ticket_div, state){
		var old_state = ticket_div.className.match(/[^ ]*/)[0]
    // if($('user') != "" && old_state == "new"){
    //   
    // }
    return Bulletin.domain + this.account + "/" + this.token + "/" + this.project + "/" + ticket_div.id + "/" + state
	},

  getTickets: function(){
    var callbackFunction = "response" + Math.ceil(Math.random()*10000);
    Bulletin[callbackFunction] = this.handleResults.bind(this);
    var ticketsURL = this.apiURL + "tickets.json?callback=Bulletin." + callbackFunction;
    this._scriptTag(ticketsURL + "&q="+ escape("milestone:next") + "&_token=" + this.token)
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
		var assigned_user_hash = this.assigned_user_hash
		var index = 1;
		assigned_user_hash[""] = "fff";
		tickets.each(function(ticket){
			ticket = ticket.ticket
			if(!ticket.assigned_user_name){
				ticket.assigned_user_name = ""
			}
		})
		tickets.sort(function(x,y){
			var name1 = x.ticket.assigned_user_name.toLowerCase();
			var name2 = y.ticket.assigned_user_name.toLowerCase();
			return ((name1 < name2) ? -1 : ((name1 > name2) ? 1 : 0));
		})
		tickets.each(function(ticket){
			ticket = ticket.ticket
			if(assigned_user_hash[ticket.assigned_user_name] == undefined){
				assigned_user_hash[ticket.assigned_user_name] = hex_md5(ticket.assigned_user_name).substr(26,6);
			}
			var state = $(ticket.state)
			var ticketDiv = new Element('div', {'id':ticket.number, 'class': ticket.state + " ticket", 'title': ticket.body});
			var user_name = ticket.assigned_user_name;
			ticketDiv.appendChild(new Element('div', {'title': ticket.assigned_user_name, 'class':"assigned_user", 'style':'background:#'+assigned_user_hash[ticket.assigned_user_name]}));
			var number = new Element('a', {'href':Bulletin.apiURL+"tickets/"+ticket.number, 'class':'ticket_link', 'title':ticket.number, 'target':'_blank'})
			number.update("#"+ticket.number)
			ticketDiv.appendChild(number)
			var title = new Element('div', {'class':'ticket_body'})
			title.update(ticket.title)
			ticketDiv.appendChild(title)
			state.appendChild(ticketDiv);
		})
		$$('.ticket').each(function(item){ new Draggable(item, {revert: false, ghosting: true})});
    $$('.state').each(function(item){ Droppables.add(item.id, {hoverclass: 'hoverActive', onDrop: moveItem})});
    $('bulletin').cleared = false;
		$('setup').hide();
		$('bulletin').show();
		Bulletin.assigned_user_hash = assigned_user_hash
	},
	
	getMemberships: function(){
    var callbackFunction = "response" + Math.ceil(Math.random()*10000);
    Bulletin[callbackFunction] = this.buildAvatars.bind(this);
    this._scriptTag("http://"+this.host+"/projects/"+this.project+"/memberships.json?_token="+this.token+"&_method=put&callback=Bulletin."+callbackFunction)
  },

	buildAvatars: function(memberships){
		memberships = memberships.memberships
		var alreadyListed = {};
		var avatarBar = $('avatarBar')
		memberships.each(function(membership){
			membership = membership.membership
			if(Bulletin.assigned_user_hash[membership.user.name] && !alreadyListed[membership.user.name]){
				var avatar = new Element('span', {'style':'width:80px;float:left'})
				avatar.update("<img src='http://entp.lighthouseapp.com/"+membership.user.avatar_url+"' title='"+membership.user.name+"' style='float:left;width:40px;height:40px;border:4px solid #"+Bulletin.assigned_user_hash[membership.user.name]+"'/>")
				avatarBar.appendChild(avatar)
				alreadyListed[membership.user.name] = true
			}
		})
	},

  _scriptTag: function(path){
    var element = document.createElement('script');
    element.setAttribute("type", "text/javascript");
    element.setAttribute("charset", "utf-8");
    element.setAttribute("src", path);
    
    document.getElementsByTagName("head").item(0).appendChild(element);
  }
});