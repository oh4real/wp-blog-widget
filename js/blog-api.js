var page = 1;
var totalPages = 0;
var totalPosts = 0;
var prevButton = document.querySelector('.blog-prev');
var nextButton = document.querySelector('.blog-next');
var backToCategory = document.querySelector('.back-to-category');
var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
var onDetailPage = false;

var firstBranchBlog = {
	blogSelector: '#blog.content',
	blogURL: 'https://blog.kasasa.com',
	blogLocation: 'about-us/blog',
	postsPerPage: 10,
	showSearchBar: true,
	showSidebarTags: true,
	sidebarTagCount: 'count', // id, include, name, slug, term_group, description, count
	sidebarTagOrder: 'desc', // asc or desc
	twelveHourClock: true,
	showImagesInCategory: false,
	showPagination: true,
	showCategoryBackLink: true,
	includeLinkInTitle: false,

	blogSetup: function() {
		var blog = document.querySelector(firstBranchBlog.blogSelector);

		blog.innerHTML += '<div class="blog-loading"><i class="fa fa-spinner fa-spin fa-3x fa-fw"></i><span class="sr-only">Loading...</span></div>';

		// build the tags if firstBranchBlog.showSidebarTags is true
		if (firstBranchBlog.showSidebarTags) {
			generateTags();
		}

		// build the tags if firstBranchBlog.showSearchBar is true
		if (firstBranchBlog.showSearchBar) {
			var searchBtn = document.getElementById('blog-search-submit');

			// search button is clicked
			document.getElementById('blog-search-submit').addEventListener("click", function() {
				var searchTerms = document.getElementById("blog-search").value;
				var newURL = window.location.origin + '/' + firstBranchBlog.blogLocation + '/?term=' + searchTerms;
				window.location.href = newURL;
			}, false);
		}
		// doing a quick URL check to present correct data
		if (window.location.href.indexOf("post") > -1) {
			var slug = window.location.href.split('?slug=');
			setupPost(slug[1]);

			if (firstBranchBlog.showPagination == true) {
				nextButton.style.display = "none";
				prevButton.style.display = "none";
			}
			
		} else if (window.location.href.indexOf("term") > -1) {
			setupBlogSearch();
		} else if (window.location.href.indexOf("tag") > -1) {
			setupTagSearch();
		} else {
			setupCategory();
			if (firstBranchBlog.showCategoryBackLink == true) {
				backToCategory.style.display = "none";
			}
			

			if (firstBranchBlog.showPagination == true) {
				nextButton.addEventListener("click", function() {
					pageChange(1);
				}, false);
				prevButton.addEventListener("click", function() {
					pageChange(-1);
				}, false);
			}
		}

		
	}
};

function updateProgress() {
   console.log('loading...');
   document.querySelector('.blog-loading').style.visibility = "visible";
}

function transferComplete() {
	console.log('finished');
	document.querySelector('.blog-loading').style.visibility = "hidden";
}

function setupCategory() {
	if (window.location.href.indexOf("page") > -1) {
		page = window.location.href.split('?page=')[1];
	}

	var xhr = new XMLHttpRequest();

	xhr.addEventListener("progress", updateProgress);
	xhr.addEventListener("load", transferComplete);

	xhr.open('GET', firstBranchBlog.blogURL + '/wp-json/wp/v2/posts?_embed=true&page=' + page + '&per_page=' + firstBranchBlog.postsPerPage);

	xhr.onload = function() {
		
		if (xhr.status >= 200 && xhr.status < 400) {
			var data = JSON.parse(xhr.responseText);

			// debug stuff for number of posts
			// get total posts
			// console.log("%cTotal posts: " + xhr.getResponseHeader("X-WP-Total"), 'color: blue;');
			// get total pages
			// console.log("%cTotal pages: " + xhr.getResponseHeader("X-WP-TotalPages"), 'color: blue;');

			// set total pages and posts
			totalPosts = xhr.getResponseHeader("X-WP-Total");
			totalPages = xhr.getResponseHeader("X-WP-TotalPages");

			buildCategoryPage(data);
			if (firstBranchBlog.showPagination == true) {
				pagination(page);
			}
		} else {
			console.log("We connected to the server, but it returned an error.");
		}
	};

	xhr.onerror = function() {
		console.log("Connection error " + xhr.statusText);
	};

	xhr.send();

	console.log('%c----- Currently on page ' + page + ' -----', 'color: green;');

}

