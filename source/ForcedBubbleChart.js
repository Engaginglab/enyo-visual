enyo.kind ({
	name: "ForcedBubbleChart",
	classes: "forcedBubbleChart",
	kind: "D3ChartArea",
	published: {
		force: null,
		nodes: {},
		sort: false,
		foci: []		
	},
	nodesChanged: function() {
		this.drawChart();
	},
	rendered: function() {
		this.inherited(arguments);
		//this.setNodes(playernodes); // Nur zum Testen nehm ich an.
	},
	drawChart: function() {
		var bounds = this.getBounds();
		var w = bounds.width;
		var h = bounds.height;
		var color = d3.scale.category20();
		
		this.force = d3.layout.force()
	    	//.charge(-90)
	    	.gravity(0.05)
	    	//.friction(0.95)
	    	.nodes(this.nodes)
	    	.size([w, h])
	    	.start();
		
		var node = this.svg.selectAll("g.node")
				.data(this.nodes)
		    .enter().append("svg:g")
		    	.attr("class", "node");
		
		node.append("svg:circle")
			.attr("r", enyo.bind(this, function(d){ return this.nodeRadius(d.goals.length+d.seven.length); }))
		    .style("fill", function(d) { return color(d.penalty.length); });
		    		    	
		node.call(this.force.drag);
		
		node.append("title")
		    .text(function(d){return d.firstName+" "+d.lastName+"\n Tore: "+d.goals.length+"\n 7-Meter: "+d.seven.length+"\n Zeitstrafen: "+d.penalty.length;});
		
		node.append("svg:text")
		    .attr("text-anchor", "middle")
		    .attr("dy", "0.35em")
		    .attr("class", "nodelabel")
		    .text(function(d) { return d.goals; });
		
		this.force.on("tick", enyo.bind(this, function(e) {
		    // push the nodes to their focus
		    if(this.sort) {
		    	var k = 0.02 * e.alpha;
  	 			this.nodes.forEach(enyo.bind(this, function(o, i) {
  	 				o.y += (this.foci[o.penalty.length % 3].y - o.y) * k;
    				o.x += (this.foci[o.penalty.length % 3].x - o.x) * k;
    			}));
		    }
		    
		    // render normel force movements with respect to the area bounds
   		 	node.attr("transform", enyo.bind(this, function(d) {
				return "translate(" + Math.max(this.nodeRadius(d.goals.length+d.seven.length), Math.min(w - this.nodeRadius(d.goals.length+d.seven.length), d.x)) + "," + Math.max(this.nodeRadius(d.goals.length+d.seven.length), Math.min(h - this.nodeRadius(d.goals.length+d.seven.length), d.y)) + ")";
			}));
		}));	
	},
	nodeRadius: function(value) {
		var offset = 8;
		return offset+Math.sqrt(value);
	},
	calculateFoci: function(nof) {
		var bounds = this.getBounds();
		var w = bounds.width;
		var h = bounds.height;
		// Ein Array der Foci-Koordinaten der "optimalen" Verteilung. Eine Berechung fällt mir gerade nicht ein, ist aber ne schöne Matheaufgabe!
		switch(nof) {
			case 2:
				this.foci = [{x: 0.33*w, y: 0.33*h}, {x: 0.66*w, y: 0.66*h}];
				break;
			case 3:
				this.foci = [{x: 0.5*w, y: 0.25*h}, {x: 0.25*w, y: 0.75*h}, {x: 0.75*w, y: 0.75*h}];
				break;
			default:
				this.foci = this.foci = [{x: 0.5*w, y: 0.5*h}];
				break;
		}
	},
	start: function() {
		this.force.start();
	}
});