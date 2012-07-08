enyo.kind ({
	name: "ChordChart",
	classes: "chordChart",
	kind: "D3ChartArea",
	published: {
		data: {
			labels:[],
			matrix:[]
		},
		vis: null,
		labelInterval: 5,
		tickInterval: 1
	},
	dataChanged: function() {
		this.drawChart();
	},
	rendered: function() {
		this.inherited(arguments);
	},
	drawChart: function() {
		var bounds = this.getBounds();
		var w = bounds.width;
		var h = bounds.height;
		var r0 = Math.min(w, h) * .35;
		var r1 = r0 * 1.1;
		var fill = d3.scale.category10();
		
		var chord = d3.layout.chord()
			.padding(.05)
			.sortSubgroups(d3.descending)
			.matrix(this.data.matrix);
		
		this.vis = this.svg.append("g")
			.attr("transform", "translate(" + w / 2 + "," + h / 2 + ")");
		
		this.vis.append("g")
		  .selectAll("path")
		    .data(chord.groups)
		  .enter().append("path")
		    .style("fill", function(d) { return fill(d.index); })
		    .style("stroke", function(d) { return fill(d.index); })
		    .attr("d", d3.svg.arc().innerRadius(r0).outerRadius(r1))
		    .on("mouseover", this.fade(.1))
		    .on("mouseout", this.fade(1));
		
		var groupTicks = enyo.bind(this, this.groupTicks);
		var ticks = this.vis.append("g")
		  .selectAll("g")
		    .data(chord.groups)
		  .enter().append("g")
		  .selectAll("g")
		    .data(groupTicks)
		  .enter().append("g")
		    .attr("transform", function(d) {
		      return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")"
		          + "translate(" + r1 + ",0)";
		    });
		
		ticks.append("line")
		    .attr("x1", 1)
		    .attr("y1", 0)
		    .attr("x2", 5)
		    .attr("y2", 0)
		    .style("stroke", "#000");
		
		ticks.append("text")
		    .attr("x", 8)
		    .attr("dy", ".35em")
		    .attr("text-anchor", function(d) {
		      return d.angle > Math.PI ? "end" : null;
		    })
		    .attr("transform", function(d) {
		      return d.angle > Math.PI ? "rotate(180)translate(-16)" : null;
		    })
		    .text(function(d) { return d.label; });
		
		this.vis.append("g")
		    .attr("class", "chord")
		  .selectAll("path")
		    .data(chord.chords)
		  .enter().append("path")
		    .style("fill", function(d) { return fill(d.target.index); })
		    .attr("d", d3.svg.chord().radius(r0))
		    .style("opacity", 1);
		    
		this.drawCaption(fill);
	},
	groupTicks: function(d) {
		var labelInterval = this.labelInterval;
		var tickInterval = this.tickInterval;
	  var k = (d.endAngle - d.startAngle) / d.value;
	  return d3.range(0, d.value, tickInterval).map(function(v, i) {
	    return {
	      angle: v * k + d.startAngle,
	      label: i % labelInterval ? null : v // every fifth tick gets a value label
	    };
	  });
	},
	fade: function(opacity) {
	  return enyo.bind(this, function(g, i) {
	    this.vis.selectAll("g.chord path")
	        .filter(function(d) {
	          return d.source.index != i && d.target.index != i;
	        })
	      .transition()
	        .style("opacity", opacity);
	  });
	},
	drawCaption: function(fill) {
		this.svg.append("g")
			.attr("class", "caption")
		  .selectAll("text")
		  	.data(this.data.labels)
		  .enter().append("text")
		  	.text(function(d){return d;})
		  	.attr("x", 10)
		  	.attr("y", function(d, i){return ((i+1)*1+0.1)+"em";})
		  	.attr("fill", function(d, i){return fill(i);});
	}
});