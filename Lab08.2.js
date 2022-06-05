var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
  h =
  Math.max(document.documentElement.clientHeight, window.innerHeight || 0) *
  0.6;
var vis3_currentPoint;
var vis3_XYboxOpacity = '0.5';
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
  vis3_execution();
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
  	.style("font-weight",800);
  	

  -------------Legends-----------------*/

  //Create a legend for the graph
  svg
    .append('rect')
    .attr('x', (3 * w) / 4 - 10)
    .attr('y', 42)
    .attr('height', color_range.length * 18)
    .attr('width', 7 * 32)
    .style('fill', 'none')
    .style('stroke', 'black');

  var size = 20;
  svg
    .selectAll('chart1_labels')
    .data(color_range)
    .enter()
    .append('rect')
    .attr('x', (d, i) => (3 * w) / 4 + 40 * i)
    .attr('y', 55)
    .attr('width', 40)
    .attr('height', 15)
    .attr('stroke', 'black')
    .style('fill', (d, i) => color_range[i]);

  var chart1_legends = [0, 1, 2, 3, 4, 5];

  svg
    .selectAll('chart1_labels')
    .data(chart1_legends)
    .enter()
    .append('text')
    .attr('x', d => (3 * w) / 4 + 36 * d - 3)
    .attr('y', 90)
    .text(d => 340 * d)
    .style('font-size', '15px');

  svg
    .append('text')
    .attr('x', (3 * w) / 4 - 10)
    .attr('y', 22)
    .text('Legends')
    .style('font-size', '20px')
    .attr('alignment-baseline', 'middle')
    .style('font-weight', 1000);

  svg
    .append('text')
    .attr('x', (3 * w) / 4 + 80)
    .attr('y', 115)
    .text('Unit: Terawatt hours')
    .style('font-size', '15px');

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
    for (let i = 0; i < 9; i++) {
      emptyArray.push(parseFloat(d3.entries(data[year])[1 + i].value));
    }

    color.domain([
      0, 1700,
      // d3.min(emptyArray), //min for unemployed list value
      // d3.max(emptyArray), //max for unemployed list value
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
        .attr('stroke', 'white')
        .attr('id', function(d, i) {
          return 'path' + (i + 1); // d.properties.STATE_NAME;
        })
        .style('font-weight', 600)
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
          for (let m = 0; m <= 10; m++) {}

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
              if (emptyArray[i] == 0) return '!';
              else return emptyArray[i];
            })
            .style('font-weight', 600)
            //.text(d.properties.STATE_NAME + " \r\n" + emptyArray[i])
            .style('font-size', '20px');

          /*-----------Pie chart ----------------------*/

          //random dataset with 5 - 10 numbers: 6 numbers
          pie_dataset = [];

          if (+d.properties.STATE_CODE <= 7) {
            /*--------Read file----------*/
            d3.csv('data/Chart' + d.properties.STATE_CODE + '.csv')
              .then(function(data) {
                pie_dataset = [];

                //Set input domain for color scale
                for (let i = 1; i <= 2; i++) {
                  pie_dataset.push(
                    parseFloat(d3.entries(data[year - 10])[i].value)
                  );
                }

                /*--------Read file----------*/

                var outerRadius = pie_h / 2; //radius w/2 --> d=w
                var innerRadius = 0; //circle, not donut --> inner radius 0
                var arc = d3
                  .arc() //create angles for circle, segments of the pie chart
                  .innerRadius(innerRadius) //set innerRadius
                  .outerRadius(outerRadius); //set outterRadius
                while (!d3.select('.meme').empty()) {
                  d3.select('.meme').remove();
                }

                var pie = d3.pie(); //pie chart

                //set up SVG canvas
                var pie_svg = d3
                  .select('#chart1_pie')
                  .append('svg')
                  .attr('width', pie_w)
                  .attr('height', pie_h)
                  .attr('class', 'meme');

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
                  .attr('class', 'tooltip3')
                  .transition()
                  .duration(1000)
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
                  .attr('height', 35)
                  .attr('class', 'meme');


                pie_legends
                  .selectAll('dotsss')
                  .data([
                    'non-renewable energy',
                    'renewable energy (Unit: GWh)',
                  ])
                  .enter()
                  .append('circle')
                  .attr('cx', (d, i) => 180 * i + 10) //pie_h + 100
                  .attr('cy', 20) //(d,i) => 150 + i*(40)
                  .attr('r', 10)
                  .style('fill', (d, i) => pie_color(i));

                pie_legends
                  .selectAll('legendssss')
                  .data([
                    'non-renewable energy',
                    'renewable energy (Unit: GWh)',
                  ])
                  .enter()
                  .append('text')
                  .attr('x', (d, i) => 180 * i + 25) //pie_h + 100
                  .attr('y', 28) //(d,i) => 150 + i*(40)
                  .attr('font-size', '12px')
                  .text(d => d);

                //add label text
                arcs
                  .append('text') //pie generator generates an array containing all path data and data value
                  .attr('class', 'tooltip3')

                  .text(function(d) {
                    return d.value;
                  }) //to access the value inside an array
                  .attr('transform', function(d) {
                    return (
                      'translate(' +
                      (arc.centroid(d)[0] - 18) +
                      ',' +
                      arc.centroid(d)[1] +
                      ')'
                    );
                  })
                  .attr('font-size', '12px')
                  .style('font-weight', 700); //by default, text is displayed at the centroid of the chart
                // -> transform + arc.centroid to find the middle of an irregular shape.
                /*-----------Pie chart ----------------------*/
              })
              .catch(function(error) {
                while (!d3.select('.meme').empty()) {
                  d3.select('.meme').remove();
                }
              });
          } else {
            while (!d3.select('.meme').empty()) {
              d3.select('.meme').remove();
            }
            d3.select('.females')
              .append('text')
              .attr('id', 'tooltop_nondata')
              .text('no data');
          }
          //----------------------

          d3.select('.country').text(
            'Energy generation in ' + d.properties.STATE_NAME
          );

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
            .style('font-weight', 600)
            .style('font-size', '10px');
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
        .style('font-weight', 600)
        .style('font-size', '10px');

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
    year = parseInt(event.target.value) - 1999;
    // ??? get selected VALUE even outside event handler

    // ??? get selected TEXT in or outside event handler

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
  d3.select('.details').transition().style('visibility', 'hidden');

  while (!d3.select('.meme').empty()) {
    d3.select('.meme').remove();
  }
}
/*-------------On Click for hide --------------*/
function sleep(ms) {
		return new Promise(resolve => setTimeout(resolve, ms));
	}
