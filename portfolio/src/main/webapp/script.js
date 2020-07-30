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

// Globals

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

    // If commentsElement was scrolled to the top, load more comments
    // It is initially scrolled to bottom, because of its flex-direction:column-reverse
    // After more comments are loaded, it is no longer scrolled to top
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

    // Show the elements that the user should see considering the login status
    initUserLoggedElements();
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
 * Function that loads more comments
 * commentsToLoad parameter specifies how many more comments to load
 * If commentsToLoad is 0, it will reload the same number of comments
 */
function LoadComments(commentsToLoad = COMMENTS_PER_LOAD) {
    // Create static commentsLoaded variable, if not exists
    if(typeof LoadComments.commentsLoaded == 'undefined') {
        LoadComments.commentsLoaded = 0;
    }

    // Make a GET request to "/data" and parse the response json into "comments" array
    const fetchURL = '/data?max-comments=' + (LoadComments.commentsLoaded + commentsToLoad);
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
 * If the user is logged in, the function inits loggedInElements
 * Else the function inits loggedOutElements
 */
function initUserLoggedElements() {
    // Make a GET request to "/user" to get user information in user object
    fetch('user').then(response => response.json()).then((user) => {
        if(user.loggedIn === true) {
            const logoutLink = document.getElementById('logout-link');
            logoutLink.href = user.logoutURL;
            displayElements(loggedInElements);
        } else {
            const loginLink = document.getElementById('login-link');
            loginLink.href = user.loginURL;
            displayElements(loggedOutElements);
        }
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
