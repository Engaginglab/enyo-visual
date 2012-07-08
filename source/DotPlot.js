enyo.kind ({
	name: "DotPlot",
	classes: "dotPlot",
	kind: "D3ChartArea",
	published: {
		data: null, // flat data structure [{category:aaa, x:123, y:123},... ]
		category: "category", // what data attribute should be the category
		xvalue: "x", // what data attribute should be the x value
		yvalue: "y", // what data attribute should be the y value
		xtitle: "", // title of x axis
		ytitle: "", // title of y axis
		categories: [] // wäre als private variable besser
	},
	dataChanged: function() {
		if (this.data && this.data.length) {
			this.drawChart();
		}
		//console.log(this.data);
	},
	rendered: function() {
		this.inherited(arguments);
		this.dataChanged();
	},
	drawChart: function() {
		var bounds = this.getBounds();
		var w = bounds.width;
		var h = bounds.height;
		var margin = 50;
		var xrange = this.rangeX(this.data);
		var yrange = this.rangeY(this.data);
		var y = d3.scale.linear().domain([yrange.min, yrange.max]).range([0 + margin, h - margin]);
		var x = d3.scale.linear().domain([xrange.min, xrange.max]).range([0 + margin, w - margin]);
		
		var color = d3.scale.category10();
		
		//var categories = [];
		if(this.data[0][this.category] != null) {
			this.data.forEach(enyo.bind(this, function(item){
				if(this.categories.indexOf(item[this.category]) == -1) this.categories.push(item[this.category]);
			}));
		}
		this.categories.sort();
		
		this.svg.selectAll("g").remove();
		
		this.drawDots(this.data, x, y, color);
		this.drawAxes(this.data, x, y);
		this.drawCaption(color);
	},
	drawDots: function(data, xcal, ycal, color) {
		this.svg.selectAll("circle.dot")
  			.data(data)
  		  .enter().append("circle")
  			.attr("class", "dot")
  			.attr("r", 5)
  			.style("fill", enyo.bind(this, function(d, i) { return color(d[this.category]);}))
  			.attr("transform", enyo.bind(this, function(d) { return "translate(" + xcal(d[this.xvalue]) + "," + ycal(d[this.yvalue]) + ")"; }));
	},
	drawAxes: function(data, xcal, ycal) {
		var g = this.svg.append("svg:g")
			.attr("transform", "translate(0, "+this.getBounds().height+")");
		var xmin = this.rangeX(data).min;
		var xmax = this.rangeX(data).max;
		var ymin = this.rangeY(this.data).min;
		var ymax = this.rangeY(this.data).max;
		
		// axes
		g.append("svg:line")
		    .attr("x1", xcal(xmin))
		    .attr("y1", -ycal(0))
		    .attr("x2", xcal(xmax))
		    .attr("y2", -ycal(0));
		 
		g.append("svg:line")
		    .attr("x1", xcal(xmin))
		    .attr("y1", -ycal(ymin))
		    .attr("x2", xcal(xmin))
		    .attr("y2", -ycal(ymax));
		
		g.append("svg:text")
			.attr("class", "axisLabel")
			.text(this.xtitle)
			.attr("x", xcal(xmax))
			.attr("y", -1*(ycal(0)+10));
		
		g.append("svg:text")
			.attr("class", "axisLabel")
			.text(this.ytitle)
			.attr("x", xcal(xmin))
			.attr("y", -1*(ycal(ymax)+10));
		
		
		// labels
		g.selectAll(".xLabel")
		    .data(xcal.ticks(xmax-xmin))
		    .enter().append("svg:text")
		    .attr("class", "xLabel")
		    .text(String)
		    .attr("x", function(d) { return xcal(d) })
		    .attr("y", -1*(ycal(0)-20));
		 
		g.selectAll(".yLabel")
		    .data(ycal.ticks(5))
		    .enter().append("svg:text")
		    .attr("class", "yLabel")
		    .text(String)
		    .attr("x", xcal(xmin)-10)
		    .attr("y", function(d) { return -1 * ycal(d) })
		    .attr("dy", 5);
		
		// ticks
		g.selectAll(".xTicks")
		    .data(xcal.ticks(xmax-xmin))
		    .enter().append("svg:line")
		    .attr("class", "xTicks")
		    .attr("x1", function(d) { return xcal(d); })
		    .attr("y1", -1 * ycal(ymin))
		    .attr("x2", function(d) { return xcal(d); })
		    .attr("y2", -1 * (ycal(ymin)-8))
		 
		g.selectAll(".yTicks")
		    .data(ycal.ticks(5))
		    .enter().append("svg:line")
		    .attr("class", "yTicks")
		    .attr("y1", function(d) { return -1 * ycal(d); })
		    .attr("x1", xcal(xmin)-8)
		    .attr("y2", function(d) { return -1 * ycal(d); })
		    .attr("x2", xcal(xmin))
	},
	rangeX: function(data) {
		var max = d3.max(data, enyo.bind(this, function(item){return item[this.xvalue];}));
		var min = d3.min(data, enyo.bind(this, function(item){return item[this.xvalue];}));
		return {"max":max, "min":min};
	},
	rangeY: function(data) {
		var max = d3.max(data, enyo.bind(this, function(item){return item[this.yvalue];}));
		var min = d3.min(data, enyo.bind(this, function(item){return item[this.yvalue];}));
		return {"max":max, "min":min};
	},
	drawCaption: function(fill) {
		var widthsum = 10;
		this.svg.append("g")
			.attr("class", "caption")
		  .selectAll("text")
		  	.data(this.categories)
		  .enter().append("text")
		  	.text(function(d){return d;})
		  	.attr("x", function(d, i){
		  		var oldwidthsum = widthsum;
		  		widthsum += this.getBBox().width + 10;
		  		return oldwidthsum;
		  	})
		  	.attr("y", enyo.bind(this, function(d, i){return (this.getBounds().height-5);}))
		  	.attr("fill", function(d, i){return fill(d);});
	}
});