function setupPost(slug) {
	var xhr = new XMLHttpRequest();
	onDetailPage = true;

	xhr.addEventListener("progress", updateProgress);
	xhr.addEventListener("load", transferComplete);

	xhr.open('GET', firstBranchBlog.blogURL + '/wp-json/wp/v2/posts?slug=' + slug);

	xhr.onload = function() {
		if (xhr.status >= 200 && xhr.status < 400) {
			var data = JSON.parse(xhr.responseText);
			buildDetailPage(data);

		} else {
			console.log("We connected to the server, but it returned an error.");
		}
	};

	xhr.onerror = function() {
		console.log("Connection error " + xhr.statusText);
	};

	xhr.send();

	console.log('%c----- Currently on ' + slug + ' page -----', 'color: green;');

	if (firstBranchBlog.showCategoryBackLink == true) {
		backToCategory.addEventListener('click', function() {
			window.location = 'https://'+ window.location.host + '/' + firstBranchBlog.blogLocation;
		});
	}
}

function buildCategoryPage(data) {
	var blog = document.querySelector(firstBranchBlog.blogSelector);

	var newHTML = '';

	for (i = 0; i < data.length; i++) {
		var date = formatDate(data[i].date);

		newHTML += '<div class="content-item">';
		if (firstBranchBlog.showImagesInCategory == true) {
			if (data[i]._embedded["wp:featuredmedia"]) {
				newHTML += '<div class="image"><img src="' + data[i]._embedded["wp:featuredmedia"][0].media_details.sizes.medium.source_url + '" /></div>';
			}
		}
		if (firstBranchBlog.includeLinkInTitle == true) {
			newHTML += '<div class="content-details"><h3><a href="/' + firstBranchBlog.blogLocation + '/post.html?slug=' + data[i].slug + '">' + data[i].title.rendered + '</a></h3>';
		} else {
			newHTML += '<div class="content-details"><h3>' + data[i].title.rendered + '</h3>';
		}
		newHTML += '<p class="date">' + date + '</p>';
		newHTML += '<p>' + data[i].excerpt.rendered + '<a href="/' + firstBranchBlog.blogLocation + '/post.html?slug=' + data[i].slug + '" class="read-more">Read more</a></p>';
		newHTML += "</div></div>";
	}

	blog.innerHTML = '<div class="content-list">' + newHTML + '</div>';
}

function buildDetailPage(data) {
	var blog = document.querySelector(firstBranchBlog.blogSelector);

	var newHTML = '';

	if (data.author != undefined) {
		var postAuthor = '<div class="post-author">' + data[0].author.name + '</div>';
	}

	var date = formatDate(data[0].date);

	newHTML += '<h1>' + data[0].title.rendered + '</h1>';
	if (postAuthor) { newHTML += postAuthor; }
	newHTML += '<div class="post-date">' + date + '</div>';
	newHTML += '<div class="post-content">' + data[0].content.rendered +'</div>';

	onDetailPage = true;

	blog.innerHTML = newHTML;

	var postLinks = document.querySelectorAll('#blog .post-content a');
	for (i = 0; i < postLinks.length; i++) {
		postLinks[i].className += 'confirm';
		postLinks[i].addEventListener('click', fakeSpeedbumps, false);
	}
}

function setupBlogSearch() {
	var blog = document.querySelector(firstBranchBlog.blogSelector);

	var searchTerm = window.location.href.split("?term=")[1];
	var xhr = new XMLHttpRequest();

	console.log('Search results for: ' + searchTerm);
	var searchedFor = '<div class="search-term">Showing results for: <strong>' + searchTerm + '</strong></div>';

	xhr.addEventListener("progress", updateProgress);
	xhr.addEventListener("load", transferComplete);

	// grab dat data
	xhr.open('GET', firstBranchBlog.blogURL + '/wp-json/wp/v2/posts?search=' + searchTerm + "&per_page=30&_embed");

	xhr.onload = function() {
		if (xhr.status >= 200 && xhr.status < 400) {

			var data = JSON.parse(xhr.responseText);
			buildCategoryPage(data);

			blog.innerHTML = searchedFor + blog.innerHTML;

			if (firstBranchBlog.showCategoryBackLink == true) {
				backToCategory.addEventListener('click', function() {
					window.location = 'https://'+ window.location.host + '/' + firstBranchBlog.blogLocation;
				});
			}

		} else {
			console.log("We connected to the server, but it returned an error.");
		}
	};

	xhr.onerror = function() {
		console.log("Connection error " + xhr.statusText);
	};

	// send it
	xhr.send();
}