/*-------------Vis 1: Animation-----------------*/
async function vis1_animation()
{
  
/*------------ Update color --------*/
    d3.csv('data/Map_V4.csv').then(async function(data) {
      //Set input domain for color scale
      
      for (let i=2009;i<2020;i++)
        {
          document.getElementById('map1_select_year').value = i;

                emptyArray = [];

          for (let j = 1; j <= 9; j++) {
        emptyArray.push(
          parseFloat(d3.entries(data[i - 1999])[j].value)
        );
            
      var currentPath = '#path' + j;
        d3.select(currentPath)
          .transition()
          .duration(1000)
          .style('fill', 
                 
                function()
                 {
                  
                   return color(emptyArray[j - 1]);
                     
                 }
                   );
          }
          await sleep(1000);


            //sleep


            //sleep

            
        //  .attr('id',"currentstroke")
     /*     
                    d3.select(currentPath)
                      .transition()
                      .duration(1000)
                      .attr('stroke', 'green')
            .attr('stroke-width', '1px')
            .raise();*/

            
          
      }
      
      
    });

    /*------------ Update color --------*/
    
}
/*-------------Vis 1: Animation-----------------*/

window.onload = init;







//Visualisation 2
var vis2_dataset_f;

function vis2_execution() {
  vis2_dataset_f = []; //creating an empty array

  //read data
  d3.csv('data/Vis2_V1.csv').then(function(data) {
    //Set input domain for color scale
    vis2_dataset_f = [];
    for (let j = 0; j < data.length; j++) {
      //   parseFloat(d3.entries(data[parseInt(event.target.value) - 1999])[j].value)

      vis2_dataset_f.push(d3.entries(data)[j].value);
    }

    applyFilter();
  });
}



// Visualisation 2
//button handle

function goFilter() {
  var flag = true;
  var energyList = [
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
    filter[i] = document.getElementById(energyList[i]).checked;
    flag = flag & !filter[i];
  }
  if (flag) resetFilter();
  else applyFilter();
}
var filter = [];
for (let i = 0; i < 9; i++) {
  filter.push(1);
}

function resetFilter() {
  var energyList = [
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
    document.getElementById(energyList[i]).checked = 1;
    filter[i] = 1;
  }
  applyFilter();
}

