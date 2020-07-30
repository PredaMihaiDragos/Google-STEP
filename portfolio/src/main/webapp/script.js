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

// Global variables
let commentsLoaded = 0;

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
 */
function loadComments(commentsToLoad = COMMENTS_PER_LOAD) {
  reloadComments(commentsLoaded + commentsToLoad);
}

/**
 * Function that reloads and displays commentsNumber comments
 */
function reloadComments(commentsNumber = commentsLoaded) {
  // Make a GET request to "/data" and parse the response json into "comments" array
  const fetchURL = '/data?max-comments=' + commentsNumber;

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
    commentsLoaded = comments.length;
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
        // After the comment was deleted, reload the comments
        reloadComments();
    });
}
