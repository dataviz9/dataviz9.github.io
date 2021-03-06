// Used interpolation technique from : https://bl.ocks.org/mbostock/1346410

function init_clock(settings) {

    let clock = settings

    clock.originX = clock.width / 2
    clock.originY = clock.height / 2
    clock.radius = Math.min(clock.originX, clock.originY) - settings.margin
    clock.strokeWidth = (clock.radius - clock.innerRadius) / (clock.yearEnd - clock.yearStart - 8)
    clock.scales = {
        day: d3.scaleLinear().domain([0, 365]).range([0, 2 * Math.PI]),
        month: d3.scaleLinear().domain([0, 11 + 59 / 60]).range([0, 2 * Math.PI]),
        year: d3.scaleLinear()
            .domain([clock.yearStart, clock.yearEnd])//d3.extent(data, d => +d.year))
            .range([clock.innerRadius, clock.radius])
            .nice()
    }

    clock.arcs = {
        month: d3.arc()
            .innerRadius(clock.radius + 5)
            .outerRadius(clock.radius + 25)
            .startAngle(d => clock.scales.month(d + 0.01))
            .endAngle(d => clock.scales.month(d + 0.975)),

        overshoot: d3.arc()
            .innerRadius(d => clock.scales.year(+d.year))
            .outerRadius(d => clock.scales.year(+d.year))
            .startAngle(d => clock.scales.day(Math.min(365, +d.overshoot_day)))
            .endAngle(clock.scales.day(365)),

        extra: d3.arc()
            .innerRadius(d => clock.scales.year(+d.year))
            .outerRadius(d => clock.scales.year(+d.year))
            .startAngle(clock.scales.day(0))
            .endAngle(d => clock.scales.day(Math.min(365, +d.overshoot_day - 365))),

        elapsed: d3.arc()
            .innerRadius(d => clock.scales.year(d.year))
            .outerRadius(d => clock.scales.year(d.year))
            .startAngle(clock.scales.day(0))
            .endAngle(d => clock.scales.day(Math.min(365, d.overshoot_day)))
    }

    clock.svg = d3.select('#clock')
    .attr("preserveAspectRatio", "xMinYMin meet")
    .attr("viewBox","0 0 500 500")
        // .attr("width", clock.width)
        // .attr("height", clock.height);


    clock.face = {
        main: clock.svg.append("circle")
            .attr("cx", clock.originX)
            .attr("cy", clock.originY)
            .attr("r", clock.radius)
            .attr("class", "clock-canvas"),
            // .style("filter", "url(#glow)"),
        line: clock.svg.append("line")
            .attr("x1", clock.originX)
            .attr("y1", 5)
            .attr("x2", clock.originX)
            .attr("y2", clock.height - 5)
            .attr("class", "vline"),
        inner: clock.svg.append("circle")
            .attr("cx", clock.originX)
            .attr("cy", clock.originY)
            .attr("r", clock.innerRadius - 1)
            .attr("class", "inner-circle")
            .style("filter", "url(#glow)")
            .raise(),
    }

    clock.dial = {
        ticks: clock.svg.selectAll(".month-tick")
            .data(d3.range(0, 12)).enter()
            .append("svg:path")
            .attr("d", d => clock.arcs.month(d))
            .attr("class", "month-tick")
            .attr("transform",
                "translate(" + clock.originX + "," + clock.originY + ")"),

        labels: clock.svg.selectAll(".month-label")
            .data(moment.months()).enter()
            .append("text")
            .attr("x", clock.originX)
            .attr("y", (clock.originY - clock.radius - 10))
            .text(d => d)
            .attr("class", "month-label")
            .attr("transform", (d, i) => {
                return "rotate(" + (clock.scales.month(i + 0.5) * 180 / Math.PI) + "," +
                    clock.originX + "," + clock.originY + ")"
            })
    }



    let yearAxis = d3.axisRight(clock.scales.year).ticks([5], "f")

    clock.axis = clock.svg.append("g")
        .attr("class", "year-axis")
        .attr("transform", "translate(" + clock.originX + "," + clock.originY + ")")
        .call(yearAxis)
        .raise()

    let init_overshoot = clock.years.map((v, i, _) => {
        return {
            year: +v,
            overshoot_day: 365
        }
    })

    clock.overshoots = clock.svg.selectAll(".arc")
        .data(init_overshoot, d => d.year).enter()
        .append("svg:path")
        .attr("d", d => clock.arcs.overshoot(d))
        .attr("class", "arc")
        .attr("data-prev", 365)
        .style("stroke-width", clock.strokeWidth)
        .attr("transform",
            "translate(" + clock.originX + "," + clock.originY + ")")
        .attr('pointer-events', 'visibleStroke')

    clock.face.inner.raise()
    clock.dateLabel = {
        dayMonth: clock.svg.append("text")
            .attr('x', clock.originX)
            .attr("y", clock.originY - 5)
            .attr("class", "date-label day"),
        year: clock.svg.append("text")
            .attr('x', clock.originX)
            .attr("y", clock.originY + 15)
            .attr("class", "date-label")
    }
    clock.current = { year: null }

    return clock
}

function set_date(clock) {
    return d => {
        let date = moment(d.year, 'YYYY').add(Math.min(d.overshoot_day, 364), "days")
        d.overshoot_day <= 365 ?
            clock.dateLabel.dayMonth.text(date.format("D MMM")) :
            clock.dateLabel.dayMonth.text("Year")
        clock.dateLabel.year.text(date.format("YYYY"))
        // .style("filter", "url(#glow)")
    }
}

