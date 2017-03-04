function getTimeseries(timeseries) {
  var svgContainer;
  var svgConfig = {
    height: 400,
    width: 400,
    leftPadding: 50,
    bottomPadding: 50,
    paddingTop: 10
  };



  svgContainer = d3.select(document.createElementNS("http://www.w3.org/1999/xhtml","div"))
    .attr('width', svgConfig.width)
    .attr('height', svgConfig.height);


  svgContainer
    .selectAll('*')
    .remove();

  Plotly.plot( svgContainer, [{
      x: createXValues(timeseries.length),
      y: timeseries
    }], {
      margin: { t: 0 } 
    });

  return svgContainer;
}


function createXValues(count) {
  var x = [];
  for (var i = 0; i <= count; i++) {
    x[i] = i + 1;
  }
  return x;
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