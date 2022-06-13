//Ref source js Australian map: https://gist.githubusercontent.com/GerardoFurtado/02aa65e5522104cb692e/raw/8108fbd4103a827e67444381ff594f7df8450411/aust.json

/*---------------------- Global variable ----------------*/


	//set width, height for cover
var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
  h =   Math.max(document.documentElement.clientHeight, window.innerHeight || 0) *   0.6;
  

var pie_w = h / 2; //set width and height for pie chart
var pie_h = pie_w; //set width and height for pie chart
var year; //current selected year by user
var vis1_array = []; //array to store data for map chrolepath - vis 1
var pie_dataset = [];  //array to store data for pie chart - vis 1
var pie_color = d3.scaleOrdinal(d3.schemeCategory10); //d3 native scheme - color range for pie color

var color_range = [
  '#feebe2', //grey
  '#fbb4b9',
  '#f768a1',
  '#c51b8a',
  '#7a0177',
]; //color range for legends map chrolepath

var color = d3.scaleQuantize().range(color_range); //set scale for color - vis 1
  //Define quantize scale to sort data values into saturation of color

var svg; //svg for vis 1
/*---------------------- Global variable ----------------*/
window.onload = init;
function init() {
  vis2_execution(); //execute vis 2
  vis3_execution(); //execute vis 3
  
  svg = d3 //set svg for vis 1
    .select('#chart') //append p #chart
    .append('svg') // append the svg
    .style('cursor', 'move') // zoom feature
    .style('color', 'grey');
    
  svg
    .attr('viewBox', '5 1 ' + w + ' ' + h) //zoom feature
    .attr('preserveAspectRatio', 'xMinYMin');

  //.attr("width", w)
  //.attr("height", h)
  //.attr("fill","grey"); //the area which is not the file will be colored the default color - grey

  var zoom = d3.zoom().on('zoom', function() { //set up zoom feature
    var transform = d3.zoomTransform(this); //transform 
    map.attr('transform', transform);
  }); //zoom feature
  svg.call(zoom); //trigger zoom

  var map = svg.append('g') // append g
  							.attr('class', 'map'); //set class for map


/* --------------Legends for Visualisation 1 ---------------*/
 
 //Create rectangle box to store legends
  svg
    .append('rect') //create rect
    .attr('x', (3 * w) / 4 - 10) //set x for rect
    .attr('y', 42) //set y for rect
    .attr('height', color_range.length * 18) //set height for rect
    .attr('width', 7 * 32) //set width for rect
    .style('fill', 'none') //no color for box
    .style('stroke', 'black'); //set stroke color to black

  var size = 20;
  
   //Create small coloured rectangles for legends
  svg
    .selectAll('chart1_labels') //create rects
    .data(color_range) //color range
    .enter() //for each
    .append('rect') //create rectange
    .attr('x', (d, i) => (3 * w) / 4 + 40 * i) //x  for each rect
    .attr('y', 55) //y  for each rect
    .attr('width', 40) //width for each rect
    .attr('height', 15) //height for each rect
    .attr('stroke', 'black') //set stroke's color to black
    .style('fill', (d, i) => color_range[i]); // fill color in color range for each rect

  var chart1_legends = [0, 1, 2, 3, 4, 5]; //6 rectangles -> 6 elements

  svg
    .selectAll('chart1_labels') //create labels for each rect
    .data(chart1_legends) //choose data -> 6 elements -> loop 6 times
    .enter() //create element
    .append('text') //create text
    .attr('x', d => (3 * w) / 4 + 36 * d - 3) //x for text
    .attr('y', 90) //x for text
    .text(d => 340 * d) //content of text 
    .style('font-size', '15px');//font-size


  svg
    .append('text') //create LEGENDS
    .attr('x', (3 * w) / 4 - 10) //x for legends
    .attr('y', 22) //y for legends
    .text('Legends') //text: LEGENDS
    .style('font-size', '20px') // font size
    .attr('alignment-baseline', 'middle') // align for text
    .style('font-weight', 1000); //bold

  svg
    .append('text') //create a text
    .attr('x', (3 * w) / 4 + 80) //set x
    .attr('y', 115) //set y
    .text('Unit: Terawatt hours') //content of text
    .style('font-size', '15px'); //text size

/* --------------Legends for Visualisation 1 ---------------*/
  executeMap(map); //run Visualisation 1
  filterYear(map); //run filter year for vis 1
}

