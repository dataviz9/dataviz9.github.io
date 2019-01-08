// Used interpolation technique from : https://bl.ocks.org/mbostock/1346410

function init_clock(settings) {

    let clock = settings

    clock.originX = clock.width / 2
    clock.originY = clock.height / 2
    clock.radius = Math.min(clock.originX, clock.originY) - settings.margin

    clock.scales = {
        day: d3.scaleLinear()
            .domain([0, 365])
            .range([0, 2 * Math.PI]),
        month: d3.scaleLinear()
            .domain([0, 11 + 59 / 60])
            .range([0, 2 * Math.PI]),
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
        .attr("width", clock.width)
        .attr("height", clock.height);

    clock.face = {
        main: clock.svg.append("circle")
            .attr("cx", clock.originX)
            .attr("cy", clock.originY)
            .attr("r", clock.radius)
            .attr("class", "clock-canvas"),
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

    let yearAxis = d3.axisRight(clock.scales.year)
        .ticks([5], "f")

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

    clock.overshoots = clock.svg.selectAll("arc")
        .data(init_overshoot, d => d.year).enter()
        .append("svg:path")
        .attr("d", d => clock.arcs.overshoot(d))
        .attr("class", "arc")
        .attr("data-prev", 365)
        .attr("transform",
            "translate(" + clock.originX + "," + clock.originY + ")")
        .attr('pointer-events', 'visibleStroke')

    return clock
}

function arcTween(arcFunction) {
    return function (d) {
        // console.log(this)
        let prevDay = d3.select(this).attr("data-prev")
        let interp = d3.interpolate({ year: +d.year, overshoot_day: +prevDay }, d)
        return t => arcFunction(interp(t))
    }
}

function highlight_arc(index, klass, opacity) {
    d3.selectAll(klass)
        .filter((d, i) => index !== i)
        .transition()
        .duration(100)
        .style("opacity", opacity)
}

function extra_hover(clock) {
    return function (d, i) {
        highlight_arc(i, ".extra.arc", 0.25)
        let date = moment(d.year, 'YYYY').add(d.overshoot_day, "days")
        clock.dateLabel.dayMonth.text("Year")
        clock.dateLabel.year.text(date.format("YYYY"))
    }
}

function overshoot_hover(clock) {
    return function (d, i) {
        highlight_arc(i, ".overshoot.arc", 0.5)
        let elapsed = clock.svg.append("path")
            .attr("data-prev", 0)
            .datum(d)
            .attr("d", clock.arcs.elapsed({ year: d.year, overshoot_day: 0 }))
            .attr("id", "elapsed-arc")
            .attr("transform",
                "translate(" + clock.originX + "," + clock.originY + ")")

        clock.axis.raise()

        elapsed.transition()
            // .ease(d3.easeBounce)
            .delay(80)
            .duration(500)
            .attrTween("d", arcTween(clock.arcs.elapsed))

        let date = moment(d.year, 'YYYY').add(d.overshoot_day, "days")
        clock.dateLabel.dayMonth.text(date.format("D MMM"))
        clock.dateLabel.year.text(date.format("YYYY"))
    }
}

function overshoot_out(clock, klass) {
    return function () {
        d3.select("#elapsed-arc").remove();
        d3.selectAll(klass)
            .transition()
            .duration(100)
            .style("opacity", 1)
        clock.dateLabel.dayMonth.text("")
        clock.dateLabel.year.text("")
    }
}

function update(clock, file) {
    d3.select("#elapsed-arc").remove();
    d3.selectAll(".arc")
        .on("mouseover", null)
        .on("mouseout", null)

    d3.csv(file, data => {
        let years = new Set(Array.map(data, (v, i) => +v.year))
        let missingYears = clock.years.filter(y => !years.has(y))
        // console.log(missingYears)
        // console.log(data)
        missingYears.forEach(
            (v, i, _) => {
                data.push({
                    year: v,
                    overshoot_day: 365
                })
            })

        data.forEach((v, i, _) => {
            v.year = +v.year
            v.overshoot_day = +v.overshoot_day
        })

        d3.selectAll(".arc")
            .data(data, d => +d.year)

        d3.selectAll(".arc")

            .transition()
            .duration(500)
            .attr("class", d => {
                return (d.overshoot_day <= 365) ? "overshoot arc" : "extra arc"
            })
            .attrTween("d", function (d) {
                // console.log(this)
                return (d.overshoot_day <= 365) ?
                    arcTween(clock.arcs.overshoot).bind(this)(d) :
                    arcTween(clock.arcs.extra).bind(this)(d)
            })
            .on("end", function () {
                d3.selectAll(".overshoot.arc")
                    .on("mouseover", overshoot_hover(clock))
                    .on("mouseout", overshoot_out(clock, ".overshoot.arc"))
                d3.selectAll(".extra.arc")
                    .on("mouseover", extra_hover(clock))
                    .on("mouseout", overshoot_out(clock, ".extra.arc"))
            })
            .attr("data-prev", d => d.overshoot_day)
    });
}