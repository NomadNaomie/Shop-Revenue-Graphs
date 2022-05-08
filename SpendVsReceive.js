/*
* This pyramid graph visualizes the in and out flow of money of an individual, how they spend vs. receive.
*/

const SpendPyramidDimensions = { "width": 800, "height": 900, "margin": 40 };
d3.json("/assets/data/spendvsreceive.json").then(function (data) {
    yAxis = g => g
        .attr("transform", `translate(${xM(0)},0)`)
        .call(d3.axisRight(y).tickSizeOuter(0))
        .call(g => g.selectAll(".tick text").attr("fill", "white"))
        .selectAll("text")
        .text(i => data.filter(d => d.index === i)[0].name);
    xAxis = g => g
        .attr("transform", `translate(0,${SpendPyramidDimensions.height - SpendPyramidDimensions.margin})`)
        .call(g => g.append("g").call(d3.axisBottom(xM).ticks(width / 160, "s")))
        .call(g => g.append("g").call(d3.axisBottom(xF).ticks(width / 160, "s")))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll(".tick:first-of-type").remove())
    y = d3.scaleBand()
        .domain(data.map(d => d.index))
        .rangeRound([SpendPyramidDimensions.height - SpendPyramidDimensions.margin, SpendPyramidDimensions.margin])
        .padding(0.5)
    xM = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.amount)])
        .rangeRound([SpendPyramidDimensions.width / 2, SpendPyramidDimensions.margin])
    xF = d3.scaleLinear()
        .domain(xM.domain())
        .rangeRound([SpendPyramidDimensions.width / 2, SpendPyramidDimensions.width - SpendPyramidDimensions.margin])


    const pyramid_svg = d3.select("#spendvsreceive")
        .append("svg")
        .attr("width", SpendPyramidDimensions.width)
        .attr("height", SpendPyramidDimensions.height)

    pyramid_svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("fill", d => d3.schemeSet1[d.medium === "spend" ? 1 : 0])
        .attr("x", d => d.medium === "spend" ? xM(d.amount) : xF(0))
        .attr("y", d => y(d.index))
        .attr("width", d => d.medium === "spend" ? xM(0) - xM(d.amount) : xF(d.amount) - xF(0))
        .attr("height", y.bandwidth());

    pyramid_svg.append("g")
        .attr("fill", "white")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("text-anchor", d => d.medium === "spend" ? "start" : "end")
        .attr("x", d => d.medium === "spend" ? xM(d.amount) + 4 : xF(d.amount) - 4)
        .attr("y", d => y(d.index)+ y.bandwidth() / 2)
        .attr("dy", "0.75em")
    pyramid_svg.append("g")
        .call(xAxis);

    pyramid_svg.append("g")
        .call(yAxis);
}).catch(console.error);