//------------------------Visualisation 1-----------------------*/
function executeMap(map) {
  //Define path generator
  var projection = d3
    .geoMercator() // for geoPath
    //can use different projections --> standard Mercator
    //default view is the whole world
    .center([132, -28]) //center australia
    .translate([w / 2, h / 2]) //translate the map
    .scale(600); //scale the view

  var path = d3
    .geoPath() //when using this, we need to specify a project
    .projection(projection);
  //Load in agriculture data
  year = 10; //2009
  d3.csv('data/Map_V4.csv').then(function(data) {
    //Set input domain for color scale
    for (let i = 0; i < 9; i++) {
    //load data from csv file into the array
      vis1_array.push(parseFloat(d3.entries(data[year])[1 + i].value));
    }

    color.domain([ //create color range
      0, 1700
    ]);
    //Load in GeoJSON data
    d3.json(
      'https://gist.githubusercontent.com/GerardoFurtado/02aa65e5522104cb692e/raw/8108fbd4103a827e67444381ff594f7df8450411/aust.json'
    ).then(function(json) {
      //load file json

      map
        .selectAll('path') //bind data to the path
        .data(json.features) //create one path per GeoJSON feature + based on json.features
        .enter() //add path
        .append('path') //append path
        .attr('d', path) //set path to d
        .attr('stroke', 'white') // set color for border of each state
        .attr('id', function(d, i) { //set id for each state
          return 'path' + (i + 1); // d.properties.STATE_NAME;
        })
        .style('font-weight', 600) //bold
        .style('fill', function(d, i) {
          return color(vis1_array[i]);//fill color for each state correspondding to its value
        })
        .on('mouseover', function(d, i) { // when the mouse over
          
          // change stroke color for the state hovered
          d3.select(this) //choose this state
            .attr('stroke', 'green') //change its stroke to green
            .attr('stroke-width', '1px') //set width for the stroke
            .raise(); //raise the stroke

					//ACT state is located inside NSW
          if (this.id == 'path1') { //if the mouse is hovering through NSW, but not ACT -> do not raise ACT
            d3.select('#path8') //set act to normal white stroke
              .attr('stroke', 'white') //set white stroke
              .attr('stroke-width', '1px') //set width for stroke
              .raise(); //raise it
          }

          if (this.id == 'path8') { //if ACT is hover
            d3.select('#text8').remove(); //do not show value for it
          }
          d3.select('#tooltop_nondata').remove(); //remove the name of that state
          var remove_name = '#text' + d.properties.STATE_CODE;
          d3.select(remove_name).remove(); //remove the name of that state

          d3.select('.details').style('visibility', 'visible'); //show pie chart

				//show value for the state instead of its name
          map
            .append('text') //append text
            .attr('class', 'tooltip1') //set class
            .attr('fill', 'black') //color for text
            .attr('transform', 'translate(' + path.centroid(d) + ')') //set name at the centroid
            .attr('text-anchor', 'middle') //anchor of text 
            .attr('dy', 15) //dy for text
            .text(function(d) {
              if (vis1_array[i] == 0) return '!'; //if it is act, no figure will show --> !
              else return vis1_array[i]; //otherwise, show figures for that state.
            })
            .style('font-weight', 600) //bold 
            .style('font-size', '20px'); //font size

          /*-----------Pie chart ----------------------*/

        
          pie_dataset = []; //array to store data for pie chart

          if (+d.properties.STATE_CODE <= 7) {// if the state is not ACT 
            /*--------Read file----------*/
            d3.csv('data/Chart' + d.properties.STATE_CODE + '.csv') //location of csv file
              .then(function(data) { 
                pie_dataset = []; //empty array before loading

                //Set input domain for color scale
                for (let i = 1; i <= 2; i++) { //two values for one pie chart 
                  pie_dataset.push( //load data into the array
                    parseFloat(d3.entries(data[year - 10])[i].value) //string to float
                  );
                }

                /*--------Read file----------*/

                var outerRadius = pie_h / 2; //radius w/2 --> d=w
                var innerRadius = 0; //circle, not donut --> inner radius 0
                var arc = d3
                  .arc() //create angles for circle, segments of the pie chart
                  .innerRadius(innerRadius) //set innerRadius
                  .outerRadius(outerRadius); //set outterRadius
                while (!d3.select('.pie_chart_vis').empty()) { //if a user hovers their mouse continously
                  d3.select('.pie_chart_vis').remove();// --> make sure all previous pie charts are removed
                }

                var pie = d3.pie(); //pie chart

                //set up SVG canvas
                var pie_svg = d3
                  .select('#chart1_pie') //locate the svg at the p #chart1_pie
                  .append('svg') //append svg
                  .attr('width', pie_w) //set width for pie chart
                  .attr('height', pie_h) //set height for pie chart
                  .attr('class', 'pie_chart_vis'); //set class for pie chart 

                //Set up our arcs
                var arcs = pie_svg
                  .selectAll('g.arc')
                  //arcs are being added as a group set
                  .data(pie(pie_dataset))
                  //data being read into the SVG is that from the pie() Function
                  // pie(): generate the angles we need to draw the segments
                  .enter() //create segment
                  .append('g') //append group
                  .attr('class', 'arc') //group set

                  .attr(
                    'transform',
                    'translate(' + outerRadius + ',' + outerRadius + ')'
                  );
                //translate w/2, w/2 --> position of centroid
                //if (0,0) --> 1/4 pie chart is shown

                var tmp_color_array = [];
                //Draw arc paths
                arcs
                  .append('path') //generate paths for the data bournd to the arcs group
                  .attr('class', 'tooltip3') //set class for this path
                  .transition() //transition
                  .duration(1000) //set duration for that transition
                  .attr('fill', function(d, i) {
                    return pie_color(i); //use color scale --> each segment has each distinguish color
                  })
                  .attr(
                    'd',
                    function(d, i) {
                      return arc(d, i); //draw path
                    } //call arc segment
                  );
						
            //Create svg for pie
                var pie_legends = d3 //svg
                  .select('#chart1_pie_legends') 
                  .append('svg') //append the svg
                  .attr('width', 450) //set width for svg
                  .attr('height', 35) //set height for svg
                  .attr('class', 'pie_chart_vis'); //set class for the svg


                pie_legends //create circles for legneds
                  .selectAll('dotsss')
                  .data([
                    'non-renewable energy',
                    'renewable energy (Unit: GWh)',
                  ])
                  .enter() //create new element
                  .append('circle') //create circle
                  .attr('cx', (d, i) => 180 * i + 10) //set centrer's x
                  .attr('cy', 20) //set centrer's x
                  .attr('r', 10) //set radius for each circle
                  .style('fill', (d, i) => pie_color(i)); //fill color for that circle

                pie_legends
                  .selectAll('legendssss')
                  .data([
                    'non-renewable energy',
                    'renewable energy (Unit: GWh)',
                  ])
                  .enter() //create new element
                  .append('text') //create text
                  .attr('x', (d, i) => 180 * i + 25) //set x for text
                  .attr('y', 28) //set y for text
                  .attr('font-size', '12px') //set font size for text
                  .text(d => d); //show content for that circle, in data[non-rew, renew...]

                //add label text
                arcs
                  .append('text') //pie generator generates an array containing all path data and data value
                  .attr('class', 'tooltip3') //set class for this text

                  .text(function(d) {
                    return d.value; //show value for that part
                  }) //to access the value inside an array
                  .attr('transform', function(d) { //transform
                    return (
                      'translate(' +
                      (arc.centroid(d)[0] - 18) + //x for the figure
                      ',' +
                      arc.centroid(d)[1] + //y for the figure
                      ')'
                    );
                  })
                  .attr('font-size', '12px') //font size
                  .style('font-weight', 700); //by default, text is displayed at the centroid of the chart
                // -> transform + arc.centroid to find the middle of an irregular shape.
                /*-----------Pie chart ----------------------*/
              })
              .catch(function(error) {
                while (!d3.select('.pie_chart_vis').empty()) { //if there are still some previous pie charts not being removed
                  d3.select('.pie_chart_vis').remove(); //remove all
                }
              });
          } else {//if the selected state is act
            while (!d3.select('.pie_chart_vis').empty()) { //if there are still some previous pie charts not being removed
              d3.select('.pie_chart_vis').remove();//remove all
            }
           
            d3.select('.pie_nodata') //select pie_nodata
              .append('text') //create a text
              .attr('id', 'tooltop_nondata') //set id for that text
              .text('no data'); //show no data for pie chart
          }
          //----------------------

          d3.select('.pie_title').text( //set name for the pie chart
            'Energy generation in ' + d.properties.STATE_NAME //name of pie chart
          );

          //if (this.id == 'path8') {
          //}

          //-----------
        })

        .on('mouseout', function(d) { //if the mouse hovers out of the state
        
          d3.select(this) //for the current selected state
          	.attr('stroke', 'white') //set stroke color once again to white
            .attr('stroke-width', '1px'); //set stroke-width to 1

          d3.select('.tooltip1').remove(); //remove the figures shown when the mouse hovers

          map
            .append('text') //show name of state for that state
            .attr('fill', 'black') //color text is black
            .attr('transform', 'translate(' + path.centroid(d) + ')') //the position of the text
            .attr('text-anchor', 'middle') //anchor of text
            .attr('dy', 15) //set dy is 15
            .attr('id', 'text' + d.properties.STATE_CODE) //set id for text
            .text(d.properties.STATE_NAME) //show name of the state
            .style('font-weight', 600) //bold
            .style('font-size', '10px'); //set font size
        }); //end of mouse out

      map
        .selectAll('g.state')// select g.state
        .data(json.features) //from the features data in json file
        .enter() //create a element
        .append('g') //create g
        .classed('state', true) //set state to true
        .append('text') //create text
        .attr('id', function(d) { //set id for the text
          return 'text' + d.properties.STATE_CODE; //id value
        })

        .attr('fill', 'black') //text color is black
        .attr('transform', function(d) { //set position for text
          return 'translate(' + path.centroid(d) + ')';
        })
        .attr('text-anchor', 'middle') //anchor is middle 
        .attr('dy', 15) //dy is 15
        .text(function(d) { //set content of text - name of state
          return d.properties.STATE_NAME;
        })
        .style('font-weight', 600) //bold
        .style('font-size', '10px');// font size

      //----
      //-----
    });
  });
}

