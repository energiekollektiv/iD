function timeseries() {
	var svgContainer;
	var svgConfig = {
		height: 400,
		width: 400,
    leftPadding: 50,
    bottomPadding: 50,
    paddingTop: 10
	};


  svgContainer = d3.select('body').append('svg')
      .attr('width', svgConfig.width)
      .attr('height', svgConfig.height)
      .attr('style', 'display:block;')

	timeseries.viewTimeseries = function(timeseries) {
		var x = d3.scale.ordinal().range([svgConfig.leftPadding, svgConfig.width]);
		var y = d3.scale.linear().range([svgConfig.height - svgConfig.bottomPadding, svgConfig.paddingTop]); 

    x.domain(timeseries, function(d,i) { return d; })
      .rangeRoundBands([svgConfig.leftPadding, svgConfig.width], .2, .1);
    y.domain([0, d3.max(timeseries, function(d) { return d; })]);


		svgContainer
			.selectAll('*')
      .remove();

    // X und Y Achse erstellen
    var abscissa = d3.svg.axis().scale(x).orient("bottom");
    var ordinate = d3.svg.axis().scale(y).orient("left");

    // Zeichnen der x-Achse
    svgContainer.append("g")
       .attr("class", "axis abscissa")
       .attr("transform",  "translate(0, "+ (svgConfig.height - svgConfig.bottomPadding)+")")
       .call(abscissa) 



    // Zeichnen der y-Achse
    svgContainer.append("g")
     .attr("class", "axis ordinate")
     .attr("transform", "translate("+(svgConfig.leftPadding)+", 0)")
     .call(ordinate);



    svgContainer
      .selectAll('rect')
      .data(timeseries)
      .enter()
				.append('rect')
				.attr({ 
					'x': function(d) { return x(d); },
					'y':function(d){ return y(d); },
					'height': function(d) { return svgConfig.height - svgConfig.bottomPadding - y(d); },
					'width' : x.rangeBand()
				})
				.style({'stroke':'#adadad','stroke-width':'2px'});
	}
  return timeseries;
}

function isJson(item) {
  item = typeof item !== "string" ? JSON.stringify(item) : item;

  try {
    item = JSON.parse(item);
  } catch (e) {
    return false;
  }

  if (typeof item === "object" && item !== null) {
    return true;
  }

  return false;
}