const WORLDMAP = {
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
}

function initWorldmap(mapJson) {
  let worldmap = WORLDMAP
  worldmap.width = 800 - worldmap.margin.left - worldmap.margin.right
  worldmap.height = 500 - worldmap.margin.top - worldmap.margin.bottom

  worldmap.scales = {
      footprint: d3.scaleThreshold()
      .domain([1, 3, 5, 7, 9, 17])
      .range(['#2a8637', '#54a65f', '#a3d17c', '#eecd17', '#e59d4b', '#e86e10']),
      // .range(['#006600','#146600','#2a6600','#3f6600','#556600','#666300','#664d00','#663800','#661400','#660000']),

      ratio: d3.scaleQuantize()
      .domain([-1.4, 1.4])
      .range(["#0B7506", "#349B0A", "#5DA20E", '#88AB13', '#B2B118', '#D46C03', '#C34623', '#CB2935'])

  }

  let projection = d3.geoMercator()
    .scale(125)
    .translate([worldmap.width / 2, worldmap.height / 1.5])

  worldmap.geopath = d3.geoPath().projection(projection)
  // Set tooltips
  worldmap.tip = d3.tip()
    .attr('class', 'd3-tip')
    .direction('s')
    .offset([15, 0])
    .html(function (d) {
      return "<strong>Country: </strong><span class='details'>" +
        d.properties.name + '<br></span>' +
        "<strong>Footprint / pers : </strong><span class='details'>" +
        d3.format(',.3f')(d.footprint) + '</span><br/>' +
        "<strong>Reserve / pers : </strong><span class='details'>" +
        d3.format(',.3f')(d.deficit) + '</span>'
    })


  worldmap.canvas = d3.select('#worldmap')
  let svg = worldmap.canvas
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox", "0 0 800 500")
    // .attr('width', worldmap.width)
    // .attr('height', worldmap.height)
    .append('g')
    .attr('class', 'map')
  svg.call(worldmap.tip)



  worldmap.paths = svg.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(mapJson.features, d => d.id)
    .enter().append('path')
    .attr('d', worldmap.geopath)
    .attr('class', 'country-footprint')
    // .style('opacity', 0.8)
    .style('stroke', 'grey')
    .style('stroke-width', 0.5)
    


  svg.append('path')
    .datum(topojson.mesh(mapJson.features, (a, b) => a.id !== b.id))
    .attr('class', 'names')
    .attr('d', worldmap.geopath)

  // Worldmap Legend
  // Source : https://d3-legend.susielu.com

  svg.append("g")
    .attr("class", "legendQuant")
    .attr("transform", "translate(20,260)")

  worldmap.legend = d3.legendColor()
    .labelFormat(d3.format("<.0f"))
    .scale(worldmap.scales.footprint)

  svg.select(".legendQuant")
    .call(worldmap.legend)

  return worldmap
}

function highlight_country(country, highlight = true) {
  d3.selectAll(".country-footprint")
  .filter(d => d.id === country)
    .transition()
    .duration(300)
    // .style('opacity', d => highlight === true ? 1 : 1)
    .style('stroke', d => highlight === true ? "purple" : 'grey')
    .style('stroke-width', d => highlight === true ? 1.5 : 0.5)
    .style("filter", d => highlight === true ? "url(#glow)" : "")
}

function updateWorldData(data) {
  let dataById = {}
  data.forEach(function (d) {
    dataById[d.id] = {
      footprint: +d.footprint,
      ratio: +d.ratio,
      deficit: +d.deficit
    }
  })

  let updated = d3.selectAll(".country-footprint").data()
  updated.forEach(d => {
    if (dataById[d.id] !== undefined) {
      d.footprint = dataById[d.id].footprint
      d.ratio = dataById[d.id].ratio
      d.deficit = dataById[d.id].deficit
    } else {
      d.footprint = undefined
      d.ratio = undefined
      d.deficit = undefined
    }
  })
  return updated
}


function updateWorld(worldmap) {
  d3.csv('static/footprintDeficitByYear/' + worldmap.year + '.csv', data => {
    let updated = updateWorldData(data)

    d3.selectAll(".country-footprint")
      .transition()
      .duration(200)
      .attr("fill", "grey")

    d3.selectAll('.country-footprint')
      .data(updated, d => d.id)
      .transition()
      .duration(200)
      .attr('fill', function (d) {
        return d[worldmap.source] === undefined ? 'grey' : worldmap.scale(d[worldmap.source])
      })
  })
}

function setYear(worldmap, year) {
  worldmap.year = year
  updateWorld(worldmap)
}

function setSource(worldmap, source, update = true) {
  worldmap.source = source
  worldmap.scale = worldmap.scales[source]
  // worldmap.legend.scale =
  
  worldmap.legend = d3.legendColor()
  .labelFormat(d3.format("<.1f"))
  .labels(function ({
    i,
    genLength,
    generatedLabels,
    labelDelimiter
  }) {
    const values = generatedLabels[i].split(` ${labelDelimiter} `)
    if (i === 0) {
      return `< ${values[1]}`
    } else if (i === genLength - 1) {
      return `> ${values[0]}`
    }
    return `[${values[0]} , ${values[1]}]`
  })
  .scale(worldmap.scales[source])
  worldmap.canvas.select(".legendQuant")
    .call(worldmap.legend)
    
  if (update === true) updateWorld(worldmap)
}