//-----------------------
//-------------
function filterYear(map) { //filter year
  const select = document.getElementById('map1_select_year');
  //get the select field

  select.addEventListener('change', function handleChange(event) {
  //if the value in that field changes, we update visualisation with following implementation:
  
    year = parseInt(event.target.value) - 1999; //get the selected year by user


    /*------------ Update color --------*/
    d3.csv('data/Map_V4.csv').then(function(data) { //load data again from the csv file
      //Set input domain for color scale
      vis1_array = []; //empty the array before loading data
      for (let j = 1; j <= 9; j++) {
        vis1_array.push( //push data into the array
          parseFloat( //string to float
            d3.entries(data[parseInt(event.target.value) - 1999])[j].value //get value from the file
          )
        );
      }
      for (let i = 1; i <= 9; i++) {//after succesfully loading the value
        var currentPath = '#path' + i; //get the id for the state to update value
        d3.select(currentPath)
          .transition() //smooth transition for changing color
          .duration(1000) //set duration for changing animation
          .style('fill', color(vis1_array[i - 1])); //update state's color corresponding to its value
      }
    });

    /*------------ Update color --------*/
  });
}
//-----------

/*-------------On Click for hide --------------*/
function hideButton() { //hide button
  d3.select('.details').transition().style('visibility', 'hidden');
  //hide the pie charts whenever the button is clicked

  while (!d3.select('.pie_chart_vis').empty()) { //if there are still some previous pie charts not being removed
    d3.select('.pie_chart_vis').remove(); //remove all
  }
}
/*-------------sleep for animation --------------*/
function sleep(ms) { //set sleep for animation
  return new Promise(resolve => setTimeout(resolve, ms)); //function
}
/*-------------Vis 1: Animation-----------------*/
async function vis1_animation() {

  /*------------ Update color --------*/
  d3.csv('data/Map_V4.csv').then(async function(data) {
    //Set input domain for color scale

    for (let i = 2009; i < 2020; i++) {
      document.getElementById('map1_select_year').value = i;//get the current year

      vis1_array = []; //empty array before loading information

      for (let j = 1; j <= 9; j++) { //9 states
        vis1_array.push( //load data into array
          parseFloat(d3.entries(data[i - 1999])[j].value) //string to float
        );

        var currentPath = '#path' + j; //get the id to update path for that state
        d3.select(currentPath)
          .transition() //set animation for changing color
          .duration(1000) //set duration for animation
          .style('fill', //update color for that state

            function() {

              return color(vis1_array[j - 1]); //set color corresponding to its figure

            }
          );
      }
      await sleep(1000); // sleep to ensure that figures on map is match with the current year

    }


  });

  /*------------ Update color --------*/

}
//------------------------Visualisation 1-----------------------*/
/*-------------Vis 1: Animation-----------------*/








//Visualisation 2
var vis2_dataset_f; // an array to store full data set loading from the csv file

function vis2_execution() {
  vis2_dataset_f = []; //empty array 

  //read data
  d3.csv('data/Vis2_V1.csv').then(function(data) {
    //Set input domain for color scale
    vis2_dataset_f = []; //empty array array
    for (let j = 0; j < data.length; j++) {

      vis2_dataset_f.push(d3.entries(data)[j].value);//push data from csv to the array
    }

    applyFilter();
  });
}



// Visualisation 2
//button handle

function goFilter() {
  var flag = true;
  var energyList = [//list of fuel types
    'lignite',
    'coal',
    'oil',
    'naturalgas',
    'solar',
    'biomass',
    'nuclear',
    'hydro',
    'wind',
  ];
  for (let i = 0; i < energyList.length; i++) {
    filter[i] = document.getElementById(energyList[i]).checked; //get value from user's input
    flag = flag & !filter[i]; //flag to check if we need to reset or not
  }
  if (flag) resetFilter(); //if all fields are unticked --> reset
  else applyFilter(); //otherwise, apply filter according to user's input
}
var filter = []; //empty filter array - global variable
for (let i = 0; i < 9; i++) { //9 fuel types
  filter.push(1); //by default, all fule types are ticked
}

function resetFilter() {
  var energyList = [ // list of fuel types
    'lignite',
    'coal',
    'oil',
    'naturalgas',
    'solar',
    'biomass',
    'nuclear',
    'hydro',
    'wind',
  ];
  for (let i = 0; i < energyList.length; i++) {
    document.getElementById(energyList[i]).checked = 1; //check all fields on UI
    filter[i] = 1; //set filter array all to 1
  }
  applyFilter(); //then apply filter
}