function applyFilter() {
  var vis2_dataset_pg = [];
  for (let i = 0; i < vis2_dataset_f.length; i++) {
    if (filter[i]) vis2_dataset_pg.push(vis2_dataset_f[i]);
  }

  //read data
  var vis2_w = w * 0.5;
  var vis2_h =
    Math.max(document.documentElement.clientHeight, window.innerHeight || 0) *
    0.8;
  var vis2_padding = 70;

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

  d3.select('#vis2_id').remove();

  var vis2_svg = d3
    .select('#chart2')
    .append('svg')
    .attr('width', vis2_w)
    .attr('height', vis2_h)
    .attr('id', 'vis2_id');

  //Create "Year" on  X axis
  vis2_svg
    .append('text')
    .attr('x', vis2_w / 2 - 20)
    .attr('y', vis2_h - 15)
    .attr('text-anchor', 'middle')
    .style('font-size', '15px')
    .text('Type of energy');

  //Create "Food waste per capita (kg/year)" on Y Axis
  vis2_svg
    .append('text')
    .attr('x', -(vis2_h / 2))
    .attr('y', vis2_padding - 35)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(270)')
    .style('font-size', '15px')
    .text('Tonnes/GWh of CO2 emission');

  var vis2_xAxis = d3
    .axisBottom()
    .ticks(vis2_dataset_pg.length) /*controlling the tick* - interval */
    .scale(vis2_xScale)
    .tickFormat(i => vis2_dataset_pg[i].Technology);

  var vis2_yAxis = d3
    .axisLeft()
    .ticks(8) /*controlling the tick* - interval */
    .scale(vis2_yScale);

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
      var xPosition =
        parseFloat(d3.select(this).attr('x')) + vis2_xScale.bandwidth() / 2 - 7;
      var yPosition = parseFloat(d3.select(this).attr('y')) + 30;

      vis2_svg
        .append('text')
        .attr('class', 'vis2_tooltip')
        .attr('x', function() {
            if (+d.Mean <= 200)
              return xPosition + 10;
            return xPosition - (d.Mean.length / 2) * 4;
          }

        )
        //;function (){ if (positionOfText == "green") return xPosition + 10; return xPosition - (d.Mean.length/2)*4;})
        .attr('y',
          function() {
            if (+d.Mean <= 200)
              return yPosition - 30;
            return vis2_yScale(d.Low) + 35;
          }

        ) //vis2_h - vis2_padding + 32) //function (){ console.log(+d.Low + 50); if (positionOfText == "green") return yPosition - 35; return vis2_yScale(d.Low) +35;})
        .attr('font-weight', 'bold')
        .text(d.Mean);


      vis2_svg
        .append('text')
        .attr('class', 'vis2_tooltip')
        .attr('x', xPosition - d.Mean.length * 7) //;function (){ if (positionOfText == "green") return xPosition + 10; return xPosition - (d.Mean.length/2)*4;})
        .attr('y', vis2_yScale(d.High) - 5) //vis2_yScale(d.Low) +35)//function (){ console.log(+d.Low + 50); if (positionOfText == "green") return yPosition - 35; return vis2_yScale(d.Low) +35;})
        .attr('font-weight', 'bold')
        .attr("font-size", "12px")
        .text("L:" + d.Low + " H:" + d.High);

      /*vis2_svg
              .append('text')
              .attr('class', 'vis2_tooltip')
              .attr('x', 
      	) //;function (){ if (positionOfText == "green") return xPosition + 10; return xPosition - (d.Mean.length/2)*4;})
              .attr('y', function() 
      		{
      			if (+d.Mean <= 200) 
      				return vis2_yScale(d.Low) - 5; 
      			return vis2_yScale(d.Low) + 15;}) //vis2_yScale(d.Low) +35)//function (){ console.log(+d.Low + 50); if (positionOfText == "green") return yPosition - 35; return vis2_yScale(d.Low) +35;})
              .attr('font-weight', 'bold')
              .text(d.Low);*/


    })
    .on('mouseout', function() {
      //when the mouse no longer hovers
      d3.select(this)
        .transition() //smoother
        .delay(100)
        .duration(1000)
        .attr('fill', function(d) {
          if (+d.Mean > 200) return 'red';
          return 'green';
        }); //that column turns back to default color
      while (!d3.select('.vis2_tooltip').empty()) {
        d3.select('.vis2_tooltip').remove();
      }
      //remove value of column when mouse no longer hovers
    });
  /* shape color*/
  //set up axis
  vis2_svg
    .append('g')
    .attr('transform', 'translate(0,' + (vis2_h - vis2_padding) + ')') //position for x axis
    .call(vis2_xAxis); //draw x axis

  vis2_svg
    .append('g')
    .attr('class', 'y axis') //assign class for y axis
    .attr('transform', 'translate(' + vis2_padding + ',0)') //position for y axis
    .call(vis2_yAxis); //draw y axis
  // set up axis
  // Legendssssssssss

  //Create a legend for the graph
  vis2_svg
    .append('rect')
    .attr('x', (3 * vis2_w) / 4 - 10)
    .attr('y', 42)
    .attr('height', 4 * 18)
    .attr('width', 155)
    .style('fill', 'none')
    .style('stroke', 'black');


  vis2_svg
    .append('text')
    .attr('x', (3 * vis2_w) / 4 - 10)
    .attr('y', 22)
    .text('Legends')
    .style('font-size', '20px')
    .attr('alignment-baseline', 'middle')
    .style('font-weight', 1000);



  /*------------------Legends------------*/
  vis2_svg
    .selectAll('dotsss')
    .data(['non-renewable energy', 'renewable energy (Unit: GWh)'])
    .enter()
    .append('circle')
    .attr('cx', (d, i) => (3 * vis2_w) / 4 + 5) //pie_h + 100
    .attr('cy', (d, i) => 60 + 30 * i) //(d,i) => 200 + i*(40)
    .attr('r', 8)
    .style('fill', function(d, i) {
      if (i == 1) return 'green';
      return 'red';
    });

  vis2_svg
    .selectAll('legendssss')
    .data(['non-renewable energy', 'renewable energy'])
    .enter()
    .append('text')
    .attr('x', (3 * vis2_w) / 4 + 20) //pie_h + 100
    .attr('y', (d, i) => 60 + 5 + 30 * i) //(d,i) => 200 + i*(40)
    .attr('font-size', '12px')
    .text(d => d);

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

