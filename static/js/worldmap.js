const WORLDMAP = {
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
}

function initWorldmap(mapJson) {
  let worldmap = WORLDMAP
  worldmap.width = 800 - worldmap.margin.left - worldmap.margin.right
  worldmap.height = 500 - worldmap.margin.top - worldmap.margin.bottom

  worldmap.color = d3.scaleThreshold()
    .domain([0.5, 1, 2, 3, 5, 7, 8, 10, 12, 14])
    .range(['#00ff00', '#27ff01', '#73ff01', '#c0ff02', '#eef302', '#ffd301', '#ffa801', '#ff5306', '#ff270a', '#ff0200'])

  worldmap.scales = {
    footprint: d3.scaleThreshold()
      .domain([0.5, 1, 2, 3, 5, 7, 8, 10, 12, 14])
      .range(['#00ff00', '#27ff01', '#73ff01', '#c0ff02', '#eef302', '#ffd301', '#ffa801', '#ff5306', '#ff270a', '#ff0200']),
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
        d3.format(',')(d.footprint) + '</span>'
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

  let legend = d3.legendColor()
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
      return `${values[0]} - ${values[1]}`
    }
    )
    // .scale(worldmap.color)
    .scale(worldmap.scales.ratio)

  svg.select(".legendQuant")
    .call(legend)

  return worldmap
}

function highlight_country(path, highlight = true) {
  d3.select(path)
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
      ratio: +d.ratio
    }
  })

  let updated = d3.selectAll(".country-footprint").data()
  updated.forEach(d => {
    if (dataById[d.id] !== undefined) {
      d.footprint = dataById[d.id].footprint
      d.ratio = dataById[d.id].ratio
    } else {
      d.footprint = undefined
      d.ratio = undefined
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
  if (update === true) updateWorld(worldmap)
}