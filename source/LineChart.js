enyo.kind ({
	name: "LineChart",
	classes: "lineChart",
	kind: "D3ChartArea",
	published: {
		data: [], // flat data structure [{category:aaa, x:123, y:123},... ]
		category: "category", // what data attribute should be the category
		xvalue: "x", // what data attribute should be the x value
		yvalue: "y", // what data attribute should be the y value
		xtitle: "", // title of x axis
		ytitle: "" // title of y axis
	},
	dataChanged: function() {
		this.drawChart();
		//console.log(this.data);
	},
	rendered: function() {
		this.inherited(arguments);
		//this.setData(goaldata);
	},
	drawChart: function() {
		var bounds = this.getBounds();
		var w = bounds.width;
		var h = bounds.height;
		var margin = 40;
		var xrange = this.rangeX(this.data);
		var yrange = this.rangeY(this.data);
		var y = d3.scale.linear().domain([yrange.min, yrange.max]).range([0 + margin, h - margin]);
		var x = d3.scale.linear().domain([xrange.min, xrange.max]).range([0 + margin, w - margin]);
		
		var color = d3.scale.category10();
		
		var categories = [];
		if(this.data[0][this.category] != null) {
			this.data.forEach(enyo.bind(this, function(item){
				if(categories.indexOf(item[this.category]) == -1) categories.push(item[this.category]);
			}));
		}
		
		this.svg.selectAll("g").remove();
		
		if(categories.length >= 1){
			categories.forEach(enyo.bind(this, function(cat){
				var catData = this.data.filter(enyo.bind(this, function(d){return (d[this.category] == cat);}));
				this.drawLine(catData, x, y, color(cat));
			}));
		}else{
			this.drawLine(this.data, x, y);
		}
		
		this.drawAxes(this.data, x, y);
		this.drawCaption(color, categories);
	},
	drawLine: function(data, xcal, ycal, strokeColor) {
		var g = this.svg.append("svg:g")
			.attr("transform", "translate(0, "+this.getBounds().height+")");
		var line = d3.svg.line()
			.x(enyo.bind(this, function(d){return xcal(d[this.xvalue]);}))
			.y(enyo.bind(this, function(d){return -1 * ycal(d[this.yvalue]);}));
		
		g.append("svg:path").attr("d", line(data))
			.attr("stroke", strokeColor);
		g.append("title")
			.text(data[0][this.category]);
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
		    .attr("y1", -1 * ycal(0))
		    .attr("x2", xcal(xmax))
		    .attr("y2", -1 * ycal(0));
		 
		g.append("svg:line")
		    .attr("x1", xcal(xmin))
		    .attr("y1", -1 * ycal(ymin))
		    .attr("x2", xcal(xmin))
		    .attr("y2", -1 * ycal(ymax));
		
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
		    .data(xcal.ticks(10))
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
		    .data(xcal.ticks(10))
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
	drawCaption: function(fill, categories) {
		var widthsum = 10;
		this.svg.append("g")
			.attr("class", "caption")
		  .selectAll("text")
		  	.data(categories)
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