/*------Vis3-----------*/
var vis3_dataset_f = [];
var vis3_dataset_Rf = [
  [-0.1709, 19.6374, 0.9287, 'very strong inverse relationship'],
  [-0.07672, 11.6977, 0.7867, 'very strong inverse relationship'],
  [-0.5622, 13.19, 0.8916, 'very strong inverse relationship'],
  [-0.05071, 6.019, 0.8206, 'very strong relationship']
];
 var vis3_year_s =0;
 var vis3_year_e =0;
function vis3_execution() {
  //13 records/region
  //read data


  d3.csv('data/Vis3_V3.csv').then(function(data) {

    //Set input domain for color scale
    for (let j = 0; j < data.length; j++) {
      //   parseFloat(d3.entries(data[parseInt(event.target.value) - 1999])[j].value)

      vis3_dataset_f.push(d3.entries(data)[j].value);
    }
    vis3_year_s = vis3_loadYearFilter()[0];
    vis3_year_e = vis3_loadYearFilter()[1];
    vis3_applyFilter();
  });
}
 var vis3_dataset_Rpg = [];
var yearCount = 0;

function vis3_applyFilter() {
  var vis3_w = w * 0.7;
  var vis3_h = h;
  var vis3_dataset_pg = [];

  
yearCount = vis3_year_e - vis3_year_s + 1;
 vis3_dataset_Rpg = [];
  for (let i = 0; i < vis3_dataset_f.length; i++) {
    if (vis3_filter[parseInt(i / 13)])
    {
      if (parseInt(vis3_dataset_f[i].Year)>=vis3_year_s && parseInt(vis3_dataset_f[i].Year)<=vis3_year_e )
        vis3_dataset_pg.push(vis3_dataset_f[i]);
    }
  }

  for (let i = 0; i < vis3_dataset_Rf.length; i++) {
    if (vis3_filter[i]) vis3_dataset_Rpg.push(vis3_dataset_Rf[i]);
  }
  var vis3_color_array = [];
  var vis3_padding = 50;
  var vis3_xScale = d3
    .scaleLinear() //set up scale of x Axis - time
    .domain([
      d3.min(vis3_dataset_pg, function(d) {
        return +d.rshare;
      }), //get earliest date
      d3.max(vis3_dataset_pg, function(d) {
        return +d.rshare;
      }), //get ealiert year
    ])
    .range([vis3_padding, vis3_w - vis3_padding]);

  var vis3_yScale = d3
    .scaleLinear()
    .domain([0,
      /*d3.min(vis3_dataset_pg, function(d) {
        return +d.CO2;
      }),*/
      d3.max(vis3_dataset_pg, function(d) {
        return +d.CO2;
      }),
    ])
    .range([vis3_h - vis3_padding, vis3_padding]);

  //Define axes
  var vis3_xAxis = d3.axisBottom().scale(vis3_xScale).ticks(10);

  //Define Y axis
  var vis3_yAxis = d3.axisLeft().scale(vis3_yScale).ticks(10);
  d3.select('#vis3_id').remove();

  //Create SVG element
  var vis3_svg = d3
    .select('#chart3')
    .append('svg')
    .attr('width', vis3_w + w * 0.2)
    .attr('height', vis3_h)
    .attr('id', 'vis3_id');

  //x axis: share of electricity
  vis3_svg
    .append('text')
    .attr('x', vis3_w / 2 - 20)
    .attr('y', vis3_h - 15)
    .attr('text-anchor', 'middle')
    .style('font-size', '15px')
    .text('Share of electricity from renewables (%)');

  //y axis: tonnes of CO2
  vis3_svg
    .append('text')
    .attr('x', -(vis3_h / 2))
    .attr('y', vis3_padding - 35)
    .attr('text-anchor', 'middle')
    .attr('transform', 'rotate(270)')
    .style('font-size', '15px')
    .text('Tonnes of carbon dioxide emission per capita');


  //legends----------------

  // Legendssssssssss

  //Create a legend for the graph
  vis3_svg
    .append('rect')
    .attr('x', vis3_w + 10)
    .attr('y', 30 + 42)
    .attr('height', (vis3_dataset_Rpg.length + 1) * 18)
    .attr('width', 155)
    .style('fill', 'none')
    .style('stroke', 'black');


  vis3_svg
    .append('text')
    .attr('x', vis3_w + 10)
    .attr('y', 30 + 22)
    .text('Legends')
    .style('font-size', '20px')
    .attr('alignment-baseline', 'middle')
    .style('font-weight', 1000);

  for (let i = 0; i < vis3_dataset_Rpg.length; i++) {
    vis3_color_array.push(pie_color(i));
    vis3_svg

      .append('rect')
      .attr('x', vis3_w + 20)
      .attr('y', 30 + 54 + 18 * i)
      .attr('width', 25)
      .attr('height', 15)
      .attr('stroke', 'black')
      .style('fill', pie_color(i));

    vis3_svg

      .append('text')
      .attr('x', vis3_w + 20 + 25 + 5)
      .attr('y', 30 + 54 + 18 * i + 14)
      .text(vis3_dataset_pg[i * yearCount].Country)
      .style('fill', pie_color(i)).style('font-weight', 550);;

  }
  //---------------legends---------------//



  /*-------legends-------*/
  var vis3_line = d3
    .line()
    .x(function(d) {
      return vis3_xScale(+d.rshare);
    })
    .y(function(d) {
      return vis3_yScale(+d.CO2);
    });
  var tmp_array = [];

  for (let i = 0; i < vis3_dataset_pg.length; i++) {
        tmp_array.push(vis3_dataset_pg[i]);

    if (i % yearCount == yearCount - 1) {
          var tmp_line_id = parseInt(i / yearCount);

      vis3_svg
        .append('path') //append path
        .datum(tmp_array) //data is used to bind each single data value to a different html element
        //datum is used to bind the data to a single path element
        .attr('id', 'vis3_line' + tmp_line_id) //set line to
        .attr('d', vis3_line) //set line to d
        .style('stroke', vis3_color_array[tmp_line_id]) //CSS
        .style('stroke-width', 2) //width of line
        .style('fill', 'none')
        .on('mouseover', function() {
          tmp_line_id=parseInt(d3.select(this).attr('id')[9]);
          vis3_lineMouseOver(vis3_svg,vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id, vis3_xScale, vis3_yScale)}
          )
        .on('mouseout', function()
            {
                        tmp_line_id=parseInt(d3.select(this).attr('id')[9]);
              vis3_lineMouseOut(vis3_svg,vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id)}
           );
      //dotsss
tmp_line_id = parseInt(i / yearCount);

/*-----------dots point of each line------------*/

      for (let j = 0; j < yearCount; j++) {
        var x_position = vis3_xScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].rshare);
        var y_position = vis3_yScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].CO2);
        vis3_svg
        .selectAll("vis3_dataPointForEachLine")
          .data('wow')
         .enter()
          .append('circle')
          .attr('class', 'vis3_dots_' + tmp_line_id)
          .attr('id','vis3_dots_'+ (tmp_line_id * yearCount + j))
          .attr('cx', x_position)
          //pie_h + 100
          .attr('cy', y_position)
          //(d,i) => 150 + i*(40)
          .attr('r', 1)
          .style('fill', 'black')
          .on('mouseover', function() {
            vis3_XYboxOpacity = '1.0';
           var vis3_currentid = parseInt(d3.select(this).attr('id').substring(10));//[parseFloat(d3.select(this).attr('cx')), parseFloat(d3.select(this).attr('cy'))];
        vis3_currentPoint=[+vis3_dataset_pg[vis3_currentid].rshare,+vis3_dataset_pg[vis3_currentid].CO2];
            tmp_line_id=parseInt(d3.select(this).attr('class')[10]);
          vis3_lineMouseOver(vis3_svg,vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id, vis3_xScale, vis3_yScale)}
          )
        .on('mouseout', function()
            {
            vis3_XYboxOpacity = '0.5';
                        tmp_line_id=parseInt(d3.select(this).attr('class')[10]);
              vis3_lineMouseOut(vis3_svg,vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, tmp_line_id)}
           );
      }
 /*-----------dots point of each line------------*/
