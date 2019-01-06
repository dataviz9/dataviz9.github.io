// Used interpolation technique from : https://bl.ocks.org/mbostock/1346410

let CLOCK = {
    width: 600,
    height: 600,
    innerCircle: 30,
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

d3.csv("static/countries.csv", function (error, data) {
    var dropdown = d3.select("#country-select")
    data.sort((a,b) => a.country.localeCompare(b.country))
    data.forEach(function (v, i, _) {
        dropdown.append("option")
            .attr("value", v.code)
            .text(v.country);
    })
});

let svg = d3.select('#clock')
    .attr("width", CLOCK.width)
    .attr("height", CLOCK.height);

let originX = CLOCK.width / 2,
    originY = CLOCK.height / 2,
    circleRadius = Math.min(originX, originY) - CLOCK.margin

let circle = svg.append("circle")
    .attr("cx", originX)
    .attr("cy", originY)
    .attr("r", circleRadius)
    .attr("class", "clock-canvas")

svg.append("line")
    .attr("x1", originX)
    .attr("y1", 5)
    .attr("x2", originX)
    .attr("y2", CLOCK.height - 5)
    .attr("class", "vline")

let innerCircle = svg.append("circle")
    .attr("cx", originX)
    .attr("cy", originY)
    .attr("r", CLOCK.innerCircle - 1)
    .attr("class", "inner-circle")

let dayMonthLabel = svg.append("text")
    .attr('x', originX)
    .attr("y", originY - 5)
    .attr("class", "date-label day")

let dateLabel = svg.append("text")
    .attr('x', originX)
    .attr("y", originY + 15)
    .attr("class", "date-label")

let monthScale = d3.scaleLinear()
    .domain([0, 11 + 59 / 60])
    .range([0, 2 * Math.PI]);

let dayScale = d3.scaleLinear()
    .domain([0, 365])
    .range([0, 2 * Math.PI])

let monthArc = d3.arc()
    .innerRadius(circleRadius + 5)
    .outerRadius(circleRadius + 25)
    .startAngle(d => monthScale(d + 0.01))
    .endAngle(d => monthScale(d + 0.975))

svg.selectAll(".month-tick")
    .data(d3.range(0, 12)).enter()
    .append("svg:path")
    .attr("d", d => monthArc(d))
    .attr("class", "month-tick")
    .attr("transform",
        "translate(" + CLOCK.width / 2 + "," + CLOCK.height / 2 + ")");

svg.selectAll(".month-label")
    .data(CLOCK.month).enter()
    .append("text")
    .attr("x", CLOCK.width / 2)
    .attr("y", (CLOCK.height / 2 - circleRadius - 10))
    .text(d => d)
    .attr("class", "month-label")
    .attr("transform", (d, i) => {
        return "rotate(" + (monthScale(i + 0.5) * 180 / Math.PI) + "," +
            originX + "," + originY + ")"
    })

let yearScale = d3.scaleLinear()
    .domain([CLOCK.yearStart, CLOCK.yearEnd])//d3.extent(data, d => +d.year))
    .range([CLOCK.innerCircle, circleRadius])
    .nice()

let yearAxis = d3.axisRight(yearScale)
    .ticks([5], "f")

let yearAxisElt = svg.append("g")
    .attr("class", "year-axis")
    .attr("transform", "translate(" + originX + "," + originY + ")")
    .call(yearAxis)
    .raise()

let overshootArc = d3.arc()
    .innerRadius(d => yearScale(+d.year))
    .outerRadius(d => yearScale(+d.year))
    .startAngle(d => dayScale(Math.min(365, +d.overshoot_day)))
    .endAngle(dayScale(365))

let elapsedArc = d3.arc()
    .innerRadius(d => yearScale(d.year))
    .outerRadius(d => yearScale(d.year))
    .startAngle(dayScale(0))
    .endAngle(d => dayScale(Math.min(365, d.overshoot_day)))

function arcTween(arcFunction) {
    return function (d) {
        // console.log(this)
        let prevDay = d3.select(this).attr("data-prev")
        let interp = d3.interpolate({ year: +d.year, overshoot_day: +prevDay }, d)
        return t => arcFunction(interp(t))
    }
}

console.log(CLOCK.years)

let init_overshoot = Array.map(CLOCK.years, (v, i, _) => {
    return {
        year: +v,
        overshoot_day: 365
    }
})

let overshoots = svg.selectAll(".overshoot-arc")
    .data(init_overshoot, d => d.year).enter()
    .append("svg:path")
    .attr("d", d => overshootArc(d))
    .attr("class", "overshoot-arc")
    .attr("data-prev", 365)
    .attr("transform",
        "translate(" + CLOCK.width / 2 + "," + CLOCK.height / 2 + ")")
    .attr('pointer-events', 'visibleStroke')

function highlight_arc(index) {
    d3.selectAll(".overshoot-arc")
        .filter((d, i) => index !== i)
        .transition()
        .duration(100)
        .style("opacity", 0.5)
}

function overshoot_hover(d, i) {
    highlight_arc(i)
    let elapsed = svg.append("path")
        .attr("data-prev", 0)
        .datum(d)
        .attr("d", elapsedArc({ year: d.year, overshoot_day: 0 }))
        .attr("id", "elapsed-arc")
        .attr("transform",
            "translate(" + CLOCK.width / 2 + "," + CLOCK.height / 2 + ")")

    yearAxisElt.raise()

    elapsed.transition()
        // .ease(d3.easeBounce)
        .delay(80)
        .duration(500)
        .attrTween("d", arcTween(elapsedArc))

    let date = moment(d.year, 'YYYY').add(d.overshoot_day, "days")
    dayMonthLabel.text(date.format("D MMM"))
    dateLabel.text(date.format("YYYY"))
}

function overshoot_out() {
    d3.select("#elapsed-arc").remove();

    d3.selectAll(".overshoot-arc")
        .transition()
        .duration(100)
        .style("opacity", 1)
    dayMonthLabel.text("")
    dateLabel.text("")
}

function setClockData(file) {
    d3.select("#elapsed-arc").remove();
    d3.selectAll(".overshoot-arc")
        .on("mouseover", null)
        .on("mouseout", null)
    d3.csv(file, data => {
        let years = new Set(Array.map(data, (v, i) => +v.year))
        let missingYears = CLOCK.years.filter(y => !years.has(y))
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

        d3.selectAll(".overshoot-arc")
            .data(data, d => +d.year)

        d3.selectAll(".overshoot-arc")
            .transition()
            .duration(500)
            .attrTween("d", arcTween(overshootArc))
            .on("end", function () {
                d3.selectAll(".overshoot-arc")
                    .on("mouseover", overshoot_hover)
                    .on("mouseout", overshoot_out)
            })
            .attr("data-prev", d => d.overshoot_day)
    });
}


d3.select("select[name='country']")
    .on("change", function () {
        setClockData("static/splitted_data/" + this.value + ".csv")
    })

setClockData("static/splitted_data/" + d3.select("#country-select").property("value") + ".csv")

