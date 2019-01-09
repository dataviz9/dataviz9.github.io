/* global d3 queue */

// Slider
function slide(error, json) {
  if (error) throw error

  let firstYear = parseInt(d3.min(Object.keys(json)))
  let lastYear = parseInt(d3.max(Object.keys(json)))
  let dataTime = d3.range(firstYear, lastYear).map(function (d) {
    return moment(d, "YYYY")
  })

  // let ticks = d3.range(0, nbOfYears + 1, 5).map(function (d) {
  //   return new Date(firstYear + d, 10, 3)
  // })

  var sliderScale = d3.scaleTime()
    .domain([moment(firstYear, 'YYYY').toDate(), moment(lastYear, 'YYYY').toDate()])
    .range([0, 750])
  // .nice()

  // sliderScale.ticks(d3.timeYear.every(1))

  // console.log(sliderScale(lastYear + 1))

  let sliderTime = d3
    .sliderHorizontal(sliderScale)
    // .min(d3.min(dataTime, d => {return d.year()}))
    // .max(d3.max(dataTime, d => {console.log(d); return d.year()}))
    .step(1000 * 60 * 60 * 24 * 366)
    // .step(1)
    // .width(sliderScale(lastYear + 1))
    .tickFormat(d3.timeFormat('%Y'))
    .fill("teal")
  // .tickValues(ticks)
  // .default(moment(1996, 'YYYY').toDate())
  // .on('onchange', val => {
  //   let year = val
  //   // updateWorld(error, year)
  //   // d3.select('p#value-time').text(d3.timeFormat('%Y')(val))
  //   // queue()
  //   // .defer(d3.tsv, 'static/footprintByYear/' + year + '.tsv')
  //   // .await(updateWorld(year))
  // })

  let gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr('width', 800)
    .attr('height', 100)
    .append('g')
    .attr('transform', 'translate(20,10)')

  gTime.call(sliderTime)
  return sliderTime

  // d3.select('p#value-time').text(d3.timeFormat('%Y')(sliderTime.value()))
}