function applyFilter() {
  var vis2_dataset_pg = []; // the list of data of interest 
  for (let i = 0; i < vis2_dataset_f.length; i++) {
    if (filter[i]) vis2_dataset_pg.push(vis2_dataset_f[i]); //if that field is ticked, include that data into our array
  }

  //read data
  var vis2_w = w * 0.5; //svg's width
  var vis2_h =
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0) *
    0.8; //svg's height
  var vis2_padding = 70; //padding for vis2

  var vis2_xScale = d3
    .scaleBand() //generate an ordinal scale for x-axis
    //normally domain(["high","med","low"])
    .domain(d3.range(vis2_dataset_pg.length)) //calculate the range of the domain
    .rangeRound([vis2_padding, vis2_w - vis2_padding]) // specify the size of the range the domain needs to be mapped
    // round the bandwidths to whole number
    .paddingInner(0.05); // to generate a padding value of 5% of the bandwidth

  var vis2_yScale = d3
    .scaleLinear() //quantitative data
    .domain([
      0,
      d3.max(vis2_dataset_pg, function(d) {
        return +d.High;
      }),
    ]) //domain of y
    .range([vis2_h - vis2_padding, vis2_padding]); // specify the size of the range the domain needs to be mapped
  // round the bandwidths to whole number
  // range of y

  d3.select('#vis2_id').remove(); // remove the previous svg (if any)

  var vis2_svg = d3
    .select('#chart2') //locate the svg at #chart2
    .append('svg') //append svg
    .attr('width', vis2_w) //set width for vis2
    .attr('height', vis2_h) //set height for vis2
    .attr('id', 'vis2_id'); //set id for the svg

  //Create "Type of Energy" on  X axis
  vis2_svg
    .append('text')
    .attr('x', vis2_w / 2 - 20) //x pos
    .attr('y', vis2_h - 15) //y position
    .attr('text-anchor', 'middle') //anchor the text to middle
    .style('font-size', '15px') //font size
    .text('Type of energy'); //content

  //Create "Tonnes/GWh of CO2 emission" on Y Axis
  vis2_svg
    .append('text') //create a text
    .attr('x', -(vis2_h / 2)) //x pos
    .attr('y', vis2_padding - 35) //y pos
    .attr('text-anchor', 'middle') //anchor the text to middle
    .attr('transform', 'rotate(270)') //follow y axis
    .style('font-size', '15px') //set font size 
    .text('Tonnes/GWh of CO2 emission');//content

  var vis2_xAxis = d3
    .axisBottom() //set axis at bottom
    .ticks(vis2_dataset_pg.length) /*controlling the tick* - interval */
    .scale(vis2_xScale) //set scale
    .tickFormat(i => vis2_dataset_pg[i].Technology); //number of format

  var vis2_yAxis = d3
    .axisLeft() //set axis to left
    .ticks(8) /*controlling the tick* - interval */
    .scale(vis2_yScale); //set scale

  vis2_svg
    .selectAll('rect') /*select all rect even though they dont yet exist*/
    .data(vis2_dataset_pg) /*count + prepare data values*/
    .enter() /*create a new plce holder element for each bit of data*/
    .append('rect') /* append a rect element to match each placeholder*/
    .attr('x', function(d, i) {
      return vis2_xScale(i);
    }) /* to scale value of x*/
    .attr('y', function(d) {
      return vis2_yScale(d.Mean);
    }) /* value of y - positions*/
    .attr(
      'width',
      vis2_xScale.bandwidth()
    ) /* barpadding to create space bw each column*/
    .attr('height', function(d) {
      return vis2_h - vis2_padding - vis2_yScale(d.Mean);
    }) /* extend the height for an easy look*/
    .attr('fill', function(d) {
      if (+d.Mean > 200) return 'red';
      return 'green';
    })
    .on('mouseover', function(d, i) {
      //when the mouse hovers

      d3.select(this).attr('fill', 'orange'); //that column turns orange

      //get bar position
      var xPosition = //the position of mean figures
        parseFloat(d3.select(this).attr('x')) + vis2_xScale.bandwidth() / 2 - 7;
      var yPosition = parseFloat(d3.select(this).attr('y')) + 30; //position of mean figures

      vis2_svg
        .append('text') //create a text
        .attr('class', 'vis2_tooltip') //set class
        .attr('x', function() {
            if (+d.Mean <= 200) // if the figure is too small
              return xPosition + 10; //set it on top of the column
            return xPosition - (d.Mean.length / 2) * 4;  //middle of column
          }

        )
        //;function (){ if (positionOfText == "green") return xPosition + 10; return xPosition - (d.Mean.length/2)*4;})
        .attr('y',
          function() {
            if (+d.Mean <= 200)// if the figure is too small
              return yPosition - 30;//set it on top of the column
            return vis2_yScale(d.Low) + 35;//middle of column
          }

        ) //vis2_h - vis2_padding + 32) //function (){ console.log(+d.Low + 50); if (positionOfText == "green") return yPosition - 35; return vis2_yScale(d.Low) +35;})
        .attr('font-weight', 'bold') //bold
        .text(d.Mean); //content of text - value of d.mean


      vis2_svg
        .append('text') //create text
        .attr('class', 'vis2_tooltip') //set class
        .attr('x', xPosition - d.Mean.length * 7) //set position of L and H figures
        .attr('y', vis2_yScale(d.High) - 5) //set position of L and H figures
        .attr('font-weight', 'bold') //bold
        .attr("font-size", "12px") //fontsize
        .text("L:" + d.Low + " H:" + d.High); //content of that column
    })
    .on('mouseout', function() {
      //when the mouse no longer hovers
      d3.select(this)
        .transition() //smoother
        .delay(100) //delay 0.1s
        .duration(1000) //duration for that animation 1s
        .attr('fill', function(d) {
          if (+d.Mean > 200) return 'red'; //nonrenewable energy - column color is red
          return 'green';//renewable energy - column color is green
        }); //that column turns back to default color
      while (!d3.select('.vis2_tooltip').empty()) { //if the mouse moves continuously
        d3.select('.vis2_tooltip').remove(); //remove color of ALL selected columns
      }
      //remove value of column when mouse no longer hovers
    });
  /* shape color*/
  //set up axis
  vis2_svg
    .append('g') //create g 
    .attr('transform', 'translate(0,' + (vis2_h - vis2_padding) + ')') //position for x axis
    .call(vis2_xAxis); //draw x axis

  vis2_svg
    .append('g') //create g
    .attr('class', 'y axis') //assign class for y axis
    .attr('transform', 'translate(' + vis2_padding + ',0)') //position for y axis
    .call(vis2_yAxis); //draw y axis
  // set up axis
  // Legendssssssssss

  //Create a legend for the graph
  vis2_svg
    .append('rect') //create big rect to store  legends
    .attr('x', (3 * vis2_w) / 4 - 10) // set x pos
    .attr('y', 42) //set y pos
    .attr('height', 4 * 18) //height of pos
    .attr('width', 155) //width of pos
    .style('fill', 'none') //no color for the rect
    .style('stroke', 'black'); //stroke for rect is black


  vis2_svg
    .append('text') //create a new text to write "LEGENDS"
    .attr('x', (3 * vis2_w) / 4 - 10) //set x pos
    .attr('y', 22) //set y pos
    .text('Legends') //content
    .style('font-size', '20px') //font size
    .attr('alignment-baseline', 'middle') //baseline
    .style('font-weight', 1000); //bold



  /*------------------Legends------------*/
  vis2_svg
    .selectAll('dotsss') //select dotss
    .data(['non-renewable energy', 'renewable energy (Unit: GWh)']) //for each element in this array
    .enter() //create an element
    .append('circle') //create circle
    .attr('cx', (d, i) => (3 * vis2_w) / 4 + 5) //set x pos for center
    .attr('cy', (d, i) => 60 + 30 * i) //set y pos for center
    .attr('r', 8) //set radius for center
    .style('fill', function(d, i) { //fill colour for circle legends
      if (i == 1) return 'green';
      return 'red';
    });

  vis2_svg
    .selectAll('legendssss') //select legneds
    .data(['non-renewable energy', 'renewable energy']) //for each element in this array
    .enter() //create an element on svg
    .append('text') //create a text
    .attr('x', (3 * vis2_w) / 4 + 20) //x pos
    .attr('y', (d, i) => 60 + 5 + 30 * i) //y pos
    .attr('font-size', '12px')//font size
    .text(d => d);//content of text, element in data

  /*----------set up highlow--------------*/

  vis2_svg
    .selectAll(
      'vis2_lowhigh_lineeee'
    ) /*select all rect even though they dont yet exist*/
    .data(vis2_dataset_pg) /*count + prepare data values*/
    .enter() /*create a new plce holder element for each bit of data*/
    .append('line') /* append a rect element to match each placeholder*/
    .attr('class', (d, i) => 'vis2_lowhigh' + i) //set class
    .attr('x1', function(d, i) {
      return vis2_xScale(i) + vis2_xScale.bandwidth() / 2;
    }) /* to scale value of x*/
    .attr('y1', function(d) {
      return vis2_yScale(d.Low);
    }) /* value of y - positions*/
    .attr('x2', function(d, i) {
      return vis2_xScale(i) + vis2_xScale.bandwidth() / 2;
    }) /* to scale value of x*/
    .attr('y2', function(d) {
      return vis2_yScale(d.High);
    }) /* value of y - positions*/

    .style('stroke', 'black') //set color for line
    .style('stroke-width', 1); //set width for line
  //.style("stroke-dasharray", 2); //set gap for line

  vis2_svg
    .selectAll(
      'vis2_lowhigh_high'
    ) /*select all rect even though they dont yet exist*/
    .data(vis2_dataset_pg) /*count + prepare data values*/
    .enter() /*create a new plce holder element for each bit of data*/
    .append('line') /* append a rect element to match each placeholder*/
    .attr('class', (d, i) => 'vis2_lowhigh_high' + i) //set class
    .attr('x1', function(d, i) {
      return vis2_xScale(i) + vis2_xScale.bandwidth() / 2 - 2;
    }) /* to scale value of x*/
    .attr('y1', function(d) {
      return vis2_yScale(d.High);
    }) /* value of y - positions*/
    .attr('x2', function(d, i) {
      return vis2_xScale(i) + vis2_xScale.bandwidth() / 2 + 2;
    }) /* to scale value of x*/
    .attr('y2', function(d) {
      return vis2_yScale(d.High);
    }) /* value of y - positions*/

    .style('stroke', 'black') //set color for line
    .style('stroke-width', 1); //set width for line
  //.style("stroke-dasharray", 2); //set gap for line

  vis2_svg
    .selectAll(
      'vis2_lowhigh_high'
    ) /*select all rect even though they dont yet exist*/
    .data(vis2_dataset_pg) /*count + prepare data values*/
    .enter() /*create a new plce holder element for each bit of data*/
    .append('line') /* append a rect element to match each placeholder*/
    .attr('class', (d, i) => 'vis2_lowhigh_high' + i) //set class
    .attr('x1', function(d, i) {
      return vis2_xScale(i) + vis2_xScale.bandwidth() / 2 - 2;
    }) /* to scale value of x*/
    .attr('y1', function(d) {
      return vis2_yScale(d.Low);
    }) /* value of y - positions*/
    .attr('x2', function(d, i) {
      return vis2_xScale(i) + vis2_xScale.bandwidth() / 2 + 2;
    }) /* to scale value of x*/
    .attr('y2', function(d) {
      return vis2_yScale(d.Low);
    }) /* value of y - positions*/

    .style('stroke', 'black') //set color for line
    .style('stroke-width', 1); //set width for line
  //.style("stroke-dasharray", 2); //set gap for line

  /*----------set up highlow--------------*/
  //Legends
}
//button handle

