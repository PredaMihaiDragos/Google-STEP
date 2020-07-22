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
window.onscroll = OnWindowScrolled;
function OnWindowScrolled() {
    const headerHeight = document.getElementById("header").offsetHeight;
    const scrolledY = window.pageYOffset;
    const navBar = document.getElementById("navbar");
    const content = document.getElementById("content");
    
    if(scrolledY >= headerHeight) {
        navBar.classList.add("fixedNav");
        content.style.paddingTop = navBar.offsetHeight + "px";
    }
    else {
        navBar.classList.remove("fixedNav");
        content.style.paddingTop = 0;
    }
}

/**
 * Callback when comments-container is scrolled
 */
function OnCommentsContainerScrolled() {
    // Get the comments container element
    const commentsElement = document.getElementById('comments-container');

    if(commentsElement.scrollTop === 0) {
        LoadComments();
    }
}


/**
 * Callback when window finished loading
 * Used to init javascript stuff
 */
window.onload = init;
function init() {
    // Simulate scroll event to position elements right
    OnWindowScrolled();

    LoadComments();
    // Load greeting-container content
    fetch('/data').then(response => response.text()).then((quote) => {
        document.getElementById('greeting-container').innerHTML = quote;
    });
}

/**
 * Function that scrolls to an element taking into account the nav offset
 */
function scrollToElement(elementId, duration = 300)
{
    const navOffset = document.getElementById("navbar").offsetHeight;
    $('html, body').animate({
                    scrollTop: $('#' + elementId).offset().top - navOffset
                }, duration);
}

/**
 * Function that loads comments
 */
function LoadComments() {
    // Create static commentsLoaded variable, if not exists
    if(typeof LoadComments.commentsLoaded == 'undefined') {
        LoadComments.commentsLoaded = 0;
    }

    // Make a GET request to "/data" and parse the response json into "comments" array
    const fetchURL = '/data?max-comments=' + (LoadComments.commentsLoaded + COMMENTS_PER_LOAD);
    fetch(fetchURL).then(response => response.json()).then((comments) => {
        // Get the comments container element
        const commentsElement = document.getElementById('comments-container');

        // Add all comments in the comments container
        commentsElement.innerHTML = '';
        for(let comment of comments) {
            commentsElement.appendChild(
                createListElement('Message: ' + comment.message +
                                  ', posted on: ' + comment.addedDate));
        }
        LoadComments.commentsLoaded = comments.length;
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
