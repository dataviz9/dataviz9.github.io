const LINECHART = {
    margin: { top: 5, right: 5, bottom: 30, left: 30 },
  }

  let field="overshoot_day"
  
function initLineChart() {

  let linechart = LINECHART
  linechart.width = 800 - linechart.margin.left - linechart.margin.right
  linechart.height = 500 - linechart.margin.top - linechart.margin.bottom

  linechart.svg = d3.select('#linechart')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 800 500")
  
  linechart.canvas = linechart.svg.append('g')
      .attr('class', 'linechart')
      .attr('width', linechart.width)
      .attr('height', linechart.height)
      .attr('transform', 'translate(' + linechart.margin.left + "," + linechart.margin.top + ")")

  linechart.scales = {
    x: d3.scaleLinear().range([0, linechart.width])
    .domain([1961, 2014]),
    y: d3.scaleLinear().range([linechart.height, linechart.margin.top])
    .domain([0,365])
  }

  linechart.line = d3.line()
  .x(function(d) { return linechart.scales.x(+d.year)})
  .y(function(d) { return linechart.scales.y(+d[field])})

  linechart.svg.append("g")
  .attr("transform", "translate(" + linechart.margin.left + "," + linechart.height + ")")
  .call(d3.axisBottom(linechart.scales.x))
  .select(".domain")
  // .remove();

  linechart.svg.append("g")
  .attr("transform", "translate("+ linechart.margin.left+",0)")
  .call(d3.axisLeft(linechart.scales.y))
  .select(".domain")
  // .remove();

  return linechart
}


function addLine(linechart, country){

// xScale.domain(d3.extent(data, function(d) { return d.date }));
// yScale.domain(d3.extent(data, function(d) { return d.value }));
  let folder = "static/splitted_data/"
  d3.csv(folder + country + '.csv', data => {
    linechart.canvas.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("stroke-width", 1.5)
    .attr("d", linechart.line);
  })

  

}

