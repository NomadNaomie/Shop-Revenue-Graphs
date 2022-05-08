/*
*   JS for the Sankey diagram
*   This is not a traditional Sankey, as they have mid sections
*   This diagram was created to show the flow of money between individuals, regardless of their shops.
*   and not how they are used in between
*/

var graph;
var link;
var SankeyMarigns = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 1400 - SankeyMarigns.left - SankeyMarigns.right,
    height = 2500 - SankeyMarigns.top - SankeyMarigns.bottom;

var formatNumber = d3.format(",.0f"), // zero decimal places
    format = function (d) { return formatNumber(d); },
    color = d3.scaleOrdinal(d3.schemeCategory10);

//Grabs the div with Sankey ID and creates an SVG in it, setting height/width 
var sankey_svg = d3.select("#sankey").append("svg")
    .attr("width", width + SankeyMarigns.left + SankeyMarigns.right)
    .attr("height", height + SankeyMarigns.top + SankeyMarigns.bottom)
    .append("g")
    .attr("transform",
        "translate(" + SankeyMarigns.left + "," + SankeyMarigns.top + ")");

//Creates the Sankey diagram d3 object
var sankey = d3.sankey()
    .nodeWidth(36)
    .nodePadding(40)
    .size([width, height]);

//Creates the ribbons d3 links
var path = sankey.links();

//Grabs data from the data folder in assets, 
//Require express to have /assets static set
d3.json("/assets/data/sankey.json").then(function (sankeydata) {
    /*
    *   Sankey data is a JSON of nodes (2 per individual, payer and payee)
    *   and uncapped number of links
    *   width of links will be equal to either 1 or the amount of money over 4 unless its greater than 60 px 
    *   Allows dragging of the rectangles and therefore ribbons
    *   
    */
    graph = sankey(sankeydata);
    link = sankey_svg.append("g").selectAll(".link")
        .data(graph.links)
        .enter().append("path")
        .attr("class", "link")
        .attr("d", d3.sankeyLinkHorizontal())
        .attr("stroke-width", function (d) { return Math.max(1, d.value < 240 ? d.value / 4 : 60) })
    //Adding the hover text to each ribbon
    link.append("title")
        .text(function (d) {
            return d.source.name + " → " +
                d.target.name + "\n" + format(d.value);
        });

    //Adding the nodes with dragging 
    var node = sankey_svg.append("g").selectAll(".node")
        .data(graph.nodes)
        .enter().append("g")
        .attr("class", "node").call(d3.drag()
            .subject(d => d)
            .on('start', function () { this.parentNode.appendChild(this); })
            .on('drag', dragmove));

    //Edge bars for each node should encompass all ribbons
    //If there are leaks, height needs to be increased
    //Color is the D3 scheme 10 and uses built in darker function for stroke
    node.append("rect")
        .attr("height", function (d) { return d.y1-d.y0; })
        .attr("width", sankey.nodeWidth())
        .style("fill", function (d) { return d.color = color(d.name.replace(/ .*/, "")); })
        .style("stroke", function (d) { return d3.rgb(d.color).darker(2); })
        .attr("transform", function (d) {
            return "translate(" + d.x0 + "," + (d.y0) + ")";
        });

    //Attaching individual names to their respective nodes
    node.append("text")
        .attr("x", function (d) { return d.x0 - SankeyMarigns.top / 2; })
        .attr("y", function (d) { return (d.y1 + d.y0) / 2; })
        .attr("dy", "0.35em")
        .attr("text-anchor", "end")
        .style("fill","white")
        .text(function (d) { return d.name; })
        .filter(function (d) { return d.x0 < width / 2; })
        .attr("x", function (d) { return d.x1 + SankeyMarigns.top / 2; })
        .attr("text-anchor", "start");

});
//Sentinel value for Y to revert to in event of a negative Y value or one exceeding the height

function dragmove(evt, d) {
    /*
    *   Updates the Y value of the node based on the mouse position
    *   X position is locked, unlike most Sankey diagrams
    *   if the box would exceed the height or < 0, it is set to the last valid Y value
    *   
    */
    var last_valid_y = 0;
    var rectY = d3.select(this).select("rect").attr("height");
    d.y0 = d.y0 + evt.dy;
    d.x1 = d.x1 + 0;
    d.x0 = d.x0 + 0;
    var yTranslate = (d.y0-d.y1)+parseInt(rectY);
    if (d.y1+yTranslate > height || d.y0 < 0) {
        yTranslate = last_valid_y;
    }else{
        link.attr('d', d3.sankeyLinkHorizontal());
        last_valid_y = yTranslate;
    }
    var xTranslate = 0;
    d3.select(this).attr('transform', "translate(" + (xTranslate) + "," + (yTranslate) + ")");
    sankey.update(graph);
}