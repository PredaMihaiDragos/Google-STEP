// Copyright 2019 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Global constants
const COMMENTS_PER_LOAD = 10;

/**
 * Adds a random fact to the page.
 */
function addRandomFact() {
  const facts =
      ['My last name is Preda!', 'I\'m from Romania!', 'I like programming!', 'My hobby is traveling!', 'When I was a kid, I wanted to be a truck driver!'];

  // Pick a random fact.
  const fact = facts[Math.floor(Math.random() * facts.length)];

  // Add it to the page.
  const factContainer = document.getElementById('fact-container');
  factContainer.innerText = fact;
}


/**
 * Callback when window is scrolled
 */
window.onscroll = onWindowScrolled;
function onWindowScrolled() {
    const headerHeight = document.getElementById('header').offsetHeight;
    const scrolledY = window.pageYOffset;
    const navBar = document.getElementById('navbar');
    const content = document.getElementById('content');
    
    if(scrolledY >= headerHeight) {
        navBar.classList.add('fixedNav');
        content.style.paddingTop = navBar.offsetHeight + 'px';
    }
    else {
        navBar.classList.remove('fixedNav');
        content.style.paddingTop = 0;
    }
}

/**
 * Callback when comments-container is scrolled
 */
function onCommentsContainerScrolled() {
    // Get the comments container element
    const commentsElement = document.getElementById('comments-container');

    // If commentsElement was scrolled to the top, load more comments
    // It is initially scrolled to bottom, because of its flex-direction:column-reverse
    // After more comments are loaded, it is no longer scrolled to top
    if(commentsElement.scrollTop === 0) {
        loadComments();
    }
}


/**
 * Callback when window finished loading
 * Used to init javascript stuff
 */
window.onload = init;
function init() {
    // Simulate scroll event to position elements right
    onWindowScrolled();

    loadComments();
    initMap();
}

/**
 * Function that scrolls to an element taking into account the nav offset
 */
function scrollToElement(elementId, duration = 300)
{
    const navOffset = document.getElementById('navbar').offsetHeight;
    $('html, body').animate({
                    scrollTop: $('#' + elementId).offset().top - navOffset
                }, duration);
}

/**
 * Function that loads more comments
 * commentsToLoad parameter specifies how many more comments to load
 * If commentsToLoad is 0, it will reload the same number of comments
 */
function loadComments(commentsToLoad = COMMENTS_PER_LOAD) {
    // Create static commentsLoaded variable, if not exists
    if(typeof loadComments.commentsLoaded === 'undefined') {
        loadComments.commentsLoaded = 0;
    }

    // Make a GET request to "/data" and parse the response json into "comments" array
    const fetchURL = '/data?max-comments=' + (loadComments.commentsLoaded + commentsToLoad);

    fetch(fetchURL).then(response => response.json()).then((comments) => {
        // Get the comments container element
        const commentsContainer = document.getElementById('comments-container');

        // Add all comments in the comments container
        commentsContainer.innerHTML = '';
        for(let comment of comments) {
            // Create the list element
            const commentListElement = createListElement('Message: ' + comment.message +
                                                         ', posted by ' + comment.addedBy +
                                                         ', on: ' + comment.addedDate);

            // Set comment color based on its sentimentScore
            const commentColor = getSentimentColor(comment.sentimentScore);
            commentListElement.style.color = "rgb(" + commentColor.r + 
                                                "," + commentColor.g + 
                                                "," + commentColor.b +
                                                ")"; 

            // Initialize the delete button element and attach it to the list element
            const commentDeleteButton = document.createElement('button');
            commentDeleteButton.innerHTML = "Delete";
            commentDeleteButton.classList.add("comment-delete-button");
            commentDeleteButton.onclick = function() {
                deleteComment(comment.id);
            }
            commentListElement.appendChild(commentDeleteButton);

            // Attach the comment list element to the comments container
            commentsContainer.appendChild(commentListElement);
                
        }
        loadComments.commentsLoaded = comments.length;
    });
}

/** 
 * Function that creates an <li> element containing text
 */
function createListElement(text) {
  const liElement = document.createElement('li');
  liElement.innerText = text;
  return liElement;
}

/**
 * Function that inits the Google Maps map
 */