function setupTagSearch() {
	var blog = document.querySelector(firstBranchBlog.blogSelector);

	var searchTerm = window.location.href.split("?tag=")[1];
	var xhr = new XMLHttpRequest();

	console.log('Tag results for: ' + searchTerm);

	xhr.addEventListener("progress", updateProgress);
	xhr.addEventListener("load", transferComplete);

	// grab dat data
	xhr.open('GET', firstBranchBlog.blogURL + '/wp-json/wp/v2/posts?tags=' + searchTerm + "&per_page=30&_embed");

	xhr.onload = function() {
		if (xhr.status >= 200 && xhr.status < 400) {
			var data = JSON.parse(xhr.responseText);
			buildCategoryPage(data);

		} else {
			console.log("We connected to the server, but it returned an error.");
		}
	};

	xhr.onerror = function() {
		console.log("Connection error " + xhr.statusText);
	};

	// send it
	xhr.send();
}

// controls the page navigation
function pagination(page) {
	if (page == 1) {
		prevButton.className += " inactive";
	}

	if (page == totalPages) {
		nextButton.className += " inactive";
	}

	if (page > 1 && page < totalPages) {
		if (hasClass(prevButton, "inactive")) {
			prevButton.classList.remove("inactive");
		}
		if (hasClass(nextButton, "inactive")) {
			nextButton.classList.remove("inactive");
		}
	}
}

// reset the page and load list page
function pageChange(dir) {
	var blog = document.querySelector(firstBranchBlog.blogSelector);

	blog.innerHTML = '';
	data = '';
	page = parseInt(page) + dir;
	onDetailPage = false;
	history.pushState(null, null, window.location.pathname + '?page=' + page);
	setupCategory();
}


// format API date to more readable format
// API ex: 2017-03-06T06:09:03
function formatDate(date) {
	var formatDate = date.split('-');
	var formatTime = formatDate[2].split('T');
	var time = formatTime[1].split(':');

	// gotta remove those leading 0's
	var day = formatTime[0].replace(/^0+/, '');
	var month = monthNames[(formatDate[1].replace(/^0+/, '') - 1)];
	var hour = time[0].replace(/^0+/, '');
	var dayPeriod = "a.m.";

	if (parseInt(hour) - 12 > 0) {
		hour = hour - 12;
		dayPeriod = "p.m.";
	}

	var formattedDate = "Posted on: " + month + ' ' + day + ', ' + formatDate[0] + ' at ' + hour + ":" + time[1] + ' ' + dayPeriod;

	return formattedDate;
}

// hasClass, takes two params: element and classname
function hasClass(el, cls) {
	return el.className && new RegExp("(\\s|^)" + cls + "(\\s|$)").test(el.className);
}

function generateArchiveList() {

}

function generateTags() {
	var xhr = new XMLHttpRequest();

	xhr.open('GET', firstBranchBlog.blogURL + '/wp-json/wp/v2/tags?orderby=' + firstBranchBlog.sidebarTagCount + '&order=' + firstBranchBlog.sidebarTagOrder);

	xhr.onload = function() {
		if (xhr.status >= 200 && xhr.status < 400) {
			var tags = JSON.parse(xhr.responseText);
			var tagHTML = '';

			for (i = 0; i < tags.length; i++) {
				tagHTML += '<li><a href="?tag=' + tags[i].id + '" data-tagID="' + tags[i].id + '" data-name="' + tags[i].name + '">' + tags[i].name + ' (' + tags[i].count + ')' + '</a></li>';
			}

			document.querySelector('#tags').innerHTML = tagHTML;

		} else {
			console.log("We connected to the server, but it returned an error.");
		}
	};

	xhr.onerror = function() {
		console.log("Connection error " + xhr.statusText);
	};

	xhr.send();
}

function fakeSpeedbumps(event) {
    var url = this.href;
    if (url) {
    	event.preventDefault();
        var r = confirm("The link you clicked will take you to one of our partner websites. We don't control the content of our partner sites. Please review their Privacy Policy as it may differ from our Privacy Policy.")
        if (r == true) {
        	window.open(url);
        } else {
        	return false;
        }
    } else {
        return false;
    }
}