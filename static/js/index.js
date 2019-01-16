

let CLOCK = {
    width: 500,
    height: 500,
    innerRadius: 30,
    margin: 50,
    yearStart: 1960,
    yearEnd: 2015,
    years: Array.from({ length: 2016 - 1960 },
        (x, i) => i + 1960)
}

let clock = init_clock(CLOCK)



d3.queue()
    .defer(d3.json, 'static/footprint.json')
    .defer(d3.json, 'static/world_countries.json')
    // .defer(d3.csv, 'static/footprintByYear/2014.csv')
    .await(function (error, footprints, countries) {
        let linechart = initLineChart()
        let worldmap = initWorldmap(countries)
        worldmap.paths.on("click", function (d) {
            highlight_country(worldmap.highlighted, false)
            update(clock, "static/splitted_data/" + d.id + ".csv")
            worldmap.highlighted = this
            d3.select("#country-select").property("value", d.id)
            if (linechart.graphics[d.id] === undefined) {
                addLine(linechart, d.id)
                hoverCountryTrace(linechart, d.id)
            } else {
                removeLine(linechart, d.id)
                resetLines()
            }
        })
            .on('mouseover', function (d) {
                worldmap.tip.show(d)
                highlight_country(this, true)
                if (linechart.graphics[d.id] !== undefined)
                    hoverCountryTrace(linechart, d.id)


            })
            .on("mouseout", function (d) {
                worldmap.tip.hide(d)
                highlight_country(this, this === worldmap.highlighted)
                resetLines(linechart, d.id)
            })
        worldmap.canvas.on("dblclick", d => {
            highlight_country(worldmap.highlighted, false)
            worldmap.highlighted = undefined
            update(clock, "static/splitted_data/WORLD.csv")
            d3.select("#country-select").property("value", "WORLD")
            hoverCountryTrace(linechart, "WORLD")
        })


        // Listen toggle mode between "footprint" and "deficit"
        $("input[name='toggle-mode']").change(ev => {
            let mode = ev.target.value
            setSource(worldmap, mode)
            d3.select("#linechart-select").property("value", mode)
            setLineSource(linechart, mode)
        })
        setSource(worldmap, "footprint", false)

        let slider = initSlider(footprints, function (val) {
            let year = moment(val).year()
            setDate(linechart, year, 0)
            setYear(worldmap, year)
            let datum = clock.overshoots.select(d =>
                d.year === year ? this : null).datum()
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

        clock.overshoots.on('click', d => {
            slider.value(moment(d.year, "YYYY"))
        })

        d3.select("#linechart-select").on("change", function (d) {
            setLineSource(linechart, this.value)
        })
        d3.select("#clear-btn").on("click", function () {
            Object.keys(linechart.graphics)
                .forEach(function (k, i) {
                    if (k !== "WORLD")
                        removeLine(linechart, k)
                })
        })


        addLine(linechart, "WORLD")

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
                let country = this.value
                update(clock, "static/splitted_data/" + country + ".csv")
                highlight_country(worldmap.highlighted, false)
                worldmap.paths.filter(d => d.id === country)
                    .call(d => {
                        worldmap.highlighted = d.node()
                        highlight_country(worldmap.highlighted, true)
                    })
            })

            d3.select("#country-select").property("value", "WORLD")
        })
    })