function initMap() {
  // Set locations coordinates
  const homeAlexandriaCoords = { 
    lat: 43.975320, 
    lng: 25.316876,
  };
  const homeBucharestCoords = {
    lat: 44.457789,
    lng: 26.045081,
  };
  const universityCoords = {
    lat: 44.435556,
    lng: 26.099669,
  };
  const workCoords = {
    lat: 44.441150,
    lng: 26.100928,
  };

  // Create the map
  const map = new google.maps.Map(document.getElementById('map'), {
    center: homeAlexandriaCoords,
    zoom: 12
  });

  // Add markers
  const homeAlexandriaMarker = new google.maps.Marker({
    position: homeAlexandriaCoords, 
    map: map,
    label: 'H',
    title: 'Home in Alexandria',
  });
  const homeBucharestMarker = new google.maps.Marker({
    position: homeBucharestCoords, 
    map: map,
    label: 'H',
    title: 'Home in Bucharest',
  });
  const universityMarker = new google.maps.Marker({
    position: universityCoords, 
    map: map,
    label: 'U',
    title: 'University',
  });
  const workMarker = new google.maps.Marker({
    position: workCoords, 
    map: map,
    label: 'W',
    title: 'Work',
  });

  // Add info windows to markers
  addInfoWindow(map, homeAlexandriaMarker, 'This is where I live in Alexandria');
  addInfoWindow(map, homeBucharestMarker, 'This is where I live in Bucharest');
  addInfoWindow(map, universityMarker, '<h3>University of Bucharest</h3>' + 
                                       '<h4>Faculty of Mathematics and Informatics</h4>' +
                                       '<p>This is where I am studying now</p>');
  addInfoWindow(map, workMarker, '<h3>Google Romania</h3>' + 
                                 '<h4>Job name: STEP Intern</h4>' +
                                 '<p>This is where I am working now</p>');
}

/**
 * Function that adds an info window to a marker
 */
function addInfoWindow(map, marker, text) {
  // Create the info window
  const infoWindow = new google.maps.InfoWindow({
    content: text
  });

  // Open the info window when marker is clicked
  marker.addListener('click', function() {
    infoWindow.open(map, marker);
  });

/**
 * Function that deletes a comment
 */
function deleteComment(commentId) {
    // Make a DELETE request to "/data" with the commentId as parameter
    const fetchURL = '/data?comment-id=' + commentId;
    fetch(fetchURL, {
        method: "DELETE"
    }).then(response => {
        // After the comment was deleted, reload the same number of comments (0 more comments)
        LoadComments(0);
    });
}

/**
 * Function that returns a RGB color corresponding to the sentimentScore
 * sentimentScore parameter is a value in [-1, 1]
 * -1 means red, 0 means yellow, 1 means green
 */
function getSentimentColor(sentimentScore) {
  // Create the colors we need
  const red = getColor(255, 0, 0);
  const yellow = getColor(255, 255, 0);
  const green = getColor(0, 255, 0);

  // Handle wrong input cases
  if(sentimentScore < -1) {
    sentimentScore = -1;
  }
  if(sentimentScore > 1) {
    sentimentScore = 1;
  }

  // If sentimentScore is in [-1, 0), interpolate from red to yellow
  if(sentimentScore < 0) {
    // sentimentScore + 1 = sentimentScore - (-1) + 0
    return interpolateColor(red, yellow, sentimentScore + 1);
  }
    
  // Else if it is in [0, 1], interpolate from yellow to green
  return interpolateColor(yellow, green, sentimentScore);
}

/**
 * Function that returns an object with 'r', 'g' and 'b' properties set
 */
function getColor(r, g, b) {
  return {
    'r': r,
    'g': g,
    'b': b,
  };
}

/**
 * Function that returns an interpolated color between colorStart and colorStop
 * colorStart, colorStop are objects with 'r', 'g', 'b' properties
 * percentage is the interpolation value between [0, 1]
 * 0 means colorStart, 1 means colorStop
 */
function interpolateColor(colorStart, colorStop, percentage) {  
  return {
    'r': interpolateValue(colorStart.r, colorStop.r, percentage),
    'g': interpolateValue(colorStart.g, colorStop.g, percentage),
    'b': interpolateValue(colorStart.b, colorStop.b, percentage),
  };
}

/**
 * Function that returns an interpolated value between start and stop based on percentage
 * percentage is between [0, 1]
 */
function interpolateValue(start, stop, percentage) {
  return start + percentage * (stop - start);
}
