/* global d3  queue topojson */

let format = d3.format(',')

// Set tooltips
let tip = d3.tip()
  .attr('class', 'd3-tip')
  .direction('s')
  .offset([15, 0])
  .html(function (d) {
    return "<strong>Country: </strong><span class='details'>" +
      d.properties.name + '<br></span>' +
      "<strong>Footprint: </strong><span class='details'>" +
      format(d.footprint) + '</span>'
  })

let margin = { top: 0, right: 0, bottom: 0, left: 0 }
let width = 800 - margin.left - margin.right
let height = 500 - margin.top - margin.bottom

let color = d3.scaleLinear()
  .domain(0, 16)
  .range(['#00ff00', '#ff0200'])

// scaleThreshold()
//   .domain([0.5, 1, 2, 3, 5, 7, 8, 10, 12, 14])
//   .range(['#00ff00', '#27ff01', '#73ff01', '#c0ff02', '#eef302', '#ffd301', '#ffa801', '#ff5306', '#ff270a', '#ff0200'])

let svg = d3.select('#worldmap')
  .attr('width', width)
  .attr('height', height)
  .append('g')
  .attr('class', 'map')

let projection = d3.geoMercator()
  .scale(125)
  .translate([width / 2, height / 1.5])

let path = d3.geoPath().projection(projection)

svg.call(tip)



function ready(slider) {
  return function (error, data, footprint) {
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
      .attr('class', 'country-footprint')
      .attr('fill', function (d) {
        if (d.footprint === undefined) {
          return 'grey'
        } else {
          return color(d.footprint)
        }
      })
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
}

function updateWorld(error, year) {
  if (error) throw error
  d3.csv('static/footprintByYear/' + year + '.csv', data => {
    let footprintById = {}
    data.forEach((v, i, _) => {
      footprintById[v.id] = +v.footprint
    })
    let updated = d3.selectAll('.country-footprint').data()

    updated.forEach((v, i, _) => {
      updated[i]['footprint'] = footprintById[updated[i]['id']]
    })

    d3.selectAll('.country-footprint')
      .data(updated, d => d.id)
      .attr('fill', function (d) {
        if (d.footprint === undefined) {
          return 'grey'
        } else {
          return color(d.footprint)
        }
      })
  })
}
