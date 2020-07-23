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

package com.google.sps.servlets;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.appengine.api.datastore.Query.SortDirection;
import com.google.appengine.api.datastore.FetchOptions;
import com.google.sps.data.Comment;
import com.google.gson.Gson;
import java.util.Date;
import java.util.ArrayList;
import java.util.Arrays;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that handles comments data */
@WebServlet("/data")
public class DataServlet extends HttpServlet {

  // Maximum comments that can be requested
  private static final int COMMENTS_REQUEST_LIMIT = 10000;

  /** 
   * Method that handles the GET requests to "/data" path
   * Parameter "max-comments" specifies the maximum number of comments to return
   * Returns a JSON array of comments ordered by addedDate descending
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the input from the request
    String maxCommentsString = request.getParameter("max-comments");

    // Convert the input to an int or Integer.MAX_VALUE
    int maxComments;
    try {
      maxComments = Integer.parseInt(maxCommentsString);
    } catch (NumberFormatException e) {
      maxComments = Integer.MAX_VALUE;
    }

    // If the request exceeds the comments limit, bring it down
    if(maxComments > COMMENTS_REQUEST_LIMIT) {
        maxComments = COMMENTS_REQUEST_LIMIT;
    }

    // Make sure maxComments is not negative
    if(maxComments < 0) {
        maxComments = 0;
    }

    // Load comments from datastore
    Query query = new Query("Comment").addSort("addedDate", SortDirection.DESCENDING);
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    PreparedQuery results = datastore.prepare(query);

    // Store comments in an array
    ArrayList<Comment> comments = new ArrayList<>();
    for (Entity entity : results.asIterable(FetchOptions.Builder.withLimit(maxComments))) {
      long id = entity.getKey().getId();
      String message = (String) entity.getProperty("message");
      String addedBy = (String) entity.getProperty("addedBy");
      Date addedDate = (Date) entity.getProperty("addedDate");

      comments.add(new Comment(id, message, addedBy, addedDate));
    }

    // Convert the comments to JSON
    Gson gson = new Gson();
    String json = gson.toJson(comments);

    // Send the JSON as the response
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }

  /** 
   * Method that handles the POST requests to "/data" path
   * Receives "comment-message" and "comment-addedBy" parameters
   * Creates a comment and saves it to database
   * Returns a redirect to "/index.html"
   */
  @Override
  public void doPost(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the input from the request
    String message = request.getParameter("comment-message");
    String addedBy = request.getParameter("comment-addedBy");

    // Create the commentEntity
    Entity commentEntity = new Entity("Comment");
    commentEntity.setProperty("message", message);
    commentEntity.setProperty("addedBy", addedBy);
    commentEntity.setProperty("addedDate", new Date());

    // Save commentEntity in datastore
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    datastore.put(commentEntity);

    response.sendRedirect("/index.html");
  }
}
