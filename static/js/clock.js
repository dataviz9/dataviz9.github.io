let clock_cfg = {
    width: 600,
    height: 600,
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}

let pi = Math.PI

function init_clock(container) {

}

d3.csv("static/world.csv", data => {
    let angle = 360 / (data.length - 1);
    var svg = d3.select('svg')
        .attr("width", clock_cfg.width)
        .attr("height", clock_cfg.height);

    var originX = clock_cfg.width / 2;
    var originY = clock_cfg.height / 2;
    var ratio = 2;
    var circleRadius = 200

    var axisYear = svg.append("line")
        .attr("x1", 0)
        .attr("y1", originY)
        .attr("x2", clock_cfg.width)
        .attr("y2", originY)
        .attr("class", "axis-year")

    let circle = svg.append("circle")
        .attr("cx", originX)
        .attr("cy", originY)
        .attr("r", circleRadius)
        .attr("fill", "green")
        .attr("stroke", "black");

    console.log(d3.extent(data, d => +d.year))
    console.log(d3.max(data, d => +d.year))

    let yearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.year))
        .range([0, circleRadius])

    let monthScale = d3.scaleLinear()
        .domain([0, 11 + 59 / 60])
        .range([0, 2 * pi]);

    let dayScale = d3.scaleLinear()
        .domain([0, 365])
        .range([0, 2 * pi])

    let monthArc = d3.arc()
        .innerRadius(circleRadius - 5)
        .outerRadius(circleRadius + 5)
        .startAngle(d => {
            return monthScale(d) - 0.01;
        })
        .endAngle(d => {
            return monthScale(d);
        });

    let overshootArc = d3.arc()
        .innerRadius(d => {
            console.log(d.year);
            return yearScale(d.year)
        })
        .outerRadius(d => {
            return yearScale(d.year)
        })
        .startAngle(d => dayScale(d.overshoot_day))
        .endAngle(dayScale(365))

    svg.selectAll(".month-tick")
        .data(d3.range(0, 12)).enter()
        .append("svg:path")
        .attr("d", d => {
            return monthArc(d)
        })
        .attr("class", "month-tick")
        .attr("transform",
            "translate(" + clock_cfg.width / 2 + "," +
            clock_cfg.height / 2 + ")");

    svg.selectAll(".month-label")
        .data(clock_cfg.month).enter()
        .append("text")
        .attr("x", clock_cfg.width / 2)
        .attr("y", (clock_cfg.height / 2 - circleRadius - 10))
        .text(d => d)
        .attr("class", "month-label")
        .attr("transform", function (d, i) {
            return "rotate(" + (monthScale(i) * 180 / pi) + "," +
                originX + "," + originY + ")"
        })

    svg.selectAll(".overshoot-arc")
        .data(data).enter()
        .append("svg:path")
        .attr("d", d => {
            return overshootArc(d)
        })
        .attr("class", "overshoot-arc")
        .attr("transform",
            "translate(" + clock_cfg.width / 2 + "," +
            clock_cfg.height / 2 + ")");

    // svg.selectAll("circle")
    //     .data(data).enter()
    //     .append("circle")
    //     .attr("r", 3)
    //     .attr("cx", originX)
    //     .attr("cy", d => yearScale(d.year))
    //     .attr("fill", "red")
    //     .attr("transform", (d, i) => {
    //         return "rotate(" +
    //             dayScale(Math.min(d.overshoot_day, 365)) * 180 / pi + "," +
    //             originX + "," + originY + ")"
    //     });

    // for (var i = 0; i < 12; i++) {
    //     svg.append("circle")
    //         .attr("cx", originX)
    //         .attr("cy", originY)
    //         .attr("r", circleRadius / 12 * i)
    //         .attr("fill", "none")
    //         .attr("style", "stroke : black; stroke-width: 1; stroke-dasharray: 10, 5;");
    // }
});
