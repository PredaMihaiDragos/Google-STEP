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

import com.google.gson.Gson;
import com.google.sps.data.Language;
import java.util.ArrayList;
import java.util.Locale;
import java.io.IOException;
import javax.servlet.annotation.WebServlet;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/** Servlet that returns the available website languages */
@WebServlet("/languages")
public class LanguagesServlet extends HttpServlet {

  /** 
   * Method that handles the GET requests to "/languages" path
   * Returns a JSON array with ISO languages
   */
  @Override
  public void doGet(HttpServletRequest request, HttpServletResponse response) throws IOException {
    // Get the language codes in an array
    String[] languageCodes = Locale.getISOLanguages();

    // Create an ArrayList with the languages from the languageCodes
    ArrayList<Language> languages = new ArrayList<>();
    for (String code : languageCodes) {
      languages.add(new Language(code));
    }

    // Convert the languages to JSON
    Gson gson = new Gson();
    String json = gson.toJson(languages);

    // Send the JSON as the response
    response.setContentType("application/json;");
    response.getWriter().println(json);
  }
}
