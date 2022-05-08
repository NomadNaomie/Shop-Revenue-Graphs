/*
*   A Chord diagram is a circular diagram in which the radii of the arcs are proportional to values.
*   It represents flows from nodes within a network, it is a directed graph
*   The adjacency matrix is created from a ledger, in the form of a table with each column and row representing a node
*   Now that every Individual has at least 1 transaction, we don't need to delete any
*   There is some driver code to cycle the ribbons, lower the opacity of the ribbons that aren't from a particular Individual for a second,
*   By themselves, Chord diagrams can be very confusion, its information overload and not user friendly
*   They are very handy if you highlight specific Individuals, showing sources of revenue flowing between a Individual and others, either in or out.
*   The primary use will be hovering over your favourite Individual to highlight their transactions, there is also a drop down so we don't need to hover.
*/

//Select the div with id chord, create an SVG element inside it
//TODO : extract the height, width, translation and margins to conform with the other diagrams.
const svg = d3.select("#chord")
    .append("svg")
    .attr("width", 800)
    .attr("height", 800)
    .append("g")
    .attr("transform", "translate(400,400)")

var clear_button = document.getElementById("clear-driver")
var active = true; //Unused for now, will control when to cycle the ribbon
var timer; //Timeout to restart the cycling after hovering
var inde = 0; //Index variable for the ribbons animation
var doCycle = true; //Controls whether the ribbons animate
var stall = false; //If dropdown is active.
//TODO : Fix the hover and dropdown triggering the timeout in fade funcs
function cycle_ribbon_driver(){
    /*
    *   Resets the variables for ribbon animation, 
    *   timeout is controlled by the fade functions
    */
    active = false;
    doCycle = true;    
    inde = 0;
}

//Adjancency matrix from the Main Data Table worksheet
const matrix = [
    [0,0,0,0,0]
    [0,0,0,0,0]
    [0,0,0,0,0]
    [0,0,0,0,0]
    [0,0,0,0,0]
];
//Names of Individuals, index matches the above matrix
var Individuals = [
    "Anna",
    "Muhammed",
    "Sira",
    "Joe",
    "John",
];

//Grabs the dropdown menu for the fading
var Individual_dropdown = document.getElementById("Individual-chord-dropdown");
//Adds each Individual to the dropdown menu
for (var h in Individuals) {
    var option = document.createElement("option");
    option.value = Individuals[h];
    option.innerHTML = Individuals[h];
    Individual_dropdown.appendChild(option);
}

var stop_button = document.getElementById("stop-anim");
stop_button.addEventListener("click", stop_animation);
function stop_animation() {
        stall = !stall;
        if (stall) {
            stop_button.innerHTML = "Play Animation";
            ribs.filter(function(d){return 1;}).transition()
            .style("opacity", 1);
        }
        else {
            stop_button.innerHTML = "Stop Animation";
            setTimeout(cycle_ribbon_driver, 4*1000);
        }
}

//There are A LOT of ribbons, so we need so so so many colours
//TODO : generate a random HSV where H,S are both 100
var colours = d3.schemePastel1.concat(d3.schemePastel1,d3.schemeSet1,d3.schemeSet2,d3.schemeSet3,d3.schemeAccent,d3.schemeDark2,d3.schemePaired,d3.schemePastel2,d3.schemeSet1,d3.schemeSet3,d3.schemePastel1,d3.schemeSet1,d3.schemeSet2,d3.schemeSet3,d3.schemeAccent,d3.schemeDark2,d3.schemePaired,d3.schemePastel2,d3.schemeSet1,d3.schemeSet3,d3.schemePastel1,d3.schemeSet1,d3.schemeSet2,d3.schemeSet3,d3.schemeAccent,d3.schemeDark2,d3.schemePaired,d3.schemePastel2,d3.schemeSet1,d3.schemeSet3);
    
//Create a directed chord object from the data,
const res = d3.chordDirected()
    .padAngle(0.1) // padding between entities (black arc)
    .sortChords(function(a,b) {return a>b;}) //Sorts the Z index of the chords
    .sortGroups(function(a,b) {return b.index>a.index;})
    //.sortSubgroups(function(a,b) {return b.index>a.index;}) //Sorts the order of the chords connecting to the outer arc
    (matrix)

//Add outer arcs of the circle
//Fade functions, fade every single ribbon not connected
//TODO : have radii in the width, height, margin object
svg
    .datum(res)
    .append("g")
    .selectAll("g")
    .data(d => d.groups)
    .join("g")
    .append("path")
    .style("fill", function(d, i) { return colours[i] })
    .style("stroke", "black")
    .attr('class', 'labels')
    .attr("d", d3.arc()
            .innerRadius(325)
            .outerRadius(375)
        )
    .on("mouseover", fade(0.1))
    .on("mouseout", fade(1));


