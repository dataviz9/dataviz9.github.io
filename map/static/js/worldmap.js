/* global d3  queue topojson */

let format = d3.format(',')

// Set tooltips
let tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .html(function (d) {
    return "<strong>Country: </strong><span class='details'>" + d.properties.name + '<br></span>' + "<strong>footprint: </strong><span class='details'>" + format(d.footprint) + '</span>'
  })

let margin = { top: 0, right: 0, bottom: 0, left: 0 }
let width = 960 - margin.left - margin.right
let height = 500 - margin.top - margin.bottom

let color = d3.scaleThreshold()
  .domain([10000, 100000, 500000, 1000000, 5000000, 10000000, 50000000, 100000000, 500000000, 1500000000])
  .range(['rgb(247,251,255)', 'rgb(222,235,247)', 'rgb(198,219,239)', 'rgb(158,202,225)', 'rgb(107,174,214)', 'rgb(66,146,198)', 'rgb(33,113,181)', 'rgb(8,81,156)', 'rgb(8,48,107)', 'rgb(3,19,43)'])

let svg = d3.select('body')
  .append('svg')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map')

let projection = d3.geoMercator()
  .scale(110)
  .translate([width / 2, height / 1.5])

let path = d3.geoPath().projection(projection)

svg.call(tip)

queue()
  .defer(d3.json, 'static/world_countries.json')
  .defer(d3.csv, 'static/footprintByYear/1992.csv')
  .await(ready)

function ready (error, data, footprint) {
  if (error) throw error

  let footprintById = {}
  footprint.forEach(function (d) {
    footprintById[d.id] = +d.footprint
  })
  data.features.forEach(function (d) { d.footprint = footprintById[d.id] })

  svg.append('g')
    .attr('class', 'countries')
    .selectAll('path')
    .data(data.features, d => d.id)
    .enter().append('path')
    .attr('d', path)
    .attr('class', 'kanar')
    .attr('fill', function (d) { return color(d.footprint) })
    .style('stroke', 'white')
    .style('stroke-width', 1.5)
    .style('opacity', 0.8)
    // tooltips
    .style('stroke', 'white')
    .style('stroke-width', 0.3)
    .on('mouseover', function (d) {
      tip.show(d)

      d3.select(this)
        .style('opacity', 1)
        .style('stroke', 'white')
        .style('stroke-width', 3)
    })
    .on('mouseout', function (d) {
      tip.hide(d)

      d3.select(this)
        .style('opacity', 0.8)
        .style('stroke', 'white')
        .style('stroke-width', 0.3)
    })

  svg.append('path')
    .datum(topojson.mesh(data.features, function (a, b) { return a.id !== b.id }))
    // .datum(topojson.mesh(data.features, function(a, b) { return a !== b; }))
    .attr('class', 'names')
    .attr('d', path)
}

function updateWorld (error, year) {
  if (error) throw error
  d3.csv('static/footprintByYear/' + year + '.csv', data => {
    let footprintById = {}
    data.forEach((v, i, _) => {
      footprintById[v.id] = +v.footprint
    })
    let updated = d3.selectAll('.kanar').data()
    // console.log(prev)

    updated.forEach((v, i, _) => {
      updated[i]['footprint'] = footprintById[updated[i]['id']]
    })

    d3.selectAll('.kanar')
      .data(updated, d => d.id)
      .attr('fill', d => { return color(d.footprint) })
  })
}
