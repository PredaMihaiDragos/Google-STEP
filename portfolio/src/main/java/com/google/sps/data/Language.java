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

import java.util.Locale;

/** Class containing a language object */
public final class Language {

  private final String code;
  private final String displayName;

  public Language(String code) {
    this.code = code;

    // Create a new Locale for the code and get its display name
    Locale loc = new Locale(code);
    this.displayName = loc.getDisplayLanguage();
  }

  public String getCode() {
    return code;
  }

  public String getDisplayName() {
      return displayName;
  }
}
