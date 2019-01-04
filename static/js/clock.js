// Used interpolation technique from : https://bl.ocks.org/mbostock/1346410

let clock_cfg = {
    width: 600,
    height: 600,
    innerCircle: 20,
    month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
}

let pi = Math.PI

function init_clock(container) {

}

d3.csv("static/splitted_data/WORLD.csv", data => {
    let angle = 360 / (data.length - 1);
    var svg = d3.select('svg')
        .attr("width", clock_cfg.width)
        .attr("height", clock_cfg.height);

    var originX = clock_cfg.width / 2;
    var originY = clock_cfg.height / 2;
    var ratio = 2;
    var circleRadius = 250



    let circle = svg.append("circle")
        .attr("cx", originX)
        .attr("cy", originY)
        .attr("r", circleRadius)
        .attr("class", "clock-canvas")




    let yearScale = d3.scaleLinear()
        .domain(d3.extent(data, d => +d.year))
        .range([clock_cfg.innerCircle, circleRadius])
        .nice()

    let monthScale = d3.scaleLinear()
        .domain([0, 11 + 59 / 60])
        .range([0, 2 * pi]);

    let dayScale = d3.scaleLinear()
        .domain([0, 365])
        .range([0, 2 * pi])

    let monthArc = d3.arc()
        .innerRadius(circleRadius + 5)
        .outerRadius(circleRadius + 25)
        .startAngle(d => {
            return monthScale(d + 0.01);
        })
        .endAngle(d => {
            return monthScale(d + 0.975);
        });

    let overshootArc = d3.arc()
        .innerRadius(d => {
            return yearScale(d.year)
        })
        .outerRadius(d => {
            return yearScale(d.year)
        })
        .startAngle(d => dayScale(Math.min(365, d.overshoot_day)))
        .endAngle(dayScale(365))

    let elapsedArc = d3.arc()
        .innerRadius(d => {
            return yearScale(d.year)
        })
        .outerRadius(d => {
            return yearScale(d.year)
        })
        .startAngle(dayScale(0))
        .endAngle(d => dayScale(Math.min(365, d.overshoot_day)))

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
        .attr("transform", (d, i) => {
            return "rotate(" + (monthScale(i + 0.5) * 180 / pi) + "," +
                originX + "," + originY + ")"
        })

    function arcTween(newAngle) {
        return function (d) {
            let interp = d3.interpolate({ year: d.year, overshoot_day: 0 }, d)
            return t => {
                return elapsedArc(interp(t));
            };
        }
    }

    svg.selectAll(".overshoot-arc")
        .data(data).enter()
        .append("svg:path")
        .attr("d", d => {
            return overshootArc(d)
        })
        .attr("class", "overshoot-arc")
        .attr("transform",
            "translate(" + clock_cfg.width / 2 + "," +
            clock_cfg.height / 2 + ")")
        .attr('pointer-events', 'visibleStroke')
        .on("mouseover", (d, i) => {
            // console.log(this)
            // console.log(d3.select(this))
            // .classed("hover", true)

            let elapsed = svg.append("path")
                .datum(d)
                .attr("d", elapsedArc({ year: d.year, overshoot_day: 0 }))
                .attr("id", "elapsed-arc")
                .attr("transform",
                    "translate(" + clock_cfg.width / 2 + "," +
                    clock_cfg.height / 2 + ")")
            elapsed.transition()
                .ease(d3.easeBounce)
                .delay(80)
                .duration(500)
                .attrTween("d", arcTween(d));
            // svg.select("#elapsed-arc")
            //     .transition()
            //     .duration(200)
            //     .endAngle()
        })
        .on("mouseout", d => {
            // d3.select(this)
            //     .classed("hover", false)
            d3.select("#elapsed-arc").remove();
        })

    var axisYear = svg.append("line")
        .attr("x1", originX)
        .attr("y1", 5)
        .attr("x2", originX)
        .attr("y2", clock_cfg.height - 5)
        .attr("class", "vline")
    // let center = svg.append("line")
    //     .attr("x1", originX - 5)
    //     .attr("y1", originY)
    //     .attr("x2", originX + 5)
    //     .attr("y2", originY)
    //     .attr("class", "axis-year")




    let innerCircle = svg.append("circle")
        .attr("cx", originX)
        .attr("cy", originY)
        .attr("r", clock_cfg.innerCircle - 1)
        .attr("class", "inner-circle")

    let yearAxis = d3.axisRight(yearScale)
        .ticks([5], "f")

    svg.append("g")
        .attr("class", "year-axis")
        .attr("transform", "translate(" + originX + "," + originY + ")")
        .call(yearAxis);

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
