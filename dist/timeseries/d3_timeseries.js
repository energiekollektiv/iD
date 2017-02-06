function getTimeseries(timeseries) {
  var svgContainer;
  var svgConfig = {
    height: 400,
    width: 400,
    leftPadding: 50,
    bottomPadding: 50,
    paddingTop: 10
  };


  svgContainer = document.createElementNS("http://www.w3.org/1999/xhtml","div");
/*    .attr('width', svgConfig.width)
    .attr('height', svgConfig.height);
*/

  console.log(svgContainer);
  
  Plotly.plot( svgContainer, [{
      x: [1, 2, 3, 4],
      y: [12, 9, 15, 12]
    }], {
      margin: { t: 0 } 
    });


  document.body.appendChild(svgContainer);
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