tmp_line_id = parseInt(i / yearCount);


/*-----------year on each line------------*/
     var printedYearpos = [];
      for (let j = 0; j < yearCount; j++) {
        var x_position = vis3_xScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].rshare);
        var y_position = vis3_yScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j].CO2);
        var year_text_padding_x = 5;
        var year_text_padding_y = 0;
        //if (j == 6) continue;
        
			var flagDraw = true;
      for (let jj=0;jj<printedYearpos.length;jj++)
      {
      	var x_jj_position = printedYearpos[jj][0];
      	var y_jj_position = printedYearpos[jj][1];
        
      			if (Math.abs(x_jj_position - x_position) < 40 &&
            Math.abs(y_jj_position - y_position) < 8.5)
            { flagDraw = false; break;}
      
      }
      if (!flagDraw) continue;
      
      if (j!=yearCount - 1 ){
      var x_next_position = vis3_xScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j + 1].rshare);
      var y_next_position = vis3_yScale(+vis3_dataset_pg[+tmp_line_id * yearCount + j + 1].CO2);

         
      if (x_next_position >= x_position) 
      {
         if (y_next_position <= y_position) 
              year_text_padding_y += 10;
         else year_text_padding_y -= 2;
          
      } 
      else 
      {
            if (y_next_position <= y_position) 
            	year_text_padding_y -= 40;
            else year_text_padding_y -= 2; 
      }
			}
      
      printedYearpos.push([x_position,y_position]);
                  
        vis3_svg
          .selectAll('vis3_dots_year' + tmp_line_id + j)
          .data('wow')

          .enter()
          .append('text')
          .attr('class', 'vis3_dots_ne')
          .attr(
            'x', x_position + year_text_padding_x) //pie_h + 100
          .attr('y', y_position + year_text_padding_y) //(d,i) => 150 + i*(40)
          .text(vis3_dataset_pg[+tmp_line_id * yearCount + j].Year)
          .attr('font-size', 10).style("font-weight", 800);

        //paint-order: stroke;
        // stroke: #000000;
      }