/*--------------------Vis3-----------------------*/
var vis3_currentPoint; //variable for showing mouse's position
var vis3_XYboxOpacity = '0.5'; //opacity for showing mouse's position
var vis3_dataset_f = [];
var vis3_dataset_Rf = [//a,b,R square, relationship
  [-0.1709, 19.6374, 0.9287, 'very strong inverse relationship'],//regression equation
  [-0.07672, 11.6977, 0.7867, 'very strong inverse relationship'],//regression equation
  [-0.5622, 13.19, 0.8916, 'very strong inverse relationship'],//regression equation
  [-0.05071, 6.019, 0.8206, 'very strong relationship']//regression equation
];
//range of year of interest
var vis3_year_s = 0; //by default, it is 0
var vis3_year_e = 0;//by default, it is 0

function vis3_execution() {
  //13 records/region
  //read data


  d3.csv('data/Vis3_V3.csv').then(function(data) {//load data from csv file

    //Set input domain for color scale
    for (let j = 0; j < data.length; j++) {
      //   parseFloat(d3.entries(data[parseInt(event.target.value) - 1999])[j].value)

      vis3_dataset_f.push(d3.entries(data)[j].value);//push data into array
    }
    vis3_year_s = vis3_loadYearFilter()[0]; //get starting year from user's input
    vis3_year_e = vis3_loadYearFilter()[1];//get ending year from user's input
    vis3_applyFilter(); //apply the filter
  });
}
var vis3_dataset_Rpg = []; //the array to store the R of interest
var yearCount = 0; //the number of years we are interested

