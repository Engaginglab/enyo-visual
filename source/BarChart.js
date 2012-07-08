enyo.kind ({
	name: "BarChart",
	classes: "barChart",
	kind: "D3ChartArea",
	published: {
		data: [], // data structure [[{x:0, y:123},{x:1, y:145},…], [{x:0, y:123},{x:1, y:145},…],…] An Array of arrays containing value pair objects
		barData: [],
		yvalues: ["y"], // what data attributes should be the y values
		xtitle: "", // title of x axis
		ytitle: "", // title of y axis
		chartStyle: "stacked", // or grouped
		margin: 0
	},
	dataChanged: function() {
		this.barData = d3.layout.stack()(this.data);
		this.drawChart();
		//console.log(this.barData);
	},
	rendered: function() {
		this.inherited(arguments);
		//this.setData(goaldata);
	},
	drawChart: function() {
		this.log("drawing chart...");
		var bounds = this.getBounds();
		var w = bounds.width;
		var h = bounds.height;
		this.margin = 40;
		var margin = this.margin;
		var xrange = this.rangeX(this.barData);
		var yrange = this.rangeY(this.barData);
		//var zrange = this.rangeZ(this.barData);
		var x = d3.scale.linear().domain([xrange.min, xrange.max]).range([0 + margin, w - margin]);
		var y = d3.scale.linear().domain([yrange.min, yrange.max]).range([0 + margin, h - margin]);
		//var z = d3.scale.linear().domain([zrange.min, zrange.max]).range([0 + margin, h - margin]);
		
		var color = d3.scale.category10();
		this.svg.selectAll("g").remove();
		
		var layers = this.svg.selectAll("g.layer")
 		    .data(this.barData)
 		  .enter().append("g")
 		    .style("fill", function(d, i) { return color(i); })
 		    .attr("class", "layer");
 		
 		var bars = layers.selectAll("g.bar")
 		    .data(function(d) { return d; })
 		  .enter().append("g")
 		    .attr("class", "bar")
 		    .attr("transform", function(d) { return "translate(" + x(d.x) + ","+y(yrange.max)+")"; });
 		
 		bars.append("rect")
 		    .attr("width", 0.9*(x(1)-x(0)))
 		    .attr("x", -0.45*(x(1)-x(0)))
 		    .attr("y", 0)
 		    .attr("height", 0)
 		  .transition()
 		    .delay(function(d, i) { return i * 10; })
 		    .attr("y", function(d){return -y(d.y0+d.y)+margin;})
 		    .attr("height", function(d) { return y(d.y)-margin; });
		
		this.drawAxes(this.barData, x, y);
		this.drawCaption(color, this.yvalues);
	},
	drawAxes: function(data, xcal, ycal) {
		var g = this.svg.append("svg:g")
			.attr("transform", "translate(0, "+this.getBounds().height+")");
		var xmin = this.rangeX(data).min;
		var xmax = this.rangeX(data).max;
		var ymin = this.rangeY(this.barData).min;
		var ymax = this.rangeY(this.barData).max;
		
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
		    .data(xcal.ticks(data[0].length))
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
		    .data(xcal.ticks(data[0].length))
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
		var max = d3.max(data[0], function(d){return d.x})+1;
		var min = d3.min(data[0], function(d){return d.x})-1;		
		return {"max":max, "min":min};
	},
	rangeY: function(data) {
		if(this.chartStyle == "stacked") {
			var max = d3.max(data, function(d){
				return d3.max(d, function(d){
					return d.y0 + d.y;
				});
			});
			var min = d3.min(data, function(d){
				return d3.min(d, function(d){
					return d.y;
				});
			});
		}else{
			var max = d3.max(data, function(d){
				return d3.max(d, function(d){
					return d.y;
				});
			});
			var min = d3.min(data, function(d){
				return d3.min(d, function(d){
					return d.y;
				});
			});		
		}
		return {"max":max+1, "min":min};
	},
	rangeZ: function(data) {
		var max = d3.max(data, function(d){
		    return d3.max(d, function(d){
		    	return d.y;
		    });
		});
		var min = d3.min(data, function(d){
		    return d3.min(d, function(d){
		    	return d.y;
		    });
		});
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
		  	.attr("fill", function(d, i){return fill(i);});
	},
	transitionGroup: function() {
		//this.chartStyle = "grouped"; //! Die y-Achse muss dann mitskaliert werden <- TODO
		var xrange = this.rangeX(this.barData);
		var yrange = this.rangeY(this.barData);
		var margin = this.margin;
		var x = d3.scale.linear().domain([xrange.min, xrange.max]).range([0 + margin, this.getBounds().width - margin]);
		var y = d3.scale.linear().domain([yrange.min, yrange.max]).range([0 + margin, this.getBounds().height - margin]);
		var m = this.barData[0].length;
		var n = this.yvalues.length;
		
		var group = d3.selectAll("#"+this.id);
		group.selectAll("g.layer rect")
		  .transition()
		    .duration(500)
		    .delay(function(d, i) { return (i % m) * 10; })
		    .attr("x", function(d, i) { return (-0.45*(x(1)-x(0))+0.9*(x(1)-x(0))* ~~(i / m) / n); })
		    .attr("width", 0.9*(x(1)-x(0))/n)
		    .each("end", transitionEnd);
		
		function transitionEnd() {
		  d3.select(this)
		    .transition()
		      .duration(500)
		      .attr("y", function(d){return -y(d.y)+margin;})
		      .attr("height", function(d){return y(d.y)-margin;});
		}
	},
	transitionStack: function() {
		this.chartStyle = "stacked";
		var xrange = this.rangeX(this.barData);
		var yrange = this.rangeY(this.barData);
		var margin = this.margin;
		var x = d3.scale.linear().domain([xrange.min, xrange.max]).range([0 + margin, this.getBounds().width - margin]);
		var y = d3.scale.linear().domain([yrange.min, yrange.max]).range([0 + margin, this.getBounds().height - margin]);
		var m = this.barData[0].length;
		var n = this.yvalues.length;
	
		var stack = d3.select("#"+this.id);
		
		stack.selectAll("g.layer rect")
		  .transition()
		    .duration(500)
		    .delay(function(d, i) { return (i % m) * 10; })
		    .attr("y", function(d){return -y(d.y0+d.y)+margin;})
		    .attr("height", function(d) { return y(d.y)-margin; })
		    .each("end", transitionEnd);
		
		function transitionEnd() {
		  d3.select(this)
		    .transition()
		     .duration(500)
		     .attr("width", 0.9*(x(1)-x(0)))
 		     .attr("x", -0.45*(x(1)-x(0)));
		}
	}
});