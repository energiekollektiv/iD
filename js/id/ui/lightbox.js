iD.ui.Lightbox = function() {
	Lightbox.init = function () {
		d3.select(document).append(div)
			.attr("class", "lightbox")
			.attr("style", "display: none")
			.on("click", function(e) {
				show();
			})
			.append("div")
				.attr("class", "lightboxContent")
	}

	Lightbox.show = function() {
		d3.select("lightbox")
			.attr("style", "display:none");
	}

	Lightbox.close = function() {
		d3.select("lightbox")
			.attr("style", "display:none");
	}
}