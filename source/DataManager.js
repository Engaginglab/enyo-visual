enyo.kind({
	name: "DataManager",
	kind: "enyo.Object",
	published: {
		source: "",
		data: null
	},
	dataChanged: function(){
		//console.log(this.data);
	},
	
	// Node Link Charts
	personNodes: function() {
		var nodes = [];
		var personIds = this.personIds();
		personIds.forEach(enyo.bind(this, function(pid){
			var events_array = this.data.filter(function(d){return (d.person.ID == pid);});
			var goals_array = events_array.filter(function(d){return (d.typ.ID == 1);});
			var seven_array = events_array.filter(function(d){return (d.typ.ID == 6);});
			var penalty_array = events_array.filter(function(d){return (d.typ.ID == 2);});
			var node = {
				"id": pid,
				"firstName": events_array[0].person.vorname,
				"lastName": events_array[0].person.nachname,
				"goals": goals_array,
				"seven": seven_array,
				"penalty": penalty_array
			};
			nodes.push(node);
		}));
		return nodes;
	},
	
	// line charts
	individualGamesEvents: function(pid) {
		var gevents = [];
		var events_array = this.data.filter(function(d){return (d.person.ID == pid);});
		var gameIds = this.gameIds();
		var i=1;
		gameIds.forEach(enyo.bind(this, function(gid){
			var goals_array = events_array.filter(function(d){return (d.spiel == gid && d.typ.ID == 1);});
			var seven_array = events_array.filter(function(d){return (d.spiel == gid && d.typ.ID == 6);});
			var penalty_array = events_array.filter(function(d){return (d.spiel == gid && d.typ.ID == 2);});
			var game = {
				"xid": i, //! Nur solange es keine Timestamps gibt
				"game": gid,
				"Tore": goals_array.length,
				"Siebenmeter": seven_array.length,
				"Zeitstrafen": penalty_array.length,
				"person": events_array[0].person.vorname+" "+events_array[0].person.nachname
			};
			gevents.push(game);
			i++; 
		}));
		gevents.sort(enyo.bind(this, function(a, b){return a.xid - b.xid;}));
		return gevents;
	},
	gamesEvents: function(pids) {
		var gevents = [];
		pids.forEach(enyo.bind(this, function(pid){
			gevents = gevents.concat(this.individualGamesEvents(pid));
		}));
		return gevents;
	},
	
	// dot plot
	dotplotGameData: function(spielId) {
		var eventsArray = this.data.filter(function(d){return (d.spiel == spielId);});
		var dpd = [];
		eventsArray.forEach(function(dataitem){
			var dobject = {
				"id": dataitem.ID,
				"zeit": dataitem.zeit/(60*1000),
				"typ": dataitem.typ.name,
				"person": dataitem.person.ID
			};
			dpd.push(dobject);
		});
		return dpd;
	},
	
	// Bar Chart
	barChartData: function(pid) {
		var gevents = [],
			goals = [],
			sevens = [],
			penalties = [];
		var events_array = this.data.filter(function(d){return (d.person.ID == pid);});
		var gameIds = this.gameIds();
		var i=1;
		gameIds.forEach(enyo.bind(this, function(gid){
			var goals_array = events_array.filter(function(d){return (d.spiel == gid && d.typ.ID == 1);});
			var seven_array = events_array.filter(function(d){return (d.spiel == gid && d.typ.ID == 6);});
			var penalty_array = events_array.filter(function(d){return (d.spiel == gid && d.typ.ID == 2);});
			var gameGoal = {
				"x": i,
				"y": goals_array.length,
				"gid": gid
			};
			goals.push(gameGoal);
			var gameSeven = {
				"x": i,
				"y": seven_array.length,
				"gid": gid
			};
			sevens.push(gameSeven);
			var gamePenalty = {
				"x": i,
				"y": penalty_array.length,
				"gid": gid
			};
			penalties.push(gamePenalty);
			i++;
		}));
		goals.sort(enyo.bind(this, function(a, b){return a.gid - b.gid;}));
		sevens.sort(enyo.bind(this, function(a, b){return a.gid - b.gid;}));
		penalties.sort(enyo.bind(this, function(a, b){return a.gid - b.gid;}));
		gevents = [goals, sevens, penalties];
		return gevents;
	},
	
	// general helper
	personIds: function() {
		var personIds = [];
		this.data.forEach(function(dataItem){
			if(personIds.indexOf(dataItem.person.ID) == -1) personIds.push(dataItem.person.ID);
		});
		return personIds;
	},
	gameIds: function() {
		var gameIds = [];
		this.data.forEach(function(dataItem){
			if(gameIds.indexOf(dataItem.spiel) == -1) gameIds.push(dataItem.spiel);
		})
		return gameIds;
	},
	typeIds: function() {
		var typeIds = [];
		this.data.forEach(function(dataItem){
			if(typeIds.indexOf(dataItem.typ.ID) == -1) typeIds.push(dataItem.typ.ID);
		})
		return typeIds;
	}
});