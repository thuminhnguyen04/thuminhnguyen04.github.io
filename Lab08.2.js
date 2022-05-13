var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
  h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.6;

var pie_w = h / 2; //set width and height for svg
var pie_h = pie_w;
var year;
var emptyArray = [];
var pie_dataset = [];
var pie_color = d3.scaleOrdinal(d3.schemeCategory10); //d3 native scheme

var color_range = [
  '#feebe2', //grey
  '#fbb4b9',
  '#f768a1',
  '#c51b8a',
  '#7a0177',
];
var color = d3.scaleQuantize().range(color_range); //white
var svg;

function init() {
  //Define quantize scale to sort data values into saturation of color
  vis2_execution();

  svg = d3
    .select('#chart')
    .append('svg')
    .style('cursor', 'move')
    .style('color', 'grey');
  svg
    .attr('viewBox', '5 1 ' + w + ' ' + h)
    .attr('preserveAspectRatio', 'xMinYMin');

  //.attr("width", w)
  //.attr("height", h)
  //.attr("fill","grey"); //the area which is not the file will be colored the default color - grey

  var zoom = d3.zoom().on('zoom', function() {
    var transform = d3.zoomTransform(this);
    map.attr('transform', transform);
  });
  svg.call(zoom);

  var map = svg.append('g').attr('class', 'map');

  /*-------------Legends-----------------
  const new_stack = ["Recycling", "Energy recovery" , "Disposal", "m","m"];

  var size = 20;
  svg.selectAll("chart1_dots")
      .data(new_stack)
      .enter()
      .append("circle")
      .attr("cx", 3*w/4 - 20)
      .attr("cy", (d,i) => 24 + i*(size)) 
      .attr("r", 7)
      .style("fill", (d,i) => color_range[i]);

  // Add one dot in the legend for each name.
  svg.selectAll("chart1_labels")
      .data(new_stack)
      .enter()
      .append("text")
      .attr("x", 3*w/4)
      .attr("y", (d,i) => 22 + i*(size)) 
      .text(d => d)
      .style("fill", (d, i) => color_range[i])
      .attr("text-anchor", "left")
      .style("alignment-baseline", "middle");



  //Create a legend for the graph
  svg
  .append("rect")
  .attr("x",3*w/4 - 10)
  .attr("y", 42)
  .attr("height", color_range.length * 24)
  .attr("width", 7*17)
  .style("fill", "none")
  .style("stroke", "black");

  var size = 20;
  	svg.selectAll("chart1_labels")
     	 .data(color_range)
      	.enter()
      	.append("rect")
      	.attr("x", 3*w/4)
      	.attr("y", (d,i) => 55 + i*(size)) 
  	.attr('width', 7).attr('height', 7 ).attr('stroke', 'black')
        	.style("fill", (d, i) => color_range[i]);

  var chart1_legends = ["0-340 TWh","340-680 TWh","680-1020 TWh","1020-1360 TWh","1360-1700 TWh"];
  	svg.selectAll("chart1_legends")
      	.data(chart1_legends)
      	.enter()
  	.append("text")
  	.attr("x", 3*w/4 + 12)
  	.attr("y", (d,i) => 65 + i*(size))
  	.text(d => d)
  	.style("font-size", "15px");

  svg
  	.append("text")
  	.attr("x", 3*w/4 - 10)
  	.attr("y", 22)
  	.text("Legends")
  	.style("font-size", "20px")
  	.attr("alignment-baseline","middle")
  	.style("font-weight",1000);
  	

  -------------Legends-----------------*/





  //Create a legend for the graph
  svg
    .append("rect")
    .attr("x", 3 * w / 4 - 10)
    .attr("y", 42)
    .attr("height", color_range.length * 18)
    .attr("width", 7 * 32)
    .style("fill", "none")
    .style("stroke", "black");

  var size = 20;
  svg.selectAll("chart1_labels")
    .data(color_range)
    .enter()
    .append("rect")
    .attr("x", (d, i) => 3 * w / 4 + 40 * i)
    .attr("y", 55)
    .attr('width', 40)
    .attr('height', 15).attr('stroke', 'black')
    .style("fill", (d, i) => color_range[i]);

  var chart1_legends = [0, 1, 2, 3, 4, 5];

  svg.selectAll("chart1_labels")
    .data(chart1_legends)
    .enter()
    .append("text")
    .attr("x", d => 3 * w / 4 + 36 * d - 3)
    .attr("y", 90)
    .text(d => 340 * d)
    .style("font-size", "15px");

  svg
    .append("text")
    .attr("x", 3 * w / 4 - 10)
    .attr("y", 22)
    .text("Legends")
    .style("font-size", "20px")
    .attr("alignment-baseline", "middle")
    .style("font-weight", 1000);

  svg
    .append("text")
    .attr("x", 3 * w / 4 + 80)
    .attr("y", 115)
    .text("Unit: Terawatt hours")
    .style("font-size", "15px");




  /*------------------Legends------------*/
  executeMap(map);
  filterYear(map);
}

