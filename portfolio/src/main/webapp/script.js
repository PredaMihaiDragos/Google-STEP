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
let isAdmin = false;

// The display method of the elements that a logged in user should see
const loggedInElements = {
  'comment-form-container' : 'inline',
  'logout-link-container' : 'inline',
};

// The display method of the elements that a logged out user should see
const loggedOutElements = {
  'comment-form-login' : 'inline',
};

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
  } else {
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

  // Show the elements that the user should see considering the login status
  initUserLoggedElements();
  
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
 * Function that inits the comments section
 * Loads the comments languages available in a dropdown
 * Then load the comments in that language
 */
function initComments() {
  // Make a GET request to '/languages' and parse the response json into 'languages' array
  fetch('/languages').then(response => response.json()).then((languages) => {
    // Get the comments language element
    const commentsLanguageElement = document.getElementById('comments-language');

    // For each language create and add an option to the comments language element
    for(let language of languages) {
      const optionElement = document.createElement('option');
      optionElement.text = language.displayName + ' (' + language.code + ')';
      optionElement.value = language.code;
      commentsLanguageElement.add(optionElement);
    }

    // If the user didn't choose other language before, set it to 'original'
    if(!localStorage.hasOwnProperty('commentsLanguageCode'))
      localStorage.commentsLanguageCode = 'original';

    // Set the languages dropdown to the language the user chose before
    commentsLanguageElement.value = localStorage.commentsLanguageCode;

    // Reload the comments every time user changes the language
    commentsLanguageElement.onchange = function() {
      localStorage.commentsLanguageCode = getCommentsLanguageCode();
      reloadComments();
    }

    loadComments();
  });
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
  let fetchURL = '/data?max-comments=' + commentsNumber;

  // If the languageCode is not 'original', add the languageCode to the fetchURL
  const languageCode = getCommentsLanguageCode();
  if(languageCode != 'original') {
    fetchURL += '&comments-language-code=' + languageCode;
  }

  // Make a GET request to '/data' and parse the response json into 'comments' array
  fetch(fetchURL).then(response => response.json()).then((comments) => {
    // Get the comments container element
    const commentsContainer = document.getElementById('comments-container');

    // Add all comments in the comments container
    commentsContainer.innerHTML = '';
    for(let comment of comments) {
      // Create the list element
      const commentListElement = createListElement('Message: ' + comment.message +
                                                   ', posted by <abbr title="' + comment.email + 
                                                   '">' + comment.addedBy + '</abbr>' +
                                                   ', on: ' + comment.addedDate);
          
      // Set comment color based on its sentimentScore
      const commentColor = getSentimentColor(comment.sentimentScore);
      commentListElement.style.color = "rgb(" + commentColor.r + 
                                       "," + commentColor.g + 
                                       "," + commentColor.b +
                                       ")"; 

      // If user is an admin, show delete buttons to each comment
      if(isAdmin) {
        // Initialize the delete button element and attach it to the list element
        const commentDeleteButton = document.createElement('button');
        commentDeleteButton.innerHTML = "Delete";
        commentDeleteButton.classList.add("comment-delete-button");
        commentDeleteButton.onclick = function() {
          deleteComment(comment.id);
        }
        commentListElement.insertBefore(commentDeleteButton, commentListElement.firstChild);
      }

      // Attach the comment list element to the comments container
      commentsContainer.appendChild(commentListElement);  
    }
    commentsLoaded = comments.length;
  });
}

/**
 * Function that returns the current value of comments-language select
 */
function getCommentsLanguageCode() {
  const commentsLanguageElement = document.getElementById('comments-language');
  const languageCode = commentsLanguageElement.
                       options[commentsLanguageElement.selectedIndex].value;
  return languageCode;
}

/** 
 * Function that creates an <li> element containing html
 */
function createListElement(html) {
  const liElement = document.createElement('li');
  liElement.innerHTML = html;
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
}

/**
 * Function that deletes a comment
 */
function deleteComment(commentId) {
  // Make a DELETE request to '/data' with the commentId as parameter
  const fetchURL = '/data?comment-id=' + commentId;
  fetch(fetchURL, {
    method: 'DELETE'
  }).then(response => {
    // After the comment was deleted, reload the comments
    reloadComments();
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
  const yellow = getColor(210, 210, 0);
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
 * fraction is the interpolation value between [0, 1]
 * 0 means colorStart, 1 means colorStop
 */
function interpolateColor(colorStart, colorStop, fraction) {  
  return {
    'r': interpolateValue(colorStart.r, colorStop.r, fraction),
    'g': interpolateValue(colorStart.g, colorStop.g, fraction),
    'b': interpolateValue(colorStart.b, colorStop.b, fraction),
  };
}

/**
 * Function that returns an interpolated value between start and stop based on fraction
 * fraction is between [0, 1]
 */
function interpolateValue(start, stop, fraction) {
  return start + fraction * (stop - start);
}

/*
 * If the user is logged in, the function inits loggedInElements
 * Else the function inits loggedOutElements
 */
function initUserLoggedElements() {
    // Make a GET request to "/user" to get user information in user object
    fetch('user').then(response => response.json()).then((user) => {
      if(user.loggedIn === true) {
        const logoutLink = document.getElementById('logout-link');
        logoutLink.href = user.logoutURL;
        const nicknameInput = document.getElementById('comment-addedBy');
        nicknameInput.value = user.nickname;

        if(user.isAdmin) {
          isAdmin = true;
        }

        displayElements(loggedInElements);
      } else {
        const loginLink = document.getElementById('login-link');
        loginLink.href = user.loginURL;
        displayElements(loggedOutElements);
      }

      // Load comments only after we know the user's login status
      initComments();
    });
}

/**
 * Function that displays elements
 * Parameter elements is a dict
 * elements' value is element's id
 * elements' key is element's display method
 */
function displayElements(elements) {
    for (const [elemId, displayMethod] of Object.entries(elements)) {
      const elem = document.getElementById(elemId);
      elem.style.display = displayMethod;
    }
}