/*-----------year on each line------------*/




      //dotsss


      tmp_array = [];
    }


  }




  //Create axes
  vis3_svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(0,' + (vis3_h - vis3_padding) + ')')
    .call(vis3_xAxis);

  vis3_svg
    .append('g')
    .attr('class', 'axis')
    .attr('transform', 'translate(' + vis3_padding + ',0)')
    .call(vis3_yAxis);
  showXYPairs(vis3_svg, vis3_padding, vis3_h, vis3_w, vis3_dataset_pg);
}

function vis3_goFilter() {
  var flag = true;
  var countryList = [
    'australia',
    'germany',
    'singapore',
    'world',
  ];
  for (let i = 0; i < countryList.length; i++) {
    vis3_filter[i] = document.getElementById(countryList[i]).checked;
    flag = flag & !vis3_filter[i];
  }
  vis3_year_s = vis3_loadYearFilter()[0];
  vis3_year_e = vis3_loadYearFilter()[1];
  if (flag || vis3_year_s>=vis3_year_e)
  {
    if (!flag) 
      alert("This visualisation will be reset due to invalid year range!");
   
    vis3_resetFilter();
  }
  else
  {
    
    vis3_applyFilter();
  }
}
var vis3_filter = [];
for (let i = 0; i < 4; i++) {
  vis3_filter.push(1);
}

