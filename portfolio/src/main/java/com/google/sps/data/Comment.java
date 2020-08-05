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

import java.util.Date;

/** Class containing a comment. */
public final class Comment {

  // Comment variables declaration
  private final long id;
  private final String message;
  private final String addedBy;
  private final Date addedDate;
  private final Double sentimentScore;

  // Constructors

  public Comment(long id, String message, String addedBy, Date addedDate, Double sentimentScore) {
    this.id = id;
    this.message = message;
    this.addedBy = addedBy;
    this.addedDate = addedDate;
    this.sentimentScore = sentimentScore;
  }

  public Comment(long id, String message, String addedBy, Double sentimentScore) {
    this(id, message, addedBy, new Date(), sentimentScore);
  }

  public String getMessage() {
    return message;
  }

  public String getAddedBy() {
    return addedBy;
  }

  public Date getAddedDate() {
    return addedDate;
  }

  public Double getSentimentScore() {
    return sentimentScore;
  }
}
