enyo.kind ({
	name: "BubbleChart",
	classes: "bubbleChart",
	kind: "D3ChartArea",
	published: {
		nodes: {},		
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
		
		var bubble = d3.layout.pack()
			.size([w, h])
			.value(enyo.bind(this, function(d){return this.nodeRadius(d.goals.length+d.seven.length);}))
			.sort(enyo.bind(this, function(a, b){return d3.descending(this.nodeRadius(a.goals.length+a.seven.length), this.nodeRadius(b.goals.length+b.seven.length));}));
					
		var node = this.svg.selectAll("g.node")
			.data(bubble.nodes({"name": "rootNode", "children": this.nodes})
			.filter(function(d) { return !d.children; }))
		  .enter().append("g")
		  	.attr("class", "node")
		  	.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
		
		node.append("title")
			.text(function(d){return d.firstName+" "+d.lastName+"\n Tore: "+d.goals.length+"\n 7-Meter: "+d.seven.length+"\n Zeitstrafen: "+d.penalty.length});
		
		node.append("circle")
			.attr("r", enyo.bind(this, function(d){return this.nodeRadius(d.goals.length+d.seven.length);}))
			.style("fill", function(d){return color(d.penalty.length)});
			
		node.append("text")
			.attr("text-anchor", "middle")
			.attr("dy", ".3em")
			.text(function(d){return d.id;});
	},
	nodeRadius: function(value) {
		var offset = 8;
		return offset+Math.sqrt(value);
	}
});