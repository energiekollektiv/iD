var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;


function Lightbox(Content) {
 	var that = this;
 	this.animationId;
 	this.currentEvent;
 	this.startOffset = {
 		x: 0,
 		y: 0
 	};


 	this.container = d3.select('body')
						.append('div')
						.attr('class', 'lightbox');

	this.container.append('div')
		.attr('class', 'lightboxHeader')
		.on('mousedown', function () {
			d3.event.preventDefault();

			if(d3.event.target == that.container.select(".lightboxHeader")[0][0]) {
				that.currentEvent = null;
				that.startOffset.x = d3.event.offsetX;
				that.startOffset.y = d3.event.offsetY;

				// Add Animation Loop and Move Listener
				that.animationId = requestAnimationFrame(that.dragLightbox);
				d3.select(document)
					.on('mousemove', function (){
						console.log("move");
						that.currentEvent = d3.event;
						that.checkbounds();
					})
					.on('mouseup',function () {
						console.log("mouseup");

						cancelDrag();
					})
			}
		})
		.append('a')
			.on('click', function(e) {
				that.close(e);
			})
			.html('x');

	var contentContainer = this.container.append('div')
			.attr('class', 'lightboxContent');

	//contentContainer.append(Content);
	contentContainer.node().appendChild(Content.node());

	this.close = function() {
		that.container.remove();
	}

	this.dragLightbox = function () {
		console.log("draw");
		if(that.currentEvent != null) {
			var x = (that.currentEvent.clientX - that.startOffset.x);
			var y = (that.currentEvent.clientY - that.startOffset.y);
			that.container.style("left", x + "px");
			that.container.style("top", y + "px");
			that.currentEvent = null;
		}
		that.animationId = requestAnimationFrame(that.dragLightbox);
	}

	this.checkbounds = function () {
		if(d3.event.clientX < 0 || d3.event.clientX > window.innerWidth) {
			cancelDrag();
		}
		else if(d3.event.clientY < 0 || d3.event.clientY > window.innerHeight) {
			cancelDrag()
		}
	}
	function cancelDrag () {
		console.log("cancelDrag");

		d3.select(document).on('mousemove',null);
		d3.select(document).on('mouseup',null);
		d3.select(document).on('mouseout',null);

		cancelAnimationFrame(that.animationId);
		that.animationId = null;
	}
};