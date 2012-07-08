enyo.kind ({
	name: "D3ChartArea",
	classes: "d3ChartArea",
	kind: "enyo.Control",
	published: {
		svg: null,
	},
	rendered: function() {
		this.inherited(arguments);
		var node = this.hasNode();
		//var bounds = this.getBounds();
		this.svg = d3.select(node).append("svg");
				//.attr("width", bounds.width)
				//.attr("height", bounds.height);
	}
});