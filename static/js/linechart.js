const LINECHART = {
  margin: { top: 50, right: 50, bottom: 30, left: 30 },
}

let field = "footprint"

function initLineChart() {

  let linechart = LINECHART
  linechart.width = 800 - linechart.margin.left - linechart.margin.right
  linechart.height = 300 - linechart.margin.top - linechart.margin.bottom

  linechart.svg = d3.select('#linechart')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 800 250")

  linechart.canvas = linechart.svg.append('g')
    .attr('class', 'linechart')
    .attr('width', linechart.width)
    .attr('height', linechart.height)
    .attr('transform', 'translate(' + linechart.margin.left + ",0)")

  linechart.scales = {
    x: d3.scaleLinear().range([0, linechart.width])
      .domain([1961, 2014]),
    y: d3.scaleLinear().range([linechart.height, linechart.margin.top])
      .domain([0, 17])
  }

  linechart.line = d3.line()
    .x(function (d) { return linechart.scales.x(+d.year) })
    .y(function (d) { return linechart.scales.y(+d[field]) })

  // linechart.svg.append("g")
  //   .attr("transform", "translate(" + linechart.margin.left + "," + linechart.height + ")")
  //   .call(d3.axisBottom(linechart.scales.x))
  //   .select(".domain")
  // .remove();

  linechart.svg.append("g")
    .attr("transform", "translate(" + linechart.margin.left + ",0)")
    .call(d3.axisLeft(linechart.scales.y))
    .select(".domain")

  linechart.cursor = linechart.canvas
    .append("line")
    .attr("x1", linechart.scales.x(1970))
    .attr("y1", linechart.margin.top - 5)
    .attr("x2", linechart.scales.x(1970))
    .attr("y2", linechart.height)
    .style("stroke-width", 1)
    .style("stroke", "orange")
    .style("fill", "none");
  // .remove();

  linechart.svg.select("select")
    .attr("transform", "translate(" + linechart.width / 2 + "," + linechart.height / 2 + ")")
    .raise()
  return linechart
}


function addLine(linechart, country) {

  // xScale.domain(d3.extent(data, function(d) { return d.date }));
  // yScale.domain(d3.extent(data, function(d) { return d.value }));
  let folder = "static/splitted_data/"
  d3.csv(folder + country + '.csv', data => {
    let last = data[data.length - 1]
    let legend = linechart.canvas
      .append("text")
      .attr("x", linechart.scales.x(last.year) + 2)
      .attr("y", linechart.scales.y(last[field]) + 4)
      .text(last.id)
      .attr("class", "linechart-legend")
      .on("mouseover", function (d) {
        let hovered = this
        d3.selectAll(".linechart-legend")
          .filter(function (d) { return this !== hovered })
          .style("opacity", 0.3)
      })
      .on("mouseout", function () {
        d3.selectAll(".linechart-legend")
          .style("opacity", "")
      })

    let trace = linechart.canvas.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("class", "trace")
      .attr("stroke", "steelblue")
      .attr("stroke-linejoin", "round")
      .attr("stroke-linecap", "round")
      .attr("stroke-width", 1.5)
      .attr("d", linechart.line)
      .on("mouseover", function () {
        d3.selectAll(".linechart-legend")
          .filter(function (d) { return this !== legend.node() })
          .style("opacity", 0.1)
        d3.selectAll(".trace")
          .filter(function (d) { return this !== trace.node() })
          .style("opacity", 0.3)
      })
      .on("mouseout", function () {
        d3.selectAll(".linechart-legend")
          .style("opacity", "")
        d3.selectAll(".trace")
          .style("opacity", 1)
      })
  })

}

function setDate(linechart, year) {
  linechart.cursor
    .attr("x1", linechart.scales.x(year))
    .attr("y1", linechart.margin.top - 5)
    .attr("x2", linechart.scales.x(year))
    .attr("y2", linechart.height)
}

