let CLOCK = {
    width: 600,
    height: 600,
    innerRadius: 30,
    margin: 50,
    month: [
        "January", "February", "March", "April", "May", "June", "July",
        "August", "September", "October", "November", "December"
    ],
    yearStart: 1960,
    yearEnd: 2015,
    years: Array.from({ length: 2016 - 1960 },
        (x, i) => i + 1960)
}


let clock = init_clock(CLOCK)

d3.csv("static/countries.csv", function (error, data) {
    var dropdown = d3.select("#country-select")
    data.sort((a, b) => a.country.localeCompare(b.country))
    data.forEach(function (v, i, _) {
        dropdown.append("option")
            .attr("value", v.code)
            .text(v.country);
    })
});

d3.select("select[name='country']")
    .on("change", function () {
        update(clock, "static/splitted_data/" + this.value + ".csv")
    })

update(clock, "static/splitted_data/" + d3.select("#country-select").property("value") + ".csv")