function vis3_applyFilter() {
  var vis3_w = w * 0.7; //set width for vis3
  var vis3_h = h;//set height for vis3
  var vis3_dataset_pg = []; //array to store data we are working on


  yearCount = vis3_year_e - vis3_year_s + 1; //number of years
  vis3_dataset_Rpg = []; //empty the array
  for (let i = 0; i < vis3_dataset_f.length; i++) {
    if (vis3_filter[parseInt(i / 13)]) { //if one field is checked
   
      if (parseInt(vis3_dataset_f[i].Year) >= vis3_year_s && parseInt(vis3_dataset_f[i].Year) <= vis3_year_e)
      	//if that year is  in [starting year, end year]
        vis3_dataset_pg.push(vis3_dataset_f[i]); //load data to array
    }
  }

  for (let i = 0; i < vis3_dataset_Rf.length; i++) { //for R array 
    if (vis3_filter[i]) vis3_dataset_Rpg.push(vis3_dataset_Rf[i]); //only load data for checked field
  }
  var vis3_color_array = []; //create an arry to store color 
  var vis3_padding = 50; //padding for vis 3
  var vis3_xScale = d3
    .scaleLinear() //set up scale of x Axis - ratio
    .domain([ //domain range
      d3.min(vis3_dataset_pg, function(d) {
        return +d.rshare;
      }), //get min rshare
      d3.max(vis3_dataset_pg, function(d) {
        return +d.rshare;
      }), //get max rshare year
    ])
    .range([vis3_padding, vis3_w - vis3_padding]);// range of value

  var vis3_yScale = d3
    .scaleLinear() //ratio variable -> scale linear
    .domain([0,// min
      /*d3.min(vis3_dataset_pg, function(d) {
        return +d.CO2;
      }),*/
      d3.max(vis3_dataset_pg, function(d) {
        return +d.CO2; //max co2
      }),
    ])
    .range([vis3_h - vis3_padding, vis3_padding]); //range of value

  //Define X axes
  var vis3_xAxis = d3.axisBottom().scale(vis3_xScale).ticks(10);
  // 10 ticks

  //Define Y axis
  var vis3_yAxis = d3.axisLeft().scale(vis3_yScale).ticks(10);
  // 10 ticks
  
  
  d3.select('#vis3_id').remove();// remove the previous svg (if any)

  //Create SVG element
  var vis3_svg = d3
    .select('#chart3') //locate svg at #chart3 p.
    .append('svg') //create an svg
    .attr('width', vis3_w + w * 0.2) //set svg width
    .attr('height', vis3_h) //set svg height
    .attr('id', 'vis3_id'); //set id for the visualisation

  //x axis: share of electricity
  vis3_svg
    .append('text') //create an text
    .attr('x', vis3_w / 2 - 20) // x pos of text
    .attr('y', vis3_h - 15) //y pos if text
    .attr('text-anchor', 'middle') //ser anchor to middle 
    .style('font-size', '15px') //size of font
    .text('Share of electricity from renewables (%)'); //content of the text

  //y axis: tonnes of CO2
  vis3_svg
    .append('text') //create an text
    .attr('x', -(vis3_h / 2)) //x pos of text
    .attr('y', vis3_padding - 35) // y post of text
    .attr('text-anchor', 'middle') //set anchor to middle
    .attr('transform', 'rotate(270)') //follow y axis -> rotate
    .style('font-size', '15px') //size of font
    .text('Tonnes of carbon dioxide emission per capita');//content of the text


  //legends----------------

  // Legendssssssssss

  //Create a legend for the graph
  vis3_svg
    .append('rect') //create a rect to store legends
    .attr('x', vis3_w + 10) //x pos
    .attr('y', 30 + 42) //y pos
    .attr('height', (vis3_dataset_Rpg.length + 1) * 18) //height of rect
    .attr('width', 155) //width of rect
    .style('fill', 'none') //no color for the rect 
    .style('stroke', 'black'); //set stroke to black


  vis3_svg
    .append('text') //create an text 
    .attr('x', vis3_w + 10) //x pos
    .attr('y', 30 + 22)//y pos
    .text('Legends')//content of text
    .style('font-size', '20px') //font size
    .attr('alignment-baseline', 'middle') //baseline to middle
    .style('font-weight', 1000); //bold

  for (let i = 0; i < vis3_dataset_Rpg.length; i++) {
    vis3_color_array.push(pie_color(i)); //load color to color array
    vis3_svg

      .append('rect') //create a rect for each color legend
      .attr('x', vis3_w + 20) //x pos
      .attr('y', 30 + 54 + 18 * i) //y pos
      .attr('width', 25)//width of rect
      .attr('height', 15) //height of rect
      .attr('stroke', 'black') //stroke is black
      .style('fill', pie_color(i)); //fil that rect by corresponding color

    vis3_svg

      .append('text') //create a text
      .attr('x', vis3_w + 20 + 25 + 5) // x pos
      .attr('y', 30 + 54 + 18 * i + 14) //y pos
      .text(vis3_dataset_pg[i * yearCount].Country) //content of text
      .style('fill', pie_color(i)) //fill the color of text by corresponding color
      .style('font-weight', 550); //bold

  }
  //---------------legends---------------//

  /*-------legends-------*/
  
  var vis3_line = d3
    .line()  // line function
    .x(function(d) { //x pos
      return vis3_xScale(+d.rshare);
    })
    .y(function(d) { //y pos
      return vis3_yScale(+d.CO2);
    });
  var tmp_array = [];

  for (let i = 0; i < vis3_dataset_pg.length; i++) {
    tmp_array.push(vis3_dataset_pg[i]);//tmp array to store the current line

    if (i % yearCount == yearCount - 1) { //if figures for one country is completely loaded into tmp array
      var tmp_line_id = parseInt(i / yearCount); //get the id for line

      vis3_svg
        .append('path') //append path
        .datum(tmp_array) //data is used to bind each single data value to a different html element
        //datum is used to bind the data to a single path element
        .attr('id', 'vis3_line' + tmp_line_id) //set line to
        .attr('d', vis3_line) //set line to d
        .style('stroke', vis3_color_array[tmp_line_id]) //CSS
        .style('stroke-width', 2) //width of line
        .style('fill', 'none') //no color 
        .on('mouseover', function() {
          tmp_line_id = parseInt(d3.select(this).attr('id')[9]);//get id 
          vis3_lineMouseOver(vis3_svg, vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id, vis3_xScale, vis3_yScale) //run mouse over function
        })
        .on('mouseout', function() {
          tmp_line_id = parseInt(d3.select(this).attr('id')[9]); //get id
          vis3_lineMouseOut(vis3_svg, vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id)
          //run mouse out function
        });
      //dotsss
      tmp_line_id = parseInt(i / yearCount);//get id of line

      /*-----------dots point of each line------------*/

      for (let j = 0; j < yearCount; j++) {
        var x_position = vis3_xScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].rshare);
        //get x position of current year
        var y_position = vis3_yScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].CO2);
        //get y position of current year
        vis3_svg
          .selectAll("vis3_dataPointForEachLine") //locate the element at this vis3_...
          .data('wow')//1 data
          .enter() //create an element
          .append('circle')// create an cirle
          .attr('class', 'vis3_dots_' + tmp_line_id) //set class for the circle
          .attr('id', 'vis3_dots_' + (tmp_line_id * yearCount + j)) //set id for the circle
          .attr('cx', x_position) //x position of center
          //pie_h + 100
          .attr('cy', y_position) //y position of center
          //(d,i) => 150 + i*(40)
          .attr('r', 1) //radius of circle
          .style('fill', 'black') //color of black
          .on('mouseover', function() { //mouse over
            vis3_XYboxOpacity = '1.0'; //capacity of coordinates of current position is 1
            var vis3_currentid = parseInt(d3.select(this).attr('id').substring(10)); 
            //get id for the line from substring of id
            vis3_currentPoint = [+vis3_dataset_pg[vis3_currentid].rshare, +vis3_dataset_pg[vis3_currentid].CO2]; //set current point position
            tmp_line_id = parseInt(d3.select(this).attr('class')[10]);  //get id for the line of id
            
            vis3_lineMouseOver(vis3_svg, vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id, vis3_xScale, vis3_yScale)//trigger mouse over function
          })
          .on('mouseout', function() {
            vis3_XYboxOpacity = '0.5';//capacity of coordinates of current position is 0.5
            tmp_line_id = parseInt(d3.select(this).attr('class')[10]);//get id for the line of id
            vis3_lineMouseOut(vis3_svg, vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id)
          }); //trigger mouse out function
      }
      /*-----------dots point of each line------------*/
      tmp_line_id = parseInt(i / yearCount);//get id for the line of id


      /*-----------year on each line------------*/
      var printedYearpos = []; //create an array to store printed year
      for (let j = 0; j < yearCount; j++) {
        var x_position = vis3_xScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].rshare);
        //x pos of current year
        var y_position = vis3_yScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].CO2);
        //x pos of current year
        var year_text_padding_x = 5; //padding text for x
        var year_text_padding_y = 0;//padding text for y
        //if (j == 6) continue;

        var flagDraw = true; //flag to check if the year should be displayed or not
        for (let jj = 0; jj < printedYearpos.length; jj++) {
          var x_jj_position = printedYearpos[jj][0]; //check all the previous printed year
          var y_jj_position = printedYearpos[jj][1];

          if (Math.abs(x_jj_position - x_position) < 40 && //check whether the current year is overlapped any of previous
            Math.abs(y_jj_position - y_position) < 8.5) {
            flagDraw = false; //if yes, break and we will not draw the current year
            break;
          }

        }
        if (!flagDraw) continue; //not draw the current year

        if (j != yearCount - 1) {
          var x_next_position = vis3_xScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j + 1].rshare);
          //get the position of next point
          var y_next_position = vis3_yScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j + 1].CO2);
          //get the position of next point


          if (x_next_position >= x_position) {
          //if the shape is forward incline arrow
            if (y_next_position <= y_position)
              year_text_padding_y += 10;
            else year_text_padding_y -= 2;          
            //if the shape is forward decline arrow

          } else {
            if (y_next_position <= y_position)
              year_text_padding_y -= 40;          //if the shape is backward incline arrow
            else year_text_padding_y -= 2;           //if the shape is backward decline arrow
          }
        }

        printedYearpos.push([x_position, y_position]); //push the pos of point to the printed year pos array

        vis3_svg
          .selectAll('vis3_dots_year' + tmp_line_id + j)//locate the new element at vis3_dots_year
          .data('wow') //1 loop -  1 data

          .enter() //create an element
          .append('text') //create a text
          .attr('class', 'vis3_dots_ne') // set class
          .attr(
            'x', x_position + year_text_padding_x) //pos x of text
          .attr('y', y_position + year_text_padding_y) //pos y of text
          .text(vis3_dataset_pg[+tmp_line_id * yearCount + j].Year) //content of text 
          .attr('font-size', 10).style("font-weight", 800);//bold

    
      }

      /*-----------year on each line------------*/

      //dotsss


      tmp_array = []; //empty the array
    }


  }




  //Create axes
  vis3_svg
    .append('g') //create g
    .attr('class', 'axis') //set class axis for g
    .attr('transform', 'translate(0,' + (vis3_h - vis3_padding) + ')') //transform g
    .call(vis3_xAxis); //call x axis

  vis3_svg
    .append('g') //create g 
    .attr('class', 'axis') //set class axis for g
    .attr('transform', 'translate(' + vis3_padding + ',0)')//transform g
    .call(vis3_yAxis);//call y axis
  showXYPairs(vis3_svg, vis3_padding, vis3_h, vis3_w, vis3_dataset_pg); //call to show coordinates on the graph
}

