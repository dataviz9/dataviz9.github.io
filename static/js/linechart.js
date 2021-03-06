const LINECHART = {
  margin: { top: 50, right: 50, bottom: 30, left: 50 },
}

let lineColors = [
  '#469990', '#000075', '#e6194B', '#4363d8',
  '#f58231', '#42d4f4', '#800000', '#3cb44b'
]

let colorID = 0

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
    overshoot_day: [new Date(2014, 0, 1), new Date(2014, 11, 31)],
    ratio: [-1, 1]
  }

  linechart.scales = {
    x: d3.scaleLinear().range([0, linechart.width])
      .domain([1961, 2014]),
    y: undefined,
    linear: d3.scaleLinear().range([linechart.height, linechart.margin.top])
      .domain(linechart.extents[linechart.field])
      .nice(linechart.extents.overshoot_day),
    month: d3.scaleTime()
      .domain([new Date(2014, 0, 1), new Date(2014, 11, 31)])
      .range([linechart.height, linechart.margin.top])
      //(d3.timeMonth.every(1))
      .clamp(true)
  }

  linechart.line = d3.line()
    .x(function (d) { return linechart.scales.x(+d.year) })
    .y(function (d) {
      return linechart.scales.y(
        linechart.field === "overshoot_day" ?
          moment(2014, "YYYY").add(+d[linechart.field], "days").toDate() :
          +d[linechart.field])
    })

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

    // .call(linechart.axis.y)
  }
  // 

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

  linechart.tip = d3.tip()
    .attr('class', 'line-d3-tip d3-tip')
    .direction('w')
    .offset([-4, -10])
    .html(function (d) {
      return "<strong>" + d.country + "</strong>"
    })

  linechart.svg.call(linechart.tip);

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
  linechart.extents["ratio"] = d3.extent(
    linechart.extents["ratio"].concat(d3.extent(data, d => +d.ratio))
  )
  linechart.extents["footprint"] = d3.extent(
    linechart.extents["footprint"].concat(d3.extent(data, d => +d.footprint))
  )
  linechart.scales.y = linechart.field === "overshoot_day" ?
    linechart.scales.month :
    linechart.scales.linear

  linechart.scales.y.domain(linechart.extents[linechart.field])
  let axis = linechart.field === "overshoot_day" ?
    d3.axisLeft(linechart.scales.y).tickFormat(d3.timeFormat("%b")) :
    d3.axisLeft(linechart.scales.y)
  linechart.axisElt.y.call(axis)
  if (linechart.field === "overshoot_day") {
    linechart.axisElt.y.selectAll(".tick text")
      // .style("text-anchor", "start")
      // .attr("x", -10)
      .attr("y", -6)
  }

  // .select(".domain")
  // .remove()

  linechart.line.y(function (d) {
    return linechart.scales.y(
      linechart.field === "overshoot_day" ?
        moment(2014, "YYYY").add(+d[linechart.field], "days").toDate() :
        +d[linechart.field])
  })

  d3.selectAll(".trace")
    .attr("d", linechart.line)
    .attr("stroke-dasharray", "")
    .attr("stroke-dashoffset", 0);

  d3.selectAll(".linechart-legend")
    .attr("y", function (d) {
      return (linechart.scales.y(
        linechart.field === "overshoot_day" ?
          moment(2014, "YYYY").add(+d[linechart.field], "days").toDate() :
          +d[linechart.field]) + 4)
    })
}

function addLine(linechart, country) {
  let folder = "static/splitted_data/"
  linechart.graphics[country] = {
    trace: linechart.canvas.append("path"),
    legend: linechart.canvas
      .append("text")
  }

  d3.csv(folder + country + '.csv', data => {

    updateScale(linechart, data)
    lineColor = lineColors[colorID]
    colorID += 1
    if (colorID > lineColors.length - 1) { colorID -= lineColors.length }

    let last = data[data.length - 1]
    last.color = lineColor
    let legend = linechart.graphics[country].legend
      .datum(last)


    let trace = linechart.graphics[country].trace
      .datum(data)
      .attr("class", "trace")
      .style("stroke", lineColor)
      .attr("d", linechart.line)

    let totalLength = trace.node().getTotalLength()
    trace.attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(1000)
      // .ease("linear")
      .attr("stroke-dashoffset", 0)
      .on("end", function () {
        legend.attr("x", d => linechart.scales.x(d.year) + 2)
          .attr("y", d => {
            return (linechart.scales.y(
              linechart.field === "overshoot_day" ?
                moment(2014, "YYYY").add(+d[linechart.field], "days").toDate() :
                +d[linechart.field])
              + 4)
          })
          .text(d => d.id)
          .attr("class", "linechart-legend")
          .style("stroke", lineColor)
      })

    legend.on("mouseover", function (d) {
      linechart.tip.show(legend.datum())
      hoverLine(trace, legend)()
      showValueTip(linechart, d)
    })
      .on("mouseout", function () {
        linechart.tip.hide()
        resetLines()
      })

    trace.on("mouseover", hoverLine(trace, legend))
      .on("mouseout", resetLines)
  })
}

function showValueTip(linechart, datum) {
  let year = linechart.cursor.datum()
  let data = linechart.graphics[datum.id].trace.datum()
  let value = data.filter(d => +d.year === year)[0]

  linechart.canvas.append("circle")
    .datum(value)
    .attr("cx", d => linechart.scales.x(+d.year))
    .attr("cy", d => {
      return linechart.scales.y(
        linechart.field === "overshoot_day" ?
          moment(2014, "YYYY").add(+d[linechart.field], "days").toDate() :
          +d[linechart.field])
    })
    .attr("r", 3)
    .attr("fill", datum.color)
    .attr("class", "linechart-pin")

  linechart.canvas.append("text")
    .datum(value)
    .attr("x", d => linechart.scales.x(+d.year))
    .attr("y", d => {
      return linechart.scales.y(
        linechart.field === "overshoot_day" ?
          moment(2014, "YYYY").add(+d[linechart.field], "days").toDate() :
          +d[linechart.field]) + 12
    })
    .text(d => {
      if (linechart.field === "overshoot_day") {
        return d[linechart.field] > 365 ? 
        "Next year" : 
        moment(year, "YYYY").add(d[linechart.field], "days").format("D MMM")
      } else {
        return d3.format(".3f")(d[linechart.field])
      }
    })
    .attr("class", "value-tip")
    .attr("fill", datum.color)
}

function hoverLine(trace, legend) {
  return function (d) {
    trace.style("opacity", "")
    legend.style("opacity", "")
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

  d3.selectAll(".value-tip").remove()
  d3.selectAll(".linechart-pin").remove()

}

function hoverCountryTrace(linechart, country) {
  let graphics = linechart.graphics[country]
  hoverLine(graphics.trace, graphics.legend)()
}

function setDate(linechart, year, duration) {
  linechart.cursor
    .datum(year)
    .transition()
    .duration(duration)
    .attr("x1", linechart.scales.x(year))
    .attr("y1", linechart.margin.top - 5)
    .attr("x2", linechart.scales.x(year))
    .attr("y2", linechart.height)
}

function setLineSource(linechart, source) {
  linechart.field = source
  updateScale(linechart, [])
}
