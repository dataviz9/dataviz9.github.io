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
    dropdown.append("option")
        .attr("value", "WORLD")
        .text("World");
    data.sort((a, b) => a.country.localeCompare(b.country))
    data.forEach(function (v, i, _) {
        // fetch("static/splitted_data/" + v.code + ".csv",
        //     { method: 'HEAD', })
        //     .then(function (resp) {
        if (v.code !== "WORLD")
            dropdown.append("option")
                .attr("value", v.code)
                .text(v.country);
        // })
    })


    // console.log(dropdown.property("value"))
    update(clock, "static/splitted_data/WORLD.csv")
    dropdown.on("change", function () {
        update(clock, "static/splitted_data/" + this.value + ".csv")
    })

    d3.select("#country-select").property("value", "WORLD")
})