//Add labels to the outer arcs
//Takes the median angle of the chord and rotates the text according to:
//180<x<0 -> rotate(90), otherwise rotate(270)
//Allows the text to be the right side up for any given angle
svg.append("g").selectAll("text")
    .data(res.groups)
    .enter()
    .append('text')
    .attr('transform', function(d) {
        d.angle = (d.endAngle + d.startAngle) / 2
        if (d.angle == NaN) { return "rotate(270)" }
        var finalRot = ""
        if ((d.angle * 180 / Math.PI - 90) < 0) { finalRot = "rotate(90)" } else if ((d.angle * 180 / Math.PI - 90) > 180) { finalRot = "rotate(90)" } else { finalRot = "rotate(270)" }
        return "rotate(" + (d.angle * 180 / Math.PI - 90) + ")" +
            "translate(" + (375 + 15) + ")" +
            finalRot
    })
    .attr('dy', '.2em')
    .attr('text-anchor', 'middle')
    .attr('class', 'group-label')
    .style("fill", function(d, i) { return "#fff" })
    .text(function(d) { return Individuals[d.index] })

//Ribbon with direction pointing\
//Radius is the inner radius of the outer arc
var rib = d3.ribbonArrow()
    .radius(325)

//Add ribbons to the SVG
//fades every other ribbon not being hovered over, even the connected ones
var ribs = svg
    .datum(res)
    .append("g")
    .attr("class", "ribbons")
    .selectAll("path")
    .data(d => d)
    .join("path")
    .attr("d", rib)
    .attr("class", "ribbons")
    .style("fill", function(d, i) { return colours[i] })
    .style("stroke", "black").on("mouseover", fade_single(0.1))
    .on("mouseout", fade_single(1));


setInterval(function(){ 
    /*
    *   This function cycles the ribbons, fading other ribbons and keeping one Individual active
    *   Ideally, every 1.5s the next Individual is faded in
    *   This should NOT run while the user is hovering over a chord or arc, or for roughly 15 seconds after
    *   This should NOT run while a dropdown item is selected.
    */
    if (doCycle===true && stall===false){
        ribs.filter(function(d){return 1;}).transition()
        .style("opacity", 0.95);
        ribs.filter(function(d){return d.target.index !=inde && d.source.index != inde}).transition()
        .style("opacity", 0.1); 
        inde++;
        if (inde>=25){inde=0}}else{return;}
}, 1550);
Individual_dropdown.addEventListener("change", function() {
    /*
    * This function should fade other Individuals permanently until cleared.   
    */
   if (!stall){stop_animation();}
    ribs.filter(function(d){return 1;}).transition()
    .style("opacity", 0.95);
    doCycle = false;
    var Individual = Individual_dropdown.value;
    if (Individual==""){ribs.filter(function(d){return 1;}).transition()
    .style("opacity", 0.95);return;}
    ribs.filter(function(d){return d.target.index != Individuals.indexOf(Individual) && d.source.index!=Individuals.indexOf(Individual);}).transition().style("opacity", 0.1);
});
clear_button.addEventListener("click", function() {
    if (!stall){
        stop_animation();
    }
    Individual_dropdown.value = "Select Individual";
    ribs.filter(function(d){return 1;}).transition()
    .style("opacity", 1);
    Individual_dropdown.dispatchEvent(new Event("change"));
});
function fade(opacity) {
    /*
    *   If the ribbon is not connected to the target of the hovered ribbon, fade it
    */
    return function(d, i) {
        clearTimeout(timer); //Resets timer cooldown
        doCycle=false;
        svg.selectAll("g path").filter(function(d){return 1;}).transition().style("opacity", 0.95);
        timer=setTimeout((cycle_ribbon_driver),4*1000);
        ribs
            .filter(function(d) {

                return d.source.index != i.index && d.target.index != i.index;
            })
            .transition()
            .style("opacity", opacity);
    };
}

function fade_single(opacity) {
    /*
    *   Fade every ribbon that is not the hovered ribbon or connected arcs.
    *   Also, add a label of the total sum of transactions
    */
    return function() {
        clearTimeout(timer);
        doCycle=false;
        timer=setTimeout((cycle_ribbon_driver),4*1000);
        svg.selectAll("g path").filter(function(d){return 1;}).transition().style("opacity", 0.95);
        var me = this;
        svg.selectAll("g path")
            .filter(function(d, i) {
                return this != me && this.classList[0] != "labels"
            }).transition()
            .style("opacity", opacity)
        svg.selectAll("g path")
            .filter(function(d) {
                return this != me;
            }).append("svg:title")
            .text(function(d) {
                if (d['source'] != null) {
                    return Individuals[d.source.index] + "["+d.source.index+"]"+" paid $" + d.source.value + " to "+ Individuals[d.target.index]+ "["+d.target.index+"]";
                }
            })
    };
}