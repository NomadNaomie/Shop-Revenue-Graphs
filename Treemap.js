/*
*   A Tree diagram shows the total utilisation of a resource,
*   In this case, we are interested in what percentage of transactions 
*   Occur in each category of shop and a further breakdown of which shop in that category
*/

//Object for the bounds and dimensions of the SVG
const tree_margin = {top: 10, right: 20, bottom: 10, left: 10},
  tree_width = 700 - tree_margin.left - tree_margin.right,
  tree_height = 850 - tree_margin.top - tree_margin.bottom;
//Whether we are in the top level of not.
var treemode = false;
var treeMapColor = d3.schemeCategory10.concat(d3.schemeDark2);
var rootMapColor = d3.schemeDark2;
//Grabs the div with the id of treemap and creates a new SVG inside of it
const tree_svg = d3.select("#treemap")
.append("svg")
  .attr("width", tree_width + tree_margin.left + tree_margin.right)
  .attr("height", tree_height + tree_margin.top + tree_margin.bottom)
.append("g")
  .attr("transform",
        `translate(${tree_margin.left}, ${tree_margin.top})`);
// read json data
d3.json("/assets/data/treemap.json").then(function(data) {
  /*
  *   The data is in the format of cummulative total of transactions per category
  *   We create a hierarchy D3 object to hold the summation of each category, for now each category is singular so is its own sum in the data 
  *   
  */
  //We won't display the children until called.
  const topLevelLeaves = []
  for (const {children: _, ...o} of data.children) {
    topLevelLeaves.push(o)
  }
  const root = d3.hierarchy({children:topLevelLeaves}).sum(function(d){console.log(d.value);return d.value}) // Here the size of each leaf is given in the 'value' field in input data
  console.log(root)
  // Then d3.treemap computes the position of each element of the hierarchy
  let treemapObject = d3.treemap()
    .size([tree_width, tree_height])
    .padding(3)
    (root)

  //Using the d3.treemap object we can create the rectangles for the leaves
  //Color is currently blue determined by the remainder of the transaction / 200
  let leaves = tree_svg
    .selectAll("rect")
    .data(root.leaves())
    .join("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return d.y0; })
      .attr('width', function (d) { return d.x1 - d.x0 + 10; })
      .attr('height', function (d) { return d.y1 - d.y0 + 10; })
      .attr("category", function(d) {return d.data.name })
      .attr('id','tree-rect')
      .style("stroke", "black")
      .style("fill", function(d) {return rootMapColor[d.data.index]})


  //Adding labels to each leaf rect with the category and revenue
  tree_svg
    .selectAll("text")
    .data(root.leaves())
    .join("text")
      .attr("x", function(d){ return d.x0+5})
      .attr("y", function(d){ return d.y0+20})
      .text(function(d){ return d.data.name +  " - $" + d.data.value})
      .attr("font-size", "16px")
      .attr("fill", "white")
      

  //When clicked transform the leaves into their children
  tree_svg
    .data(root.leaves())
    .on("click", function(d){
      if(treemode){
        treemode=false;
        d3.treemap()
        .size([tree_width, tree_height])
        .padding(3)
        (root)
      let newLeaves = tree_svg
        .selectAll("rect")
        .data(root.leaves())
        .join("rect")
        .transition()
        .duration(1000)
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0 + 10; })
          .attr('height', function (d) { return d.y1 - d.y0 + 10; })
          .attr("category", function(d) {return d.data.name })
          .attr('id','tree-rect')
          .style("stroke", "black")
          .style("fill", function(d) { return rootMapColor[d.data.index]})

      tree_svg
        .selectAll("text")
        .data(root.leaves())
        .join("text")
        .transition()
        .duration(1000)
          .attr("x", function(d){ return d.x0+5})
          .attr("y", function(d){ return d.y0+20})
          .text(function(d){
              return d.data.name +  " - $" + d.data.value})
          .attr("font-size", "16px")
          .attr("fill", "white")
      }
      else{
        treemode=true;
      let filterkey = d.target.attributes.category.value;
      console.log(filterkey)
      newData = data.children.filter(function(d){return d.name == filterkey})
      let newRoot = d3.hierarchy({children:newData[0].children}).sum(function(d){console.log(d);return d.value + 10})
      let newTreemapObject = d3.treemap()
        .size([tree_width, tree_height])
        .padding(3)
        (newRoot)
      let newLeaves = tree_svg
        .selectAll("rect")
        .data(newRoot.leaves())
        .join("rect")
        .transition()
        .duration(1000)
          .attr('x', function (d) { return d.x0; })
          .attr('y', function (d) { return d.y0; })
          .attr('width', function (d) { return d.x1 - d.x0 + 10; })
          .attr('height', function (d) { return d.y1 - d.y0 + 10; })
          .attr("category", function(d) {return d.data.name })
          .attr('id','tree-rect')
          .style("stroke", "black")
          .style("fill", function(d) { return treeMapColor[d.data.index]})

      tree_svg
        .selectAll("text")
        .data(newRoot.leaves())
        .join("text")
        .transition()
        .duration(1000)
          .attr("x", function(d){ return d.x0+5})
          .attr("y", function(d){ return d.y0+20})
          .style("text-anchor", "start")
          .text(function(d){
              return d.data.name +  " - " + d.data.value
          })

          .attr("font-size", function(d){
            return "18px";
          })
          .attr("fill", "white")
      }
  })
})
