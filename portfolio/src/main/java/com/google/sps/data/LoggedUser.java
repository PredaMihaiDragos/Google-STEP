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

package com.google.sps.data;

import com.google.appengine.api.datastore.DatastoreService;
import com.google.appengine.api.datastore.DatastoreServiceFactory;
import com.google.appengine.api.datastore.Entity;
import com.google.appengine.api.datastore.PreparedQuery;
import com.google.appengine.api.datastore.Query;
import com.google.sps.data.User;

/** Class containing a logged user. */
public final class LoggedUser extends User {
  
  private final String email;
  private final String nickname;
  private final String logoutURL;
  private Boolean isAdmin;
  
  public LoggedUser(String id, String email, String logoutURL, Boolean isAdmin) {
    // Init User super class with loggedIn = true
    super(true);
    
    this.email = email;
    this.nickname = loadNickname(id);
    this.logoutURL = logoutURL;
    this.isAdmin = isAdmin;
  }

  /** 
   * Method that loads user's nickname from the database based on id
   */
  private String loadNickname(String id) {
    // Make a query to get the user entity with corresponding id from the database
    DatastoreService datastore = DatastoreServiceFactory.getDatastoreService();
    Query query =
        new Query("User")
            .setFilter(new Query.FilterPredicate("id", Query.FilterOperator.EQUAL, id));
    PreparedQuery results = datastore.prepare(query);
    Entity entity = results.asSingleEntity();

    // If the user doesn't have a nickname, return an empty string
    if (entity == null) {
      return "";
    }

    // Return the user's nickname
    String nickname = (String) entity.getProperty("nickname");
    return nickname;
  }

  public String getNickname() {
      return nickname;
  }

  public String getEmail() {
    return email;
  }

  public String getLogoutURL() {
    return logoutURL;
  }

  public Boolean isAdmin() {
    return isAdmin;
  }
}