function vis3_resetFilter() {
  var countryList = [
    'australia',
    'germany',
    'singapore',
    'world',
  ];
  for (let i = 0; i < countryList.length; i++) {
    document.getElementById(countryList[i]).checked = 1;
    vis3_filter[i] = 1;
  }
      document.getElementById('vis3_year_s').value = '2009';
      document.getElementById('vis3_year_e').value = '2020';

  vis3_year_s = 2009;
  vis3_year_e = 2020;
  vis3_applyFilter();
}


function vis3_lineMouseOver(vis3_svg,vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, id, vis3_xScale, vis3_yScale)
{

/*---------draw rectangle for legends----------*/
          vis3_svg

            .append('rect').attr('class', 'vis3_dots_country_highlight')

            .attr('x', vis3_w + 10)
            .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50)
            .attr('width', 155)
            .attr('height', 100)
            .attr('stroke', 'black')
            .style('fill', 'none');

/*---------draw regression text for legends----------*/

          vis3_svg

            .append('text').attr('class', 'vis3_dots_country_highlight')

            .attr('x', vis3_w + 20)
            .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20)
            .text(
              function() {
                var textPadding = '';
                if (vis3_dataset_pg[id*yearCount].Code == "SGP") {

                  textPadding = '(*)';
                  vis3_svg

                    .append('text').attr('class', 'vis3_dots_country_highlight')

                    .attr('x', vis3_w + 13)
                    .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20 + 20 + 20 + 25 + 35)
                    .text("*: " + '2009 and 2010 figures are excluded.').attr('font-size', '12px');


                }
                return "Regression Line" + textPadding;

              }
            )
            .style('fill', vis3_color_array[id]).style('font-weight', 550);


/*---------draw contries for legends----------*/

          vis3_svg

            .append('text').attr('class', 'vis3_dots_country_highlight')

            .attr('x', vis3_w + 13)
            .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20 + 20 + 15)
            .text("y = " + vis3_dataset_Rpg[id][0] + "x" + " + " +
              vis3_dataset_Rpg[id][1]).style('font-weight', 550).attr('font-size', '14px');

/*---------draw R square for legends----------*/

          vis3_svg

            .append('text').attr('class', 'vis3_dots_country_highlight')

            .attr('x', vis3_w + 13)
            .attr('y', 30 + 54 + 18 * vis3_dataset_Rpg.length + 50 + 20 + 20 + 20 + 25)
            .text("R square: " + vis3_dataset_Rpg[id][2]).style('font-weight', 550).attr('font-size', '14px');
          // .text("There is " +
          //    vis3_dataset_Rpg[parseInt(i / 13)].comment + "between CO2 emission per capita and the share of electricity from renewables");



/*---------vis3: raise line----------*/

          //regression
          var lineid= '#vis3_line' + id;
          d3.select(lineid).style('stroke', vis3_color_array[id]) //CSS
            .style('stroke-width', 5) //width of line
            .style('fill', 'none')
            .raise();
          d3.selectAll('.vis3_dots_' + id).attr('r', 2).raise();

/*---------vis3: draw country for each line----------*/

          vis3_svg

            .selectAll('vis3_dots_remove' + id)
            .data('wow')

            .enter()
            .append('text')
            .attr('class', 'vis3_dots_country_highlight')
            .attr(
              'x',
              function() {
                if (vis3_dataset_pg[id*yearCount].Code == "OWID_WRL" || vis3_dataset_pg[id*yearCount].Code == "SGP") return vis3_xScale(+vis3_dataset_pg[(id+1)*yearCount - 1].rshare) + 7;
                return vis3_xScale(+vis3_dataset_pg[(id+1)*yearCount - 1].rshare) -
                  15;
              }
            ) //pie_h + 100
            .attr(
              'y',
              d =>
              vis3_yScale(+vis3_dataset_pg[(id+1)*yearCount - 1].CO2) + 15
            ) //(d,i) => 150 + i*(40)
            .text(vis3_dataset_pg[id*yearCount].Country)
            .style('fill', vis3_color_array[id])
            .attr('font-size', '15px');


}

function vis3_lineMouseOut(vis3_svg,vis3_dataset_pg, vis3_w, vis3_h, vis3_color_array, id)
{
          var lineid= '#vis3_line' + id;

          d3.select(lineid).style('stroke', vis3_color_array[id]) //CSS
            .style('stroke-width', 2) //width of line
            .style('fill', 'none')
            .raise();
          d3.selectAll(".vis3_dots_country_highlight").remove();

          d3.selectAll('.vis3_dots_' + id).attr('r', 1).raise();
        
}

