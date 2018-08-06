(function($) {
	"use strict";

	$(window).on('load', function() {
	    $(".preloader").fadeOut("slow", function() {
	        $(".preloader-left").addClass("slide-left");
	    });
	    $("body").css("overflow-y", "auto");
	});

	$(document).ready(function() {
		function startProgressBar() {
			$(".progress > div").each(function () {
				if ($(this).width() === 0) {
					$(this)
						.animate({
							width: $(this).attr("aria-valuenow")
						}, 100);
				}
			});

		}
		$(window).scroll(function () {
			var distanceFromTop = $(document).scrollTop();
			if (distanceFromTop >= $('#app > div').height() - 50) {
				$('.huge-content').addClass('fixed');
			}
			else {
				$('.huge-content').removeClass('fixed');
			}

			var target = $('#skills');

			var targetPosTop = target.position().top; // Position in page
			var targetHeight = target.height(); // target's height
			var $target = targetHeight + targetPosTop; // the whole target position
			var $windowst = $(window).scrollTop() - ($(window).height() / 2);     // yes divided by 2 to get middle screen view.

			if (($windowst >= targetPosTop) && ($windowst < $target)) {
				// start progressbar I guess
				startProgressBar();
			}
		});	

		var $content = $('#blog__content');
		var data = {
			rss_url: 'https://medium.com/feed/@miranmirza'
		};
		$.get('https://api.rss2json.com/v1/api.json', data, function (response) {
			if (response.status == 'ok') {
				var output = '';
				$.each(response.items, function (k, item) {
					output += '<div class="col-md-4 col-sm-6 service">';

					var tagIndex = item.description.indexOf('<img'); // Find where the img tag starts
					var srcIndex = item.description.substring(tagIndex).indexOf('src=') + tagIndex; // Find where the src attribute starts
					var srcStart = srcIndex + 5; // Find where the actual image URL starts; 5 for the length of 'src="'
					var srcEnd = item.description.substring(srcStart).indexOf('"') + srcStart; // Find where the URL ends
					var imgSrc = item.description.substring(srcStart, srcEnd); // Extract just the URL

					output += '<div><img src="' + imgSrc + '" class="img-fluid" /></div>';
					output += '<h4><a href="' + item.link + '" >' + item.title + '</a></h4>';
					output += '<h5>' + new Date(item.pubDate).toLocaleDateString("en-GB") + "</h5>";

					// Trim the Description
					var yourString = item.description.replace(/<img[^>]*>/g, "");
					var maxLength = 140 // maximum number of characters to extract
					var trimmedString = yourString.substr(0, maxLength);
					trimmedString = trimmedString.substr(0, Math.min(trimmedString.length, trimmedString.lastIndexOf(" ")))					

					output += '<p>' + trimmedString + '</p>';
					output += '</div>';
					return k < 2;
				});

				$content.html(output);
			}
		});



		

		// Select all links with hashes
		$('a[href*="#"]')
			// Remove links that don't actually link to anything
			.not('[href="#"]')
			.not('[href="#0"]')
			.click(function (event) {
				// On-page links
				if (
					location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '')
					&&
					location.hostname == this.hostname
				) {
					// Figure out element to scroll to
					var target = $(this.hash);
					target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
					// Does a scroll target exist?
					if (target.length) {
						// Only prevent default if animation is actually gonna happen
						event.preventDefault();
						$('html, body').animate({
							scrollTop: target.offset().top
						}, 500, function () {
							// Callback after animation
							// Must change focus!
							var $target = $(target);
							$target.focus();
							if ($target.is(":focus")) { // Checking if the target was focused
								return false;
							} else {
								$target.attr('tabindex', '-1'); // Adding tabindex for elements not focusable
								$target.focus(); // Set focus again
							};
						});
					}
				}
			});

	    //Portfolio masonry
	    var $container = $('#portfolio-container');
	    $container.isotope({
	        masonry: {
	            columnWidth: '.portfolio-item'
	        },
	        itemSelector: '.portfolio-item'
	    });
	    $('#filters').on('click', 'li', function() {
	        $('#filters li').removeClass('active');
	        $(this).addClass('active');
	        var filterValue = $(this).attr('data-filter');
	        $container.isotope({ filter: filterValue });
	    });
	});

	//Photoswipe Init

	var initPhotoSwipeFromDOM = function(gallerySelector) {

	  // parse slide data (url, title, size ...) from DOM elements 
	  // (children of gallerySelector)
	  var parseThumbnailElements = function(el) {
	    var thumbElements = el.childNodes,
	      numNodes = thumbElements.length,
	      items = [],
	      figureEl,
	      linkEl,
	      size,
	      item;

	    for(var i = 0; i < numNodes; i++) {

	      figureEl = thumbElements[i]; // <figure> element

	      // include only element nodes 
	      if(figureEl.nodeType !== 1) {
	        continue;
	      }

	      linkEl = figureEl.children[0]; // <a> element

	      size = linkEl.getAttribute('data-size').split('x');

	      // create slide object
	      item = {
	        src: linkEl.getAttribute('href'),
	        w: parseInt(size[0], 10),
	        h: parseInt(size[1], 10)
	      };



	      if(figureEl.children.length > 1) {
	        // <figcaption> content
	        item.title = figureEl.children[1].innerHTML; 
	      }

	      if(linkEl.children.length > 0) {
	        // <img> thumbnail element, retrieving thumbnail url
	        item.msrc = linkEl.children[0].getAttribute('src');
	      } 

	      item.el = figureEl; // save link to element for getThumbBoundsFn
	      items.push(item);
	    }

	    return items;
	  };

	  // find nearest parent element
	  var closest = function closest(el, fn) {
	    return el && ( fn(el) ? el : closest(el.parentNode, fn) );
	  };

	  // triggers when user clicks on thumbnail
	  var onThumbnailsClick = function(e) {
	    e = e || window.event;
	    e.preventDefault ? e.preventDefault() : e.returnValue = false;

	    var eTarget = e.target || e.srcElement;

	    // find root element of slide
	    var clickedListItem = closest(eTarget, function(el) {
	      return (el.tagName && el.tagName.toUpperCase() === 'FIGURE');
	    });

	    if(!clickedListItem) {
	      return;
	    }

	    // find index of clicked item by looping through all child nodes
	    // alternatively, you may define index via data- attribute
	    var clickedGallery = clickedListItem.parentNode,
	      childNodes = clickedListItem.parentNode.childNodes,
	      numChildNodes = childNodes.length,
	      nodeIndex = 0,
	      index;

	    for (var i = 0; i < numChildNodes; i++) {
	      if(childNodes[i].nodeType !== 1) { 
	        continue; 
	      }

	      if(childNodes[i] === clickedListItem) {
	        index = nodeIndex;
	        break;
	      }
	      nodeIndex++;
	    }



	    if(index >= 0) {
	      // open PhotoSwipe if valid index found
	      openPhotoSwipe( index, clickedGallery );
	    }
	    return false;
	  };

	  // parse picture index and gallery index from URL (#&pid=1&gid=2)
	  var photoswipeParseHash = function() {
	    var hash = window.location.hash.substring(1),
	    params = {};

	    if(hash.length < 5) {
	      return params;
	    }

	    var vars = hash.split('&');
	    for (var i = 0; i < vars.length; i++) {
	      if(!vars[i]) {
	        continue;
	      }
	      var pair = vars[i].split('=');  
	      if(pair.length < 2) {
	        continue;
	      }           
	      params[pair[0]] = pair[1];
	    }

	    if(params.gid) {
	      params.gid = parseInt(params.gid, 10);
	    }

	    return params;
	  };

	  var openPhotoSwipe = function(index, galleryElement, disableAnimation, fromURL) {
	    var pswpElement = document.querySelectorAll('.pswp')[0],
	      gallery,
	      options,
	      items;

	    items = parseThumbnailElements(galleryElement);

	    // define options (if needed)
	    options = {

	      // define gallery index (for URL)
	      galleryUID: galleryElement.getAttribute('data-pswp-uid'),

	      getThumbBoundsFn: function(index) {
	        // See Options -> getThumbBoundsFn section of documentation for more info
	        var thumbnail = items[index].el.getElementsByTagName('img')[0], // find thumbnail
	          pageYScroll = window.pageYOffset || document.documentElement.scrollTop,
	          rect = thumbnail.getBoundingClientRect(); 

	        return {x:rect.left, y:rect.top + pageYScroll, w:rect.width};
	      }

	    };

	    // PhotoSwipe opened from URL
	    if(fromURL) {
	      if(options.galleryPIDs) {
	        // parse real index when custom PIDs are used 
	        // http://photoswipe.com/documentation/faq.html#custom-pid-in-url
	        for(var j = 0; j < items.length; j++) {
	          if(items[j].pid == index) {
	            options.index = j;
	            break;
	          }
	        }
	      } else {
	        // in URL indexes start from 1
	        options.index = parseInt(index, 10) - 1;
	      }
	    } else {
	      options.index = parseInt(index, 10);
	    }

	    // exit if index not found
	    if( isNaN(options.index) ) {
	      return;
	    }

	    if(disableAnimation) {
	      options.showAnimationDuration = 0;
	    }

	    // Pass data to PhotoSwipe and initialize it
	    gallery = new PhotoSwipe( pswpElement, PhotoSwipeUI_Default, items, options);
	    gallery.init();
	  };

	  // loop through all gallery elements and bind events
	  var galleryElements = document.querySelectorAll( gallerySelector );

	  for(var i = 0, l = galleryElements.length; i < l; i++) {
	    galleryElements[i].setAttribute('data-pswp-uid', i+1);
	    galleryElements[i].onclick = onThumbnailsClick;
	  }

	  // Parse URL and open gallery if it contains #&pid=3&gid=1
	  var hashData = photoswipeParseHash();
	  if(hashData.pid && hashData.gid) {
	    openPhotoSwipe( hashData.pid ,  galleryElements[ hashData.gid - 1 ], true, true );
	  }
	};

	// execute above function
	initPhotoSwipeFromDOM('.project-gallery');


	// Intialize Map
	google.maps.event.addDomListener(window, 'load', init);

	function init() {
	    // Basic options for a simple Google Map
	    // For more options see: https://developers.google.com/maps/documentation/javascript/reference#MapOptions
	    var mapOptions = {
	        // How zoomed in you want the map to start at (always required)
	        zoom: 11,

	        // The latitude and longitude to center the map (always required)
	        center: new google.maps.LatLng(43.6984233,-79.3948053),

	        scrollwheel: false,


	        // How you would like to style the map.
	        // This is where you would paste any style found on Snazzy Maps.
	        styles:[{"featureType":"all","elementType":"labels.text.fill","stylers":[{"saturation":36},{"color":"#000000"},{"lightness":40}]},{"featureType":"all","elementType":"labels.text.stroke","stylers":[{"visibility":"on"},{"color":"#000000"},{"lightness":16}]},{"featureType":"all","elementType":"labels.icon","stylers":[{"visibility":"off"}]},{"featureType":"administrative","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"administrative","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":17},{"weight":1.2}]},{"featureType":"landscape","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":20}]},{"featureType":"poi","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":21}]},{"featureType":"road.highway","elementType":"geometry.fill","stylers":[{"color":"#000000"},{"lightness":17}]},{"featureType":"road.highway","elementType":"geometry.stroke","stylers":[{"color":"#000000"},{"lightness":29},{"weight":0.2}]},{"featureType":"road.arterial","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":18}]},{"featureType":"road.local","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":16}]},{"featureType":"transit","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":19}]},{"featureType":"water","elementType":"geometry","stylers":[{"color":"#000000"},{"lightness":17}]}]
	    };    


	    // Get the HTML DOM element that will contain your map
	    // We are using a div with id="map" seen below in the <body>
	    var mapElement = document.getElementById('map');

	    // Create the Google Map using our element and options defined above
	    var map = new google.maps.Map(mapElement, mapOptions);

	    var image = 'images/mappin.png';
	    // Let's also add a marker while we're at it
	    var marker = new google.maps.Marker({
	        position: new google.maps.LatLng(43.6984233,-79.3948053),
	        map: map,
	        icon: image,
	        draggable: true,
	        animation: google.maps.Animation.DROP
	    });
	    marker.addListener('click', toggleBounce);

	    function toggleBounce() {
	        if (marker.getAnimation() !== null) {
	            marker.setAnimation(null);
	        } else {
	            marker.setAnimation(google.maps.Animation.BOUNCE);
	        }
	    }
	}
})(jQuery);