/*
*   This bar chart shows the culmmative sales profit of an individual over time.
*   
*/

//Standard Dimension and Margin setup
var BarChartRaceMargin = { top: 10, right: 10, bottom: 10, left: 75 },
width = 800 - BarChartRaceMargin.left - BarChartRaceMargin.right,
height = 600 - BarChartRaceMargin.top - BarChartRaceMargin.bottom;


//Targetting the div, adding SVG element.
var racing_svg = d3.select("#racing-bar")
      .append("svg")
      .attr("width", width + BarChartRaceMargin.left + BarChartRaceMargin.right)
      .attr("height", height + BarChartRaceMargin.top + BarChartRaceMargin.bottom)
      .append("g")
      .attr("transform", `translate(${BarChartRaceMargin.left}, ${BarChartRaceMargin.top})`);


//Little time clock to show the Month-Year (%B-%Y) of the data, mid bottom
var time_frame = document.createElement("div");
time_frame.setAttribute("id", "bar-time-frame");
var parent_frame = document.getElementById("racing-bar");
parent_frame.appendChild(time_frame);

//Load the data in the form of {Month-Year:[Individual,CumulativeSum]..}
d3.json("/assets/data/racing_bars.json").then(function(bar_data){
  /*
  *   Post loading of the data, we need to first split it by Month-Year, take the first Month-Year, display it 
  *   and then cycle onwards until it reaches the end and restarts from the beginning. 
  */
  //Grabbing Month-years, setting data to be first one
  let keys = Object.keys(bar_data);
  let data = bar_data[keys[0]];
  //setting the X axis
  const x = d3.scaleLinear()
  .domain([0, 1200]) //This needs to be increased porportional to the max value of the data
  .range([ 0, width]);

//Tick labels of the names
racing_svg.append("g")
  .attr("transform", `translate(0, ${height})`)
  .selectAll("text")
    .attr("transform", "translate(-10,0)rotate(-45)")
    .attr("text-anchor", "end")
    .text(function(d) { return d.Individual; })
    .classed("bar-label", true)
    .style("opacity",1);

//setting the Y axis
const y = d3.scaleBand()
  .range([ 0, height ])
  .domain(data.map(d => d.Individual))
  .padding(.1);
racing_svg.append("g")
  .call(d3.axisLeft(y))

//Adding the bars, given the cummulative sales profit in given data set
racing_svg.selectAll("myRect")
  .data(data)
  .join("rect")
  .attr("x", x(0) )
  .attr("y", d => y(d.Individual) )
  .attr("width", d => x(d.Total))
  .attr("height", y.bandwidth())
  .attr("fill", "#69b3a2")

//Value labels for the bars. 
racing_svg.append("g")
        .selectAll("text").data(data)
        .enter().append("text")
        .attr("transform", d => `translate(${x(d.Total)}, ${y(d.Individual)+15})`) //Should conform to update()
        .style("text-anchor", "start")
        .text(function(d) { return d.Total; })
        .style("fill", "#ffffff")
        .classed("bar-value", true)
        .style("opacity",1);
  //Stepping the data forward to the next month-year or restarting from the beginning
  setInterval(function(){
    if (keys.length == 0){ //If we have reached the end of the data, restart from the beginning
      keys = Object.keys(bar_data);
    }
    let data = bar_data[keys[0]]; //Grabbing the first month-year in the remaining keys
    update(data);
    time_frame.innerHTML = `End of ${keys[0]}`; //Updating the time frame text to indicate which End of month-year we are on
    keys.shift(); //Removing the used month-year from the keys
  }, 4500); //2500 default, subject to change
  function update(data) {
    /*
    *  U grabs the bars, conforming them to the next data set passed from the interval function
    *  T is the value labels for the bars, same as above
    */
    var u = racing_svg.selectAll("rect")
      .data(data)
      u
      .enter()
      .append("rect")
      .merge(u)
      .transition()
      .duration(600)
      .attr("x", x(0) )
      .attr("y", d => y(d.Individual) )
      .attr("width", d => x(d.Total))
      .attr("height", y.bandwidth())
      .attr("fill", "#69b3a2")
    

    //very hacky solution to duplicate labels, will need to come back to this
    //Right now it targets current labels, and removes them, then adds the new ones
    //It would look better if the labels transitioned into the new location and value
    var t = racing_svg.selectAll("bar-value").data(data)
    while(document.getElementsByClassName("bar-value").length > 0){
      document.getElementsByClassName("bar-value")[0].remove();
    }
    t.enter()
    .append("text")
    .classed("bar-value", true)
    .merge(t)
    .transition()
    .duration(600).attr("transform", d => `translate(${x(d.Total)}, ${y(d.Individual)+15})`) //Should conform to Value labels for bars above
    .style("text-anchor", "start")
    .text(function(d) { return d.Total; })
    .style("fill", "#ffffff").style("opacity",1);
  }
});