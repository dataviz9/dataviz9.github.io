const LINECHART = {
  margin: { top: 50, right: 50, bottom: 30, left: 30 },
}

// function setLinechartHeight(linechart, height){
//   linechart.svg.transition()
//   .duration(500)
//   .attr("viewBox", "0 0 800 "+height)
// }

function initLineChart() {

  let linechart = LINECHART
  linechart.width = 1000 - linechart.margin.left - linechart.margin.right
  linechart.height = 300 - linechart.margin.top - linechart.margin.bottom

  linechart.field = "footprint"

  linechart.svg = d3.select('#linechart')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 1000 250")

  linechart.canvas = linechart.svg.append('g')
    .attr('class', 'linechart')
    .attr('width', linechart.width)
    .attr('height', linechart.height)
    .attr('transform', 'translate(' + linechart.margin.left + ",0)")


  linechart.extents = {
    footprint: [0, 1],
    overshoot_day: [0, 365],
    ratio: [-1, 1]
  }

  linechart.scales = {
    x: d3.scaleLinear().range([0, linechart.width])
      .domain([1961, 2014]),
    y: d3.scaleLinear().range([linechart.height, linechart.margin.top])
      .domain(linechart.extents[linechart.field]).nice()
  }

  linechart.line = d3.line()
    .x(function (d) { return linechart.scales.x(+d.year) })
    .y(function (d) { return linechart.scales.y(+d[linechart.field]) })

  // linechart.svg.append("g")
  //   .attr("transform", "translate(" + linechart.margin.left + "," + linechart.height + ")")
  //   .call(d3.axisBottom(linechart.scales.x))
  //   .select(".domain")
  // .remove();

  linechart.axis = {
    y: d3.axisLeft(linechart.scales.y)
  }

  linechart.axisElt = {
    y: linechart.svg.append("g")
      .attr("transform", "translate(" + linechart.margin.left + ",0)")
      .attr("class", "linechart-axis")
      .call(linechart.axis.y)
  }
  // .select(".domain")

  linechart.cursor = linechart.canvas
    .append("line")
    .attr("x1", linechart.scales.x(1970))
    .attr("y1", linechart.margin.top - 5)
    .attr("x2", linechart.scales.x(1970))
    .attr("y2", linechart.height)
    .style("stroke-width", 1)
    .style("stroke", "orange")
    .style("fill", "none")
    .style("stroke-dasharray", 2)
  // .remove();

  linechart.svg.select("select")
    .attr("transform", "translate(" + linechart.width / 2 + "," + linechart.height / 2 + ")")
    .raise()

  linechart.graphics = {}


  return linechart
}


function removeLine(linechart, country) {
  let graphics = linechart.graphics[country]
  if (graphics !== undefined) {
    graphics.trace.remove()
    graphics.legend.remove()
  }
  linechart.graphics[country] = undefined
}


function updateScale(linechart, data) {
  linechart.extents["ratio"] =d3.extent(
    linechart.extents["ratio"].concat(d3.extent(data, d => +d.ratio))
  )
  linechart.extents["footprint"] =d3.extent(
    linechart.extents["footprint"].concat(d3.extent(data, d => +d.footprint))
  )

  if (linechart.field === "overshoot_day") {
    linechart.scales.y.clamp(true)
  } else {
    linechart.scales.y.clamp(false)
  }

  linechart.scales.y.domain(linechart.extents[linechart.field]).nice()
  linechart.axisElt.y.call(d3.axisLeft(linechart.scales.y))

  linechart.line.y(function (d) { return linechart.scales.y(+d[linechart.field]) })

  d3.selectAll(".trace")
    .attr("d", linechart.line)
  d3.selectAll(".linechart-legend")
    .attr("y", function (d) { return linechart.scales.y(d[linechart.field]) + 4 })
}

function addLine(linechart, country) {

  // xScale.domain(d3.extent(data, function(d) { return d.date }));
  // yScale.domain(d3.extent(data, function(d) { return d.value }));
  let folder = "static/splitted_data/"
  linechart.graphics[country] = {
    trace: linechart.canvas.append("path"),
    legend: linechart.canvas
      .append("text")
  }

  d3.csv(folder + country + '.csv', data => {

    updateScale(linechart, data)

    let last = data[data.length - 1]
    let legend = linechart.graphics[country].legend
      .datum(last)
      .attr("x", d => linechart.scales.x(d.year) + 2)
      .attr("y", d => linechart.scales.y(d[linechart.field]) + 4)
      .text(d => d.id)
      .attr("class", "linechart-legend")
    let trace = linechart.graphics[country].trace
      .datum(data)
      .attr("fill", "none")
      .attr("class", "trace")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", linechart.line)

    legend.on("mouseover",
      hoverLine(trace, legend)
    )
      .on("mouseout", resetLines)
    trace.on("mouseover", hoverLine(trace, legend))
      .on("mouseout", resetLines)
  })
}

function hoverLine(trace, legend) {
  return function () {
    d3.selectAll(".linechart-legend")
      .filter(function (d) { return this !== legend.node() })
      .style("opacity", 0.1)
    d3.selectAll(".trace")
      .filter(function (d) { return this !== trace.node() })
      .style("opacity", 0.3)
  }
}

function resetLines() {
  d3.selectAll(".linechart-legend")
    .style("opacity", "")
  d3.selectAll(".trace")
    .style("opacity", 1)
}

function hoverCountryTrace(linechart, country) {
  let graphics = linechart.graphics[country]
  hoverLine(graphics.trace, graphics.legend)()
}

function setDate(linechart, year, duration) {
  linechart.cursor
    .transition()
    .duration(duration)
    .attr("x1", linechart.scales.x(year))
    .attr("y1", linechart.margin.top - 5)
    .attr("x2", linechart.scales.x(year))
    .attr("y2", linechart.height)
}

function setLineSource(linechart, source) {
  linechart.field = source
  console.log(d3.selectAll(".trace").datum())
  updateScale(linechart, [])
}