//------------------------
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
    console.log(d3.entries(data[year])[2].value);
    for (let i = 0; i < 9; i++) {
      emptyArray.push(parseFloat(d3.entries(data[year])[1 + i].value));
    }

    color.domain([
      0, 1700,
      // d3.min(emptyArray), //min for unemployed list value
      // d3.max(emptyArray), //max for unemployed list value
    ]);
    console.log(color);
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
        .attr('stroke', 'white')
        .attr('id', function(d, i) {
          return 'path' + (i + 1); // d.properties.STATE_NAME;
        })
        .style('fill', function(d, i) {
          return color(emptyArray[i]);
          //get data value, just for convenience in processing
          /*var value = d.properties.value;
          if (value) {
            //If value exists, fill the color for that area by the corresponding color
            return color(value);
          } else {
            return '#ffd8d8';
          }*/
        })
        .on('mouseover', function(d, i) {
          //Raise the state/territory and colour stroke red
				for (let m=0;m<=10;m++)
        {
        }

          d3.select(this)
            .attr('stroke', 'green')
            .attr('stroke-width', '1px')
            .raise();

          if (this.id == 'path1') {
            d3.select('#path8')
              .attr('stroke', 'white')
              .attr('stroke-width', '1px')
              .raise();
          }

          if (this.id == 'path8') {
            d3.select('#text8').remove();
          }
          d3.select('#tooltop_nondata').remove();
          var remove_name = '#text' + d.properties.STATE_CODE;
          d3.select(remove_name).remove();


          d3.select('.details').style('visibility', 'visible');

          map
            .append('text')
            .attr('class', 'tooltip1')
            .attr('fill', 'black')
            .attr('transform', 'translate(' + path.centroid(d) + ')')
            .attr('text-anchor', 'middle')
            .attr('dy', 15)
            .text(function(d) {
              if (emptyArray[i] == 0) return "!";
              else return emptyArray[i];
            })
            //.text(d.properties.STATE_NAME + " \r\n" + emptyArray[i])
            .style('font-size', '20px');

          /*-----------Pie chart ----------------------*/

          //random dataset with 5 - 10 numbers: 6 numbers
          pie_dataset = [];
         
          if (+d.properties.STATE_CODE <= 7) {

            /*--------Read file----------*/
            d3.csv('data/Chart' + d.properties.STATE_CODE + '.csv').then(function(
              data
            ) {
              pie_dataset = [];

              //Set input domain for color scale
              for (let i = 1; i <= 2; i++) {
                pie_dataset.push(parseFloat(d3.entries(data[year - 10])[i].value));
              }


              /*--------Read file----------*/

              var outerRadius = pie_h / 2; //radius w/2 --> d=w
              var innerRadius = 0; //circle, not donut --> inner radius 0
              var arc = d3
                .arc() //create angles for circle, segments of the pie chart
                .innerRadius(innerRadius) //set innerRadius
                .outerRadius(outerRadius); //set outterRadius
              while (!d3.select('.meme').empty()) {
                console.log(d3.select('.meme').empty());
                d3.select('.meme').remove();

              }


              var pie = d3.pie(); //pie chart

              //set up SVG canvas
              var pie_svg = d3
                .select('#chart1_pie')
                .append('svg')
                .attr('width', pie_w)
                .attr('height', pie_h).attr('class', "meme");

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
                .attr('class', 'tooltip3').transition().duration(1000)
                .attr('fill', function(d, i) {
                  return pie_color(i); //use color scale --> each segment has each distinguish color
                })
                .attr(
                  'd',
                  function(d, i) {
                    return arc(d, i);
                  } //call arc segment
                );

              var pie_legends = d3
                .select('#chart1_pie_legends')
                .append('svg')
                .attr('width', 450)
                .attr('height', 35).attr('class', "meme");
              pie_legends.selectAll('dotsss')
                .data(['non-renewable energy', 'renewable energy (Unit: GWh)'])
                .enter()
                .append("circle")
                .attr("cx", (d, i) => 220 * i + 10) //pie_h + 100
                .attr("cy", 20) //(d,i) => 150 + i*(40)
                .attr("r", 10)
                .style("fill", (d, i) => pie_color(i));

              pie_legends.selectAll('legendssss')
                .data(['non-renewable energy', 'renewable energy (Unit: GWh)'])
                .enter()
                .append("text")
                .attr("x", (d, i) => 220 * i + 25) //pie_h + 100
                .attr("y", 28) //(d,i) => 150 + i*(40)
                .attr("font-size", "15px")
                .text(d => d);


              //add label text
              arcs
                .append('text') //pie generator generates an array containing all path data and data value
                .attr('class', 'tooltip3')

                .text(function(d) {
                  return d.value;
                }) //to access the value inside an array
                .attr('transform', function(d) {
                  console.log(arc.centroid(d));
                  return 'translate(' + (arc.centroid(d)[0] - 26) + ',' + arc.centroid(d)[1] + ')';
                }).attr('font-size', '20px'); //by default, text is displayed at the centroid of the chart
              // -> transform + arc.centroid to find the middle of an irregular shape.
              /*-----------Pie chart ----------------------*/

            }).catch(function(error) {
 while (!d3.select('.meme').empty()) {
            d3.select('.meme').remove();


          }
              console.log(error);
            });
          } else {
 while (!d3.select('.meme').empty()) {
            d3.select('.meme').remove();


          }
            console.log("No data");
            d3.select('.females').append("text").attr("id", "tooltop_nondata").text("no data");

          };
          //----------------------


          d3.select('.country').text("Energy generation in " + d.properties.STATE_NAME);



          //if (this.id == 'path8') {
          //}





          //-----------
        })

        .on('mouseout', function(d) {
          d3.select(this).attr('stroke', 'white').attr('stroke-width', '1px');

          d3.select('.tooltip1').remove();

          map
            .append('text')
            .attr('fill', 'black')
            .attr('transform', 'translate(' + path.centroid(d) + ')')
            .attr('text-anchor', 'middle')
            .attr('dy', 15)
            .attr('id', 'text' + d.properties.STATE_CODE)
            .text(d.properties.STATE_NAME)
            .style('font-size', '12px');


        });

      map
        .selectAll('g.state')
        .data(json.features)
        .enter()
        .append('g')
        .classed('state', true)
        .append('text')
        .attr('id', function(d) {
          return 'text' + d.properties.STATE_CODE;
        })

        .attr('fill', 'black')
        .attr('transform', function(d) {
          return 'translate(' + path.centroid(d) + ')';
        })
        .attr('text-anchor', 'middle')
        .attr('dy', 15)
        .text(function(d) {
          return d.properties.STATE_NAME;
        })
        .style('font-size', '12px');

      //----
      //-----
    });
  });
}

//-----------------------
//-------------
function filterYear(map) {
  const select = document.getElementById('map1_select_year');

  select.addEventListener('change', function handleChange(event) {
    console.log(event.target.value); // ??? get selected VALUE
    year = parseInt(event.target.value) - 1999;
    // ??? get selected VALUE even outside event handler
    console.log(select.options[select.selectedIndex].value);

    // ??? get selected TEXT in or outside event handler
    console.log(select.options[select.selectedIndex].text);

    /*------------ Update color --------*/
    d3.csv('data/Map_V4.csv').then(function(data) {
      //Set input domain for color scale
      emptyArray = [];
      for (let j = 1; j <= 9; j++) {
        emptyArray.push(
          parseFloat(
            d3.entries(data[parseInt(event.target.value) - 1999])[j].value
          )
        );
      }
      for (let i = 1; i <= 9; i++) {
        var currentPath = '#path' + i;
        d3.select(currentPath)
          .transition()
          .duration(1000)
          .style('fill', color(emptyArray[i - 1]));
      }
    });

    /*------------ Update color --------*/
  });
}
//-----------


/*-------------On Click for hide --------------*/
function hideButton() {

  d3.select('.details').transition().style("visibility", "hidden");

  while (!d3.select('.meme').empty()) {
    d3.select('.meme').remove();

  }

}
/*-------------On Click for hide --------------*/
window.onload = init;


//Visualisation 2


function vis2_execution() {


  var vis2_dataset = []; //creating an empty array

  //read data
  d3.csv('data/Vis2_V1.csv').then(function(data) {
    //Set input domain for color scale
    vis2_dataset = [];
    for (let j = 0; j < data.length; j++) {
      //   parseFloat(d3.entries(data[parseInt(event.target.value) - 1999])[j].value)

      //console.log( d3.entries(data)[j].value);
      vis2_dataset.push(d3.entries(data)[j].value);
    }






    //read data
    var vis2_w = w / 2;
    var vis2_padding = 30;
    var vis2_maxValue = 25; // set max value for column	
    var vis2_numDataPoints = 20; //number of points
    var vis2_range = Math.random() * 1000; //range of data, random() will return double value from 0 to 1


    /*for (var i = 0; i < vis2_numDataPoints; i++) {
      vis2_dataset.push(Math.floor(Math.random() * vis2_maxValue));
    } // add data to the array*/

    var vis2_xScale = d3.scaleBand() //generate an ordinal scale for x-axis
      //normally domain(["high","med","low"])
      .domain(d3.range(vis2_dataset.length)) //calculate the range of the domain
      .rangeRound([vis2_padding, vis2_w - vis2_padding]) // specify the size of the range the domain needs to be mapped 
      // round the bandwidths to whole number	
      .paddingInner(0.05); // to generate a padding value of 5% of the bandwidth

    var vis2_yScale = d3.scaleLinear() //quantitative data
      .domain([
        0,
        1100
      ]) //domain of y
      .range([h - vis2_padding, vis2_padding]) // specify the size of the range the domain needs to be mapped 
    // round the bandwidths to whole number	
    // range of y 




    var vis2_svg = d3.select("#chart2")
      .append("svg")
      .attr("width", vis2_w)
      .attr("height", h);

    var vis2_xAxis = d3.axisBottom()
      .ticks(vis2_dataset.length) /*controlling the tick* - interval */
      .scale(vis2_xScale).tickFormat(i => vis2_dataset[i].Technology);

    var vis2_yAxis = d3.axisLeft()
      .ticks(10) /*controlling the tick* - interval */
      .scale(vis2_yScale);



    vis2_svg.selectAll("rect") /*select all rect even though they dont yet exist*/
      .data(vis2_dataset) /*count + prepare data values*/
      .enter() /*create a new plce holder element for each bit of data*/
      .append("rect") /* append a rect element to match each placeholder*/
      .attr("x", function(d, i) {
        return vis2_xScale(i);
      }) /* to scale value of x*/
      .attr("y", function(d) {
        console.log(d.Mean);
        return vis2_yScale(d.Mean);
      }) /* value of y - positions*/
      .attr("width", vis2_xScale.bandwidth()) /* barpadding to create space bw each column*/
      .attr("height", function(d) {
        return h - vis2_padding - vis2_yScale(d.Mean);
      }) /* extend the height for an easy look*/
      .attr("fill", function(d) {if (+d.Mean>200) return "red"; return "green";})
	.on("mouseover", function(d, i ) { //when the mouse hovers
			   		d3.select(this)
			   			.attr("fill", "orange"); //that column turns orange
					
					//get bar position
					var xPosition = parseFloat(d3.select(this).attr("x"))+ vis2_xScale.bandwidth() / 2 - 7;
					var yPosition = parseFloat(d3.select(this).attr("y")) + 30;
			

					vis2_svg.append("text")
					   .attr("id", "vis2_tooltip")
					   .attr("x", xPosition - (d.Mean.length/2)*4)
					   .attr("y", function (){ if (yPosition > h - vis2_padding) return yPosition - 35; return yPosition;})
					   .attr("font-weight", "bold")
					   .text(d.Mean);
			})
	.on("mouseout", function() { //when the mouse no longer hovers
				   d3.select(this)
						.transition() //smoother
						.delay(100)
						.duration(1000)
						.attr("fill", function(d) {if (+d.Mean>200) return "red"; return "green";}); //that column turns back to default color
					d3.select("#vis2_tooltip").remove(); //remove value of column when mouse no longer hovers
		});
    /* shape color*/

    vis2_svg.append("g")
      .attr("transform", "translate(0," + (h - vis2_padding) + ")") //position for x axis
      .call(vis2_xAxis); //draw x axis

    vis2_svg.append("g")
      .attr("class", "y axis") //assign class for y axis
      .attr("transform", "translate(" + vis2_padding + ",0)") //position for y axis
      .call(vis2_yAxis); //draw y axis

// Legendssssssssss

              vis2_svg.selectAll('dotsss')
                .data(['non-renewable energy', 'renewable energy (Unit: GWh)'])
                .enter()
                .append("circle")
                .attr("cx", (d, i) => vis2_w - vis2_padding - 100) //pie_h + 100
                .attr("cy", (d,i) => 50 + 30*i) //(d,i) => 150 + i*(40)
                .attr("r", 8)
                .style("fill", function(d,i) {if (i==1) return "green"; return "red";});

              vis2_svg.selectAll('legendssss')
                .data(['non-renewable energy', 'renewable energy'])
                .enter()
                .append("text")
                .attr("x", vis2_w - vis2_padding + 20 -100) //pie_h + 100
                .attr("y", (d, i) => 55 + 30 * i) //(d,i) => 150 + i*(40)
                .attr("font-size", "12px")
                .text(d => d);




//Legends





  });






}





// Visualisation 2
