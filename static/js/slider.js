// Slider
function slide(json, callback) {
  let firstYear = parseInt(d3.min(Object.keys(json)))
  let lastYear = parseInt(d3.max(Object.keys(json)))
  var sliderScale = d3.scaleTime()
    .domain([moment(firstYear, 'YYYY').toDate(), moment(lastYear, 'YYYY').toDate()])
    .range([0, 900])

  let sliderTime = d3
    .sliderHorizontal(sliderScale)
    .step(1000 * 60 * 60 * 24 * 366)
    .tickFormat(d3.timeFormat('%Y'))
    .fill("teal")
    .default(moment(lastYear, 'YYYY').toDate())
    .on('onchange', callback)

  let gTime = d3
    .select('div#slider-time')
    .append('svg')
    .attr("preserveAspectRatio", "xMinyMin meet")
    .attr("viewBox", "0 0 1000 200")
    .append('g')
    .attr('transform', 'translate(50,10)')

  gTime.call(sliderTime)

  callback(moment(lastYear, 'YYYY'))

  return sliderTime
}