function vis3_goFilter() {
  var flag = true;//use flag to check whether all fields are unticked.
  var countryList = [ //list of countries
    'australia',
    'germany',
    'singapore',
    'world',
  ];
  for (let i = 0; i < countryList.length; i++) {
    vis3_filter[i] = document.getElementById(countryList[i]).checked;//get the  value from user's input
    flag = flag & !vis3_filter[i]; //use flag to check whether all fields are unticked.
  }
  vis3_year_s = vis3_loadYearFilter()[0]; //get the starting year from the user's input
  vis3_year_e = vis3_loadYearFilter()[1];//get the ending year from the user's input
  if (flag || vis3_year_s >= vis3_year_e) { //if users input invalid year range
    if (!flag) //alert to users
      alert("This visualisation will be reset due to invalid year range!");

    vis3_resetFilter(); //reset filter to default setting
  } else { //if the valid year range is input

    vis3_applyFilter(); //apply filter
  }
}
var vis3_filter = []; //global variable
for (let i = 0; i < 4; i++) {
  vis3_filter.push(1); //by default, vis3_filter has all value of 1
}

function vis3_resetFilter() { //reset vis 3 to the default setting
  var countryList = [ //a list of countries
    'australia',
    'germany',
    'singapore',
    'world',
  ];
  for (let i = 0; i < countryList.length; i++) { 
    document.getElementById(countryList[i]).checked = 1; // check all countries
    vis3_filter[i] = 1; //set value for array
  }
  document.getElementById('vis3_year_s').value = '2009'; //set value for vis3_year_s on UI
  document.getElementById('vis3_year_e').value = '2020';//set value for vis3_year_e on UI

  vis3_year_s = 2009; //set the starting year to the earliest year
  vis3_year_e = 2020;//set the starting year to the latest year
  vis3_applyFilter(); //apply filter
}


function vis3_lineMouseOver(vis3_svg, vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, id, vis3_xScale, vis3_yScale) {

  /*---------draw rectangle for legends----------*/
  vis3_svg

    .append('rect')//apend rect
    .attr('class', 'vis3_dots_country_highlight') //set class

    .attr('x', vis3_w + 10)//x pos for text
    .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50)//y pos for text
    .attr('width', 155)//set width for text
    .attr('height', 100)//set height for text
    .attr('stroke', 'black') //set stroke to black
    .style('fill', 'none'); //no fill for rect

  /*---------draw regression text for legends----------*/

  vis3_svg

    .append('text') //create text
    .attr('class', 'vis3_dots_country_highlight') //set class for text

    .attr('x', vis3_w + 20) //x pos for text
    .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20)//y pos for text
    .text( //content of text
      function() {
        var textPadding = '';
        if (vis3_dataset_pg[id * yearCount].Code == "SGP") {//if it is sgp

          textPadding = '(*)'; //notes for spg
          vis3_svg

            .append('text').attr('class', 'vis3_dots_country_highlight') //create text

            .attr('x', vis3_w + 13) //x pos
            .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20 + 20 + 20 + 25 + 35)// y pos
            .text("*: " + '2009 and 2010 figures are excluded.').attr('font-size', '12px'); //spg


        }
        return "Regression Line" + textPadding; //content of text

      }
    )
    .style('fill', vis3_color_array[id]).style('font-weight', 550); //bold style


  /*---------draw contries for legends----------*/

  vis3_svg

    .append('text')//create an text
    .attr('class', 'vis3_dots_country_highlight') //set class for text
    .attr('x', vis3_w + 13) //x pos
    .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20 + 20 + 15) //y pos
    .text("y = " + vis3_dataset_Rpg[id][0] + "x" + " + " +
      vis3_dataset_Rpg[id][1]).style('font-weight', 550).attr('font-size', '14px');
          //bold style, text content and text size


  /*---------draw R square for legends----------*/

  vis3_svg

    .append('text') //create an text
    .attr('class', 'vis3_dots_country_highlight') //set class for text
    .attr('x', vis3_w + 13) //set x pos text
    .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20 + 20 + 20 + 25) //set y for pos text
    .text("R square: " + vis3_dataset_Rpg[id][2]).style('font-weight', 550).attr('font-size', '14px');
    //bold style, text content and text size


  /*---------vis3: raise line----------*/

  //regression
  var lineid = '#vis3_line' + id;
  d3.select(lineid).style('stroke', vis3_color_array[id]) //CSS
    .style('stroke-width', 5) //width of line
    .style('fill', 'none') //no color for stroke
    .raise(); //raise it
  d3.selectAll('.vis3_dots_' + id).attr('r', 2).raise(); //raise dot point for hovered point as well

  /*---------vis3: draw country for each line----------*/

  vis3_svg

    .selectAll('vis3_dots_remove' + id) //locate the element at that vi3_dots_remove id
    .data('wow') //loop 1 time for 1 data

    .enter() //create an element
    .append('text') //create text
    .attr('class', 'vis3_dots_country_highlight') //set class for text
    .attr(
      'x', //set x position for text
      function() {
        if (vis3_dataset_pg[id * yearCount].Code == "OWID_WRL" || vis3_dataset_pg[id * yearCount].Code == "SGP") return vis3_xScale(+vis3_dataset_pg[(id + 1) * yearCount - 1].rshare) + 7; //custom display for sgp and world
        return vis3_xScale(+vis3_dataset_pg[(id + 1) * yearCount - 1].rshare) -
          15; //default x pos for text
      }
    ) //pie_h + 100
    .attr(
      'y', //set y attribute for text
      d =>
      vis3_yScale(+vis3_dataset_pg[(id + 1) * yearCount - 1].CO2) + 15 //scale for co2
    ) //(d,i) => 150 + i*(40)
    .text(vis3_dataset_pg[id * yearCount].Country) //print out name of hovered country.
    .style('fill', vis3_color_array[id]) //fill the color for country
    .attr('font-size', '15px'); //set font size 


}

