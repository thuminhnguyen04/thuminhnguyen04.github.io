var w = Math.max(document.documentElement.clientWidth, window.innerWidth || 0),
  h = Math.max(document.documentElement.clientHeight, window.innerHeight || 0) * 0.75;

var pie_w = w / 4; //set width and height for svg
var pie_h = pie_w;
var year;
var emptyArray = [];
var pie_dataset = [];

var color = d3.scaleQuantize().range([
  '#feebe2', //grey
  '#fbb4b9',
  '#f768a1',
  '#c51b8a',
  '#7a0177',
]); //white

function init() {
  //Define quantize scale to sort data values into saturation of color

  var svg = d3
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

  var zoom = d3.zoom().on('zoom', function () {
    var transform = d3.zoomTransform(this);
    map.attr('transform', transform);
  });
  svg.call(zoom);

  var map = svg.append('g').attr('class', 'map');

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
  d3.csv('data/Map_V4.csv').then(function (data) {
    //Set input domain for color scale
	console.log(d3.entries(data[year])[2].value);
    for (let i = 0; i < 9; i++) {
      emptyArray.push(parseFloat(d3.entries(data[year])[1 + i].value));
    }

    color.domain([
      50, 1700,
      // d3.min(emptyArray), //min for unemployed list value
      // d3.max(emptyArray), //max for unemployed list value
    ]);
    //Load in GeoJSON data
    d3.json(
      'https://gist.githubusercontent.com/GerardoFurtado/02aa65e5522104cb692e/raw/8108fbd4103a827e67444381ff594f7df8450411/aust.json'
    ).then(function (json) {
      //load file json

      map
        .selectAll('path') //bind data to the path
        .data(json.features) //create one path per GeoJSON feature + based on json.features
        .enter() //add path
        .append('path') //append path
        .attr('d', path) //set path to d
        .attr('stroke', 'white')
        .attr('id', function (d, i) {
          return 'path' + (i + 1); // d.properties.STATE_NAME;
        })
        .style('fill', function (d, i) {
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
        .on('mouseover', function (d, i) {
          //Raise the state/territory and colour stroke red
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

	d3.select('.details').style('visibility', 'visible');

          map
            .append('text')
            .attr('id', 'tooltip1')
            .attr('fill', 'black')
            .attr('transform', 'translate(' + path.centroid(d) + ')')
            .attr('text-anchor', 'middle')
            .attr('dy', 15)
            .text(function(d){if (emptyArray[i]==0) return "!"; else return emptyArray[i];})
            //.text(d.properties.STATE_NAME + " \r\n" + emptyArray[i])
            .style('font-size', '20px');

          /*-----------Pie chart ----------------------*/

          //random dataset with 5 - 10 numbers: 6 numbers
	            pie_dataset = [];
while(!d3.select('#meme').empty())
{	 
d3.select('#meme').remove();

}

          /*--------Read file----------*/
          d3.csv('data/Chart1_' + d.properties.STATE_CODE + '.csv').then(function (
            data
          ) {
		            pie_dataset = [];

            //Set input domain for color scale
            for (let i = 1; i <= 4; i++) {
              pie_dataset.push(parseFloat(d3.entries(data[year-9])[i].value));
            }
          

          /*--------Read file----------*/

          var outerRadius = pie_h / 2; //radius w/2 --> d=w
          var innerRadius = 0; //circle, not donut --> inner radius 0
          var arc = d3
            .arc() //create angles for circle, segments of the pie chart
            .innerRadius(innerRadius) //set innerRadius
            .outerRadius(outerRadius); //set outterRadius
while(!d3.select('#meme').empty())
{	 
console.log(d3.select('#meme').empty());
d3.select('#meme').remove();

}

		
          var pie = d3.pie(); //pie chart

          //set up SVG canvas
          var pie_svg = d3
            .select('#chart1_pie')
            .append('svg')
            .attr('width', pie_w)
            .attr('height', pie_h).attr('id',"meme");

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

          var pie_color = d3.scaleOrdinal(d3.schemeCategory10); //d3 native scheme

          //Draw arc paths
          arcs
            .append('path') //generate paths for the data bournd to the arcs group
            .attr('class', 'tooltip3').transition().duration(1000)
	    .attr('fill', function (d, i) {
              return pie_color(i); //use color scale --> each segment has each distinguish color
            })
            .attr(
              'd',
              function (d, i) {
                return arc(d, i);
              } //call arc segment
            );

          //add label text
          arcs
            .append('text') //pie generator generates an array containing all path data and data value
                        .attr('class', 'tooltip3')

		.text(function (d) {
              return d.value;
            }) //to access the value inside an array
            .attr('transform', function (d) {
              return 'translate(' + arc.centroid(d) + ')';
            }); //by default, text is displayed at the centroid of the chart
          // -> transform + arc.centroid to find the middle of an irregular shape.
          /*-----------Pie chart ----------------------*/
});
          //----------------------


          d3.select('.country').text(d.properties.STATE_NAME);
	
          
          if (this.id == 'path8') {
            d3.select('.females').append("text").attr("id","tooltop_nondata").text("Non-data");
          }

          

          //-----------
        })

        .on('mouseout', function (d) {
          d3.select(this).attr('stroke', 'white').attr('stroke-width', '1px');

          d3.select('#tooltip1').remove();

          map
            .append('text')
            .attr('fill', 'black')
            .attr('transform', 'translate(' + path.centroid(d) + ')')
            .attr('text-anchor', 'middle')
            .attr('dy', 15)
            .attr('id', 'text' + d.properties.STATE_CODE)
            .text(d.properties.STATE_NAME)
            .style('font-size', '8px');
	
	
        });

      map
        .selectAll('g.state')
        .data(json.features)
        .enter()
        .append('g')
        .classed('state', true)
        .append('text')
        .attr('id', function (d) {
          return 'text' + d.properties.STATE_CODE;
        })

        .attr('fill', 'black')
        .attr('transform', function (d) {
          return 'translate(' + path.centroid(d) + ')';
        })
        .attr('text-anchor', 'middle')
        .attr('dy', 15)
        .text(function (d) {
          return d.properties.STATE_NAME;
        })
        .style('font-size', '8px');

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
    year = parseInt(event.target.value)- 1999;
    // ??? get selected VALUE even outside event handler
    console.log(select.options[select.selectedIndex].value);

    // ??? get selected TEXT in or outside event handler
    console.log(select.options[select.selectedIndex].text);

    /*------------ Update color --------*/
    d3.csv('data/Map_V4.csv').then(function (data) {
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
function hideButton()
{
	          d3.select('.details').transition().style("visibility","hidden");

	while(!d3.select('#meme').empty())
{	 
d3.select('#meme').remove();

}

}
/*-------------On Click for hide --------------*/
window.onload = init;
