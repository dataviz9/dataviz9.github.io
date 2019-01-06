//var json = require('static/countires.json'); //with path
//let tData = d3.json('static/countires.json')
//let tData = JSON.parse('static/countires.json');
//console.log(tData);

//d3.json("static/countires.json", function(data) {
//    let countries = d3.values(data);
    //console.log(countries)
    
//    let dropdown = d3.select("#country-select")
//    console.log(dropdown)
//     dropdown.selectAll("option")
//      .data(data)
//      .enter()
//        .append("option")
//        .attr("value", function (d) { return d3.values(d); })
//        .text(function (d) { return d3.values(d); });
//});
d3.csv("static/countries.csv", function(error, data) {
    var dropdown = d3.select("#country-select")
      data.forEach( function(v, i, _) {
      dropdown.append("option")
        .attr("value", v.code)
        .text(v.country);
      })
  });
