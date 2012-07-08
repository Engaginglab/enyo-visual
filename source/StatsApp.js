enyo.kind({
	name: "StatsApp",
	layoutKind: "FittableRowsLayout",
	classes: "statsApp",
	published: {
		dataManager: null
	},
	components: [
		{kind: "onyx.RadioGroup", name: "pageSelector", components: [
			{content: "Forced Bubble Chart", number: 0, onclick: "showPage"},
			{content: "Bubble Chart", number: 1, onclick: "showPage", active: true},
			{content: "Line Chart", number: 2, onclick: "showPage"},
			{content: "Chord Chart", number: 3, onclick: "showPage"},
			{content: "Dot Plot", number: 4, onclick: "showPage"},
			{content: "Bar Chart", number: 5, onclick: "showPage"}
		]},
		{kind: "Book", name: "book", fit: true, components: [
			{kind: "FittableRows", classes: "enyo-fill", components: [
				{kind: "onyx.Button", onclick: "toggleSorting", content: "Auf keinen Fall anklicken!"},
				{kind: "ForcedBubbleChart", name: "forcedBubbleChart", fit: true}
			]},
			{kind: "BubbleChart", name: "bubbleChart", fit: true},
			{kind: "LineChart", name:"lineChart", fit: true},
			{kind: "ChordChart", name:"chordChart", fit: true},
			{kind: "DotPlot", name:"dotPlot", fit: true},
			{kind: "FittableRows", classes: "enyo-fill", components: [
				{kind: "onyx.RadioGroup", name: "barStyleSelector", components: [
					{content: "Stacked", onclick: "stackedBarChart", active: true},
					{content: "Grouped", onclick: "groupedBarChart"}
				]},
				{kind: "BarChart", name:"barChart", fit: true},
			]},
		]}
	],
	create: function() {
		this.inherited(arguments);
		this.dataManager = new DataManager();
		d3.json("res/spowalla_ereignisse.json", enyo.bind(this, function(cb_data){
			this.dataManager.setData(cb_data);
		    this.$.bubbleChart.setNodes(this.dataManager.personNodes());
		}));
	},
	rendered: function() {
		this.inherited(arguments);
		this.$.book.pageNumber(1);
	},
	toggleSorting: function() {
		this.$.forcedBubbleChart.sort = !this.$.forcedBubbleChart.sort;
		this.$.forcedBubbleChart.calculateFoci(3);
		this.$.forcedBubbleChart.start();
	},
	stackedBarChart: function() {
		this.$.barChart.transitionStack();
	},
	groupedBarChart: function() {
		this.$.barChart.transitionGroup();
	},
	showPage: function(inSender){
		switch(inSender.number) {
			case 0:
				d3.json("res/spowalla_ereignisse.json", enyo.bind(this, function(cb_data){
					this.dataManager.setData(cb_data);
				    this.$.bubbleChart.setNodes(this.dataManager.personNodes());
				}));
				break;
			case 1:
				d3.json("res/spowalla_ereignisse.json", enyo.bind(this, function(cb_data){
					this.dataManager.setData(cb_data);
				    this.$.bubbleChart.setNodes(this.dataManager.personNodes());
				}));
				break;
			case 2:
				d3.json("res/spowalla_ereignisse.json", enyo.bind(this, function(cb_data){
					this.dataManager.setData(cb_data);
					this.$.lineChart.setCategory("person");
					this.$.lineChart.setXvalue("xid");
					this.$.lineChart.setYvalue("Tore");
					this.$.lineChart.setXtitle("Spiel");
					this.$.lineChart.setYtitle("# Tore");
				    this.$.lineChart.setData(this.dataManager.gamesEvents([81, 46, 42]));
				}));
				break;
			case 3:
				var data = {};
				data.labels = ["Springfield", "Entenhausen", "Bruchtal", "Speziland"];
				data.matrix = [[19,8,9,2],[9,10,2,6],[8,16,8,8],[10,9,9,6]];
				this.$.chordChart.setData(data);
				break;
			case 4:
				d3.json("res/spowalla_ereignisse.json", enyo.bind(this, function(cb_data){
					this.dataManager.setData(cb_data);
					this.$.dotPlot.setCategory("typ");
					this.$.dotPlot.setXvalue("person");
					this.$.dotPlot.setYvalue("zeit");
					this.$.dotPlot.setXtitle("Spieler");
					this.$.dotPlot.setYtitle("Spielminute");
				    this.$.dotPlot.setData(this.dataManager.dotplotGameData(389089)); // Spiel ID als Parameter
				}));
				break;
			case 5:
				d3.json("res/spowalla_ereignisse.json", enyo.bind(this, function(cb_data){
					this.dataManager.setData(cb_data);
					this.$.barChart.setYvalues(["Tore", "Siebenmeter", "Zeitstrafen"]);
					this.$.barChart.setXtitle("Spiel");
					this.$.barChart.setYtitle("Anzahl");
				    this.$.barChart.setData(this.dataManager.barChartData([46])); // Spieler ID als Parameter
				}));
				break;
			default:
				break;
		}
		this.$.book.pageNumber(inSender.number);
		this.$.book.render();
	}
});