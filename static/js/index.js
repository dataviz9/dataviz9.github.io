

let CLOCK = {
    width: 500,
    height: 500,
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

let slider = d3.queue()
    .defer(d3.json, 'static/footprint.json')
    .defer(d3.json, 'static/world_countries.json')
    // .defer(d3.csv, 'static/footprintByYear/2014.csv')
    .await(function (error, footprints, countries) {
        let worldmap = initWorldmap(countries)
        worldmap.paths.on("click", function (d) {
            highlight_country(worldmap.highlighted, false)
            update(clock, "static/splitted_data/" + d.id + ".csv")
            worldmap.highlighted = this
            d3.select("#country-select").property("value", d.id)
        })
        worldmap.canvas.on("dblclick", d => {
            highlight_country(worldmap.highlighted, false)
            worldmap.highlighted = undefined
            update(clock, "static/splitted_data/WORLD.csv")
            d3.select("#country-select").property("value", "WORLD")
        })
        let slider = slide(footprints, function (val) {
            let year = moment(val).year()
            updateWorld(worldmap, year)
            let datum = clock.overshoots
                .select(d => d.year === year ? this : null).datum()
            update_current(clock)(datum)
        })
        slider.on("end", function () {
            d3.selectAll(".arc")
                .transition()
                .delay(80)
                .duration(500)
                .style("opacity", function (d) {
                    if (d === clock.current) {
                        return ''
                    } else {
                        return d3.select(this).classed("overshoot") ? 1 : 0.7
                    }
                })
        })
        clock.overshoots.on('click', d => slider.value(moment(d.year, "YYYY")))
    })