function vis3_lineMouseOut(vis3_svg, vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, id) {
  var lineid = '#vis3_line' + id; //get the id for line

  d3.select(lineid).style('stroke', vis3_color_array[id]) //CSS
    .style('stroke-width', 2) //width of line
    .style('fill', 'none')
    .raise(); //set the stroke back to 2 with black solor stroke
  d3.selectAll(".vis3_dots_country_highlight").remove(); //remove highlight stroke for the country

  d3.selectAll('.vis3_dots_' + id).attr('r', 1).raise(); //raise doc points with circle's radius of 1

}

/*------------show x, y pairs according to mouse position-------------*/
function showXYPairs(vis3_svg, vis3_padding, vis3_h, vis3_w, vis3_dataset_pg) {

  var mouse_x, mouse_y; //set variable
  vis3_svg
    .on('mousemove', function() {
      mouse_x = d3.event.pageX; //get x position of mouse
      var rect = document.getElementById('chart3').getBoundingClientRect();
//get the rect that covers chart 3
      mouse_y = d3.event.pageY - vis3_padding - (rect.top + document.documentElement.scrollTop);
//get y position of mouse

      //console.log(rect.top  + document.documentElement.scrollTop, rect.right, rect.bottom, rect.left);
      while (!d3.select('.vis3_line').empty()) {//if there are still some previous boxes not being removed
        d3.select('.vis3_line').remove(); //remove all
      }
      mouse_x = mouse_x - 0.05 * w - vis3_padding + 8;
      if (mouse_x >= 0 && mouse_x <= vis3_w - 2 * vis3_padding && mouse_y >= 0 && mouse_y <= vis3_h - 2 * vis3_padding) { //if  the mouse hovers inside the graph
       

        //var pos_line = mouse_x / vis3_xScale.bandwidth;
        vis3_svg
          .selectAll(
            'vis3_line'
          ) /*select all rect even though they dont yet exist*/
          .data("wow") /*count + prepare data values*/
          .enter() /*create a new plce holder element for each bit of data*/
          .append('line') /* append a rect element to match each placeholder*/
          .attr('class', "vis3_line") //set class
          .attr('x1', function() {
            return mouse_x + vis3_padding;
          }) /* to scale value of x*/
          .attr('y1', vis3_padding) /* value of y - positions*/
          .attr('x2', function() {
            return mouse_x + vis3_padding;
          }) /* to scale value of x*/
          .attr('y2', vis3_h - vis3_padding)
          /* value of y - positions*/

          .style('stroke', 'black') //set color for line
          .style('stroke-width', 1).style("stroke-dasharray", 2); //set width for line

        vis3_svg
          .selectAll(
            'vis3_line_y'
          ) /*select all rect even though they dont yet exist*/
          .data("wow") /*count + prepare data values*/
          .enter() /*create a new plce holder element for each bit of data*/
          .append('line') /* append a rect element to match each placeholder*/
          .attr('class', "vis3_line") //set class
          .attr('x1', function() {
            return vis3_padding;
          }) /* to scale value of x*/
          .attr('y1', mouse_y + vis3_padding) /* value of y - positions*/
          .attr('x2', function() {
            return vis3_w - vis3_padding;
          }) /* to scale value of x*/
          .attr('y2', mouse_y + vis3_padding)
          /* value of y - positions*/

          .style('stroke', 'black') //set color for line
          .style('stroke-width', 1).style("stroke-dasharray", 2); //set width for line

       

        vis3_svg
          .append("rect") //create rect
          .attr('class', "vis3_line") //set class
          .attr("x", function() { //set x for box carrying coordinates
            if (mouse_x >= vis3_w - 2 * vis3_padding - 100) return mouse_x + vis3_padding - 110;
            return mouse_x + vis3_padding + 5; //if the mouse hovers near the border
          })
          .attr("y", mouse_y + vis3_padding - 25)//set y for box carrying coordinates
          .attr("height", 20)//set height for box carrying coordinates
          .attr("width", 95) //set width for box carrying coordinates
          .style("fill", function() {
            if (vis3_XYboxOpacity == '1.0')
              return 'orange'; //if the mouse overs at one point -> orange color for background color
            return '#D3D3D3'; //otherwise, grey color applies
          })
          .style("opacity", vis3_XYboxOpacity) //set opacity of coordinates
          .style("stroke", "black"); //set stroke color to black


        vis3_svg
          .append('text') /* append a rect element to match each placeholder*/
          .attr('class', "vis3_line") //set class
          .attr('x', function() {
            if (mouse_x >= vis3_w - 2 * vis3_padding - 100) return mouse_x + vis3_padding - 110;
            return mouse_x + vis3_padding + 6; //set pos of x
          }) /* to scale value of x*/
          .attr('y', mouse_y + vis3_padding - 10) //set position of y
          /* value of y - positions*/
          .text(function() {

            if (vis3_XYboxOpacity == '1.0') //if the mouse hovers at one point
              return '(' + (Math.round(vis3_currentPoint[0] * 100) / 100) + ',' + (Math.round(vis3_currentPoint[1] * 100) / 100) + ')'; //return the exact pairs of value of array


            var tmp_x = Math.round(//position of mouse x

              ((mouse_x) / 
                (vis3_w - 2 * vis3_padding) *
                (d3.max(vis3_dataset_pg, function(d) {
                    return +d.rshare;//max rshare in the array
                  }) -
                  d3.min(vis3_dataset_pg, function(d) {

                    return +d.rshare;//min rshare in the array
                  })


                ) +
                d3.min(vis3_dataset_pg, function(d) {
                  return +d.rshare; //min rshare in the array
                })
              ) * 100) / 100;//round with 2 demimal after doc

            var tmp_y = Math.round( //round manth

              ((vis3_h - 2 * vis3_padding - mouse_y) / //value of y
                (vis3_h - 2 * vis3_padding) * //value of whole range
                (d3.max(vis3_dataset_pg, function(d) {
                    return +d.CO2; //max co2 in the array
                  }) -
                  d3.min(vis3_dataset_pg, function(d) {
                    return +d.CO2; //min co2 in the array
                  })


                ) +
                d3.min(vis3_dataset_pg, function(d) {
                  return +d.CO2;  //min co2 in the array
                })
              ) * 100) / 100; //round with 2 demimal after doc

            return '(' + tmp_x + ',' + tmp_y + ')';//coordinate of x,y

          });

      }


    });




}

/*------------show x, y pairs according to mouse position-------------*/



/*-----------------vis3: filter year and country -------------------------*/
function vis3_loadYearFilter() {
  const vis3_year_s = document.getElementById('vis3_year_s').value;
  //get the staring year from user's input
  const vis3_year_e = document.getElementById('vis3_year_e').value;
//get the ending year from user's input

  return [parseInt(vis3_year_s), parseInt(vis3_year_e)]; //return couple of value

}
//-----------


/*-----------------vis3: filter year -------------------------*/
/*------Vis3-----------*/


function vis1_popUp() {
  var popup = document.getElementById("vis1_myPopup");//get i icon 
  popup.classList.toggle("show");//show context for vis 1
}

function vis2_popUp() {
  var popup = document.getElementById("vis2_myPopup");//get i icon 
  popup.classList.toggle("show");//show context for vis 2
}

function vis3_popUp() {
  var popup = document.getElementById("vis3_myPopup");//get i icon 
  popup.classList.toggle("show"); //show context for vis 3
}
