
// source : https://www.visualcinnamon.com/2016/06/glow-filter-d3-visualization

//Container for the gradients
var defs = d3.selectAll("svg").append("defs");

//Filter for the outside glow
var filter = defs.append("filter")
    .attr("id", "glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation", "3.5")
    .attr("result", "coloredBlur");
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");

var filter = defs.append("filter")
    .attr("id", "glow");
filter.append("feGaussianBlur")
    .attr("stdDeviation", "3.5")
    .attr("result", "coloredBlur");
var feMerge = filter.append("feMerge");
feMerge.append("feMergeNode")
    .attr("in", "coloredBlur");
feMerge.append("feMergeNode")
    .attr("in", "SourceGraphic");