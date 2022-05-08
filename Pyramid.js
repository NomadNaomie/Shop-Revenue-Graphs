/*
* This pyramid graph visualizes the revenue between mediums, comparing the revenue generated from online transactions and in person transactions.
*/

//Configuring the height, width and margins of the graph
const PyramidDimensions = { "width": 800, "height": 900, "margin": 40 };
d3.json("/assets/data/pyramid.json").then(function (data) {
    //Data is loaded externally

    // Creating the axes, assiging their scales and ticks based on the loaded data and the dimensions of the graph
    yAxis = g => g
        .attr("transform", `translate(${xOnline(0)},0)`)
        .call(d3.axisRight(y).tickSizeOuter(0))
        .call(g => g.selectAll(".tick text").attr("fill", "white"))
        .selectAll("text")
        .text(i => data.filter(d => d.index === i)[0].name);
    xAxis = g => g
        .attr("transform", `translate(0,${PyramidDimensions.height - PyramidDimensions.margin})`)
        .call(g => g.append("g").call(d3.axisBottom(xOnline).ticks(width / 160, "s")))
        .call(g => g.append("g").call(d3.axisBottom(xInPerson).ticks(width / 160, "s")))
        .call(g => g.selectAll(".domain").remove())
        .call(g => g.selectAll(".tick:first-of-type").remove())
    y = d3.scaleBand()
        .domain(data.map(d => d.index))
        .rangeRound([PyramidDimensions.height - PyramidDimensions.margin, PyramidDimensions.margin])
        .padding(0.5)

    xOnline = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.amount)])
        .rangeRound([PyramidDimensions.width / 2, PyramidDimensions.margin])
    xInPerson = d3.scaleLinear()
        .domain(xOnline.domain())
        .rangeRound([PyramidDimensions.width / 2, PyramidDimensions.width - PyramidDimensions.margin])

    //Creating the SVG element and setting the dimensions
    const pyramid_svg = d3.select("#pyramid")
        .append("svg")
        .attr("width", PyramidDimensions.width)
        .attr("height", PyramidDimensions.height)

    //Creating a bar and assigning it to each side of the x axis depending on the medium
    pyramid_svg.append("g")
        .selectAll("rect")
        .data(data)
        .join("rect")
        .attr("fill", d => d3.schemeSet1[d.medium === "online" ? 1 : 0])
        .attr("x", d => d.medium === "online" ? xOnline(d.amount) : xInPerson(0))
        .attr("y", d => y(d.index))
        .attr("width", d => d.medium === "online" ? xOnline(0) - xOnline(d.amount) : xInPerson(d.amount) - xInPerson(0))
        .attr("height", y.bandwidth());


    //Adding the labels
    pyramid_svg.append("g")
        .attr("fill", "white")
        .selectAll("text")
        .data(data)
        .join("text")
        .attr("text-anchor", d => d.medium === "online" ? "start" : "end")
        .attr("x", d => d.medium === "online" ? xOnline(d.amount) + 4 : xInPerson(d.amount) - 4)
        .attr("y", d => y(d.index)+ y.bandwidth() / 2)
        .attr("dy", "0.75em")
    pyramid_svg.append("g")
        .call(xAxis);

    pyramid_svg.append("g")
        .call(yAxis);
}).catch(console.error);