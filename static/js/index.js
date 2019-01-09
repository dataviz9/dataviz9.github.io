

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
        })
        worldmap.canvas.on("dblclick", d => {
            console.log(d);
            update(clock, "static/splitted_data/WORLD.csv")
        })
        let slider = slide(footprints, function (val) {
            let year = moment(val).year()
            updateWorld(worldmap, year)
            let datum = clock.overshoots
                .select(d => d.year === year ? this : null).datum()
            update_current(clock)(datum)
            // let update = update_current(clock)
            // if (clock.current.year === null) {
            //     let current = data.filter(d => d.year === Math.max(...years))[0]
            //     update(current)
            // } else {
            //     let d = data.filter(d => d.year === clock.current.year)[0]
            //     let current = d === undefined ? { year: Math.max(...years) } : d
            //     update(current)
            // }
        })
        clock.overshoots.on('click', d => slider.value(moment(d.year, "YYYY")))
    })