/*------------show x, y pairs according to mouse position-------------*/
function showXYPairs(vis3_svg, vis3_padding, vis3_h, vis3_w, vis3_dataset_pg)
{

var mouse_x, mouse_y;
  vis3_svg
    .on('mousemove', function() {
      mouse_x = d3.event.pageX;
      var rect = document.getElementById('chart3').getBoundingClientRect();

      mouse_y = d3.event.pageY - vis3_padding - (rect.top + document.documentElement.scrollTop);


      //console.log(rect.top  + document.documentElement.scrollTop, rect.right, rect.bottom, rect.left);
      while (!d3.select('.vis3_line').empty()) {
        d3.select('.vis3_line').remove();
      }
      mouse_x = mouse_x - 0.05 * w - vis3_padding + 8;
      if (mouse_x >= 0 && mouse_x <= vis3_w - 2 * vis3_padding && mouse_y >= 0 && mouse_y <= vis3_h - 2 * vis3_padding) {
        console.log("x " + (mouse_x));
        console.log('y ' + mouse_y);

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

        /*vis3_svg

                      .append('circle')
                      .attr('class', 'vis3_line')
                      .attr('cx', mouse_x - 185)
                       //pie_h + 100
                      .attr('cy', -mouse_y + 290)
                      //(d,i) => 150 + i*(40)
                      .attr('r', 3)
                      .style('fill', 'red');*/

        vis3_svg
          .append("rect")
          .attr('class', "vis3_line") //set class
          .attr("x", function() {
            if (mouse_x >= vis3_w - 2 * vis3_padding - 100) return mouse_x + vis3_padding - 110;
            return mouse_x + vis3_padding + 5;
          })
          .attr("y", mouse_y + vis3_padding - 25)
          .attr("height", 20)
          .attr("width", 95)
          .style("fill", function(){
            if (vis3_XYboxOpacity == '1.0')
              return 'orange';
            return '#D3D3D3';
          })
          .style("opacity", vis3_XYboxOpacity)
          .style("stroke", "black");


        vis3_svg
          .append('text') /* append a rect element to match each placeholder*/
          .attr('class', "vis3_line") //set class
          .attr('x', function() {
            if (mouse_x >= vis3_w - 2 * vis3_padding - 100) return mouse_x + vis3_padding - 110;
            return mouse_x + vis3_padding + 6;
          }) /* to scale value of x*/
          .attr('y', mouse_y + vis3_padding - 10)
          /* value of y - positions*/
          .text(function() {

            if (vis3_XYboxOpacity == '1.0')
              return '(' + (Math.round(vis3_currentPoint[0] * 100)/100) + ',' + (Math.round(vis3_currentPoint[1] * 100)/100) + ')';
;
          
            
            var tmp_x = Math.round(

              ((mouse_x) /
                (vis3_w - 2 * vis3_padding) *
                (d3.max(vis3_dataset_pg, function(d) {
                    return +d.rshare;
                  }) -
                  d3.min(vis3_dataset_pg, function(d) {

                    return +d.rshare;
                  })


                ) +
                d3.min(vis3_dataset_pg, function(d) {
                  return +d.rshare;
                })
              ) * 100) / 100;

            var tmp_y = Math.round(

              ((vis3_h - 2 * vis3_padding - mouse_y) /
                (vis3_h - 2 * vis3_padding) *
                (d3.max(vis3_dataset_pg, function(d) {
                    return +d.CO2;
                  }) -
                  d3.min(vis3_dataset_pg, function(d) {
                    return +d.CO2;
                  })


                ) +
                d3.min(vis3_dataset_pg, function(d) {
                  return +d.CO2;
                })
              ) * 100) / 100;

            return '(' + tmp_x + ',' + tmp_y + ')';

          });

      }


    });




}

/*------------show x, y pairs according to mouse position-------------*/



/*-----------------vis3: filter year and country -------------------------*/
function vis3_loadYearFilter() {
  const vis3_year_s = document.getElementById('vis3_year_s').value;
  const vis3_year_e = document.getElementById('vis3_year_e').value;

  
  return [parseInt(vis3_year_s),parseInt(vis3_year_e)];
  
}
//-----------


/*-----------------vis3: filter year -------------------------*/
/*------Vis3-----------*/