function arcTween(arcFunction) {
    return function (d) {
        let prevDay = d3.select(this).attr("data-prev")
        let interp = d3.interpolate({ year: +d.year, overshoot_day: +prevDay }, d)
        return t => arcFunction(interp(t))
    }
}

function highlight_arc(hovered, klass, opacity) {
    d3.selectAll(klass)
        // .filter((d, i) => index !== i)
        .transition()
        .duration(50)
        .style("opacity", function () { return this === hovered ? 1: opacity })
        .style("filter", function () {
            return this === hovered ? "url(#glow)" : ""
        })
}

function extra_hover(clock) {
    return function (d, i) {
        let hovered = this
        highlight_arc(hovered, ".extra.arc:not(.current)", 0.25)
        set_date(clock)(d)
    }
}

function overshoot_hover(clock) {
    return function (d, i) {
        let hovered = this
        highlight_arc(hovered, ".overshoot.arc:not(.current)", 0.5)
        let elapsed = clock.svg.append("path")
            .attr("data-prev", 0)
            .datum(d)
            .attr("d", clock.arcs.elapsed({ year: d.year, overshoot_day: 0 }))
            .attr("id", "elapsed-arc")
            .style("stroke-width", clock.strokeWidth)
            .attr("transform",
                "translate(" + clock.originX + "," + clock.originY + ")")
            .style("filter", "url(#glow)")



        clock.axis.raise()
        // clock.face.inner.raise()

        elapsed
            .transition()
            // .ease(d3.easeBounce)
            .delay(80)
            .duration(300)
            .attrTween("d", arcTween(clock.arcs.elapsed))
        // .on("end", function () {
        //     console.log(this)
        //     d3.select(this).style("filter", "url(#glow)")
        // })
        set_date(clock)(d)
        // let date = moment(d.year, 'YYYY').add(d.overshoot_day, "days")
        // clock.dateLabel.dayMonth.text(date.format("D MMM"))
        // clock.dateLabel.year.text(date.format("YYYY"))
    }
}

function overshoot_out(clock) {
    return function () {
        d3.select("#elapsed-arc").remove();
        d3.selectAll(".arc")
            .transition()
            .duration(50)
            .style("opacity", function () { return d3.select(this).classed("overshoot") ? 1 : 0.7 })
        // .style("filter", "")
        set_date(clock)(clock.current)
    }
}

function update_current(clock) {
    return function (d) {
        let klass = d.overshoot_day < 365 ? "overshoot" : "extra"

        clock.current = d

        d3.selectAll(".arc")
            .classed("current", d => d.year === clock.current.year)
            .style("filter", function (d) {
                return d === clock.current ? "url(#glow)" : ""
            })

        d3.selectAll("." + klass)
            .style("opacity", function (d) {
                if (d === clock.current) {
                    return ""
                } else {
                    return klass === "overshoot" ? 0.5 : 0.25
                }
            })
        set_date(clock)(d)
    }
}

function update(clock, file, callback) {
    d3.select("#elapsed-arc").remove();
    d3.selectAll(".arc")
        .on("mouseover", null)
        .on("mouseout", null)

    d3.csv(file, data => {
        let years = new Set(data.map((v, i) => +v.year))
        let missingYears = clock.years.filter(y => !years.has(y))
        data.forEach((v, i, _) => {
            v.year = +v.year
            v.overshoot_day = +v.overshoot_day
        })

        let update = update_current(clock)
        if (clock.current.year === null) {
            let current = data.filter(d => d.year === Math.max(...years))[0]
            update(current)
        } else {
            let d = data.filter(d => d.year === clock.current.year)[0]
            let current = d === undefined ? { year: Math.max(...years) } : d
            update(current)
        }

        missingYears.forEach(
            (v, i, _) => {
                data.push({
                    year: v,
                    overshoot_day: 365
                })
            })

        d3.selectAll(".arc")
            .data(data, d => +d.year)
            .classed("overshoot", d => d.overshoot_day <= 365)
            .classed("extra", d => d.overshoot_day > 365)
            .classed("current", d => d.year === clock.current.year)
            .transition()
            .duration(500)
            // .attr("class", d => {
            //     let klass = (d.overshoot_day <= 365) ? "overshoot arc" : "extra arc"
            //     klass += d.year === clock.current.year ? " current" : ""
            //     return klass
            // })

            .style("opacity", "")
            .attrTween("d", function (d) {
                return (d.overshoot_day <= 365) ?
                    arcTween(clock.arcs.overshoot).bind(this)(d) :
                    arcTween(clock.arcs.extra).bind(this)(d)
            })
            .on("end", function () {
                d3.selectAll(".overshoot.arc")
                    .on("mouseover", overshoot_hover(clock))
                    .on("mouseout", overshoot_out(clock))//, ".overshoot.arc", 1))
                // .on("click", update_current(clock, 0.5))
                d3.selectAll(".extra.arc")
                    .on("mouseover", extra_hover(clock))
                    .on("mouseout", overshoot_out(clock))//, ".extra.arc", 0.7))
                // .on("click", update_current(clock, 0.25))
            })
            .attr("data-prev", d => d.overshoot_day)
        clock.axis.raise()
    });
}