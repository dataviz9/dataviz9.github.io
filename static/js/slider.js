// Slider
function initSlider(json, callback) {
  let firstYear = parseInt(d3.min(Object.keys(json)))
  let lastYear = parseInt(d3.max(Object.keys(json)))
  var sliderScale = d3.scaleTime()
    .domain([moment(firstYear, 'YYYY').toDate(), moment(lastYear, 'YYYY').toDate()])
    .range([0, 720])

  let sliderTime = d3
    .sliderTop(sliderScale)
    .step(1000 * 60 * 60 * 24 * 366)
    .tickFormat(d3.timeFormat('%Y'))
    .fill("teal")
    .default(moment(lastYear, 'YYYY').toDate())
    .on('onchange', callback)

  let sliderElt = d3
    .select('#slider-time')
    // .append('svg')
    // .attr("presesssssssssssssssssssx", "0 0 500 100")
    // .append('g')
    .attr('transform', 'translate(30,40)')
    .call(sliderTime)

  callback(moment(lastYear, 'YYYY'))

  return sliderTime
}
