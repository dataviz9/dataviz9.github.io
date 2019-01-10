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

  let projection = d3.geoMercator()
    .scale(125)
    .translate([worldmap.width / 2, worldmap.height / 1.5])

  worldmap.geopath = d3.geoPath().projection(projection)
  // Set tooltips
  let tip = d3.tip()
    .attr('class', 'd3-tip')
    .direction('s')
    .offset([15, 0])
    .html(function (d) {
      return "<strong>Country: </strong><span class='details'>" +
        d.properties.name + '<br></span>' +
        "<strong>Footprint: </strong><span class='details'>" +
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
  svg.call(tip)



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
    .on('mouseover', function (d) {
      tip.show(d)
      highlight_country(this, true)
    })
    .on('mouseout', function (d) {
      tip.hide(d)
      highlight_country(this, this === worldmap.highlighted)
      // if (this !== worldmap.highlighted) {
      //   d3.select(this)
      //     .transition()
      //     .duration(500)
      //     .style('opacity', 0.8)
      //     .style('stroke', 'white')
      //     .style('stroke-width', 0.3)
      // }
    })


  svg.append('path')
    .datum(topojson.mesh(mapJson.features, (a, b) => a.id !== b.id))
    .attr('class', 'names')
    .attr('d', worldmap.geopath)

  return worldmap
}

function highlight_country(path, highlight = true) {
  d3.select(path)
    .transition()
    .duration(300)
    // .style('opacity', d => highlight === true ? 1 : 1)
    .style('stroke', d => highlight === true ? "purple" : 'grey')
    .style('stroke-width', d => highlight === true ? 1.5 : 0.5)
    .style("filter", d => highlight===true ? "url(#glow)" : "")
}

function updateWorldData(data) {
  let footprintById = {}
  data.forEach(function (d) {
    footprintById[d.id] = +d.footprint
  })

  let updated = d3.selectAll(".country-footprint").data()
  updated.forEach(function (d) { d.footprint = footprintById[d.id] })
  return updated
}

function updateWorld(worldmap, year) {
  d3.csv('static/footprintByYear/' + year + '.csv', data => {
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
        return d.footprint === undefined ? 'grey' : worldmap.color(d.footprint)
      })
  })
}
