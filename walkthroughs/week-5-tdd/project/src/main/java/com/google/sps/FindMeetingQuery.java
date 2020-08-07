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

package com.google.sps;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Comparator;
import java.util.HashSet;
import java.util.Set;

import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.PrintWriter;
import java.io.File;
import java.io.UnsupportedEncodingException;


public final class FindMeetingQuery {

  /**
   * Returns an ArrayList of TimeRanges when the MeetingRequest can happen
   * If it is possible for all optional attendees to participate, returns those ranges
   * Else returns ranges when mandatory attendees can participate
   */
  public Collection<TimeRange> query(Collection<Event> events, MeetingRequest request) {

    // Create a Set with both optional and mandatory attendees
    Set<String> requestAllAttendees = new HashSet<String>();
    requestAllAttendees.addAll(request.getAttendees());
    requestAllAttendees.addAll(request.getOptionalAttendees());

    // Try to include both optional and mandatory attendees
    Collection<TimeRange> answer = 
      queryMandatories(events, new MeetingRequest(requestAllAttendees, request.getDuration()));

    // If there is no suitable range, include only the mandatory attendees from request
    if(answer.isEmpty()) {
      answer = queryMandatories(events, request);
    }

    return answer;
  }

  /**
   * Returns an ArrayList of TimeRanges when the MeetingRequest can happen
   * Takes into consideration only mandatory attendees of the MeetingRequest
   *
   * Algorithm: 
   * Each event has a starting and an ending point, put them all in an array
   * Sort the array to process the points in ascending order
   * The meeting will always start when an event ends so try all those cases
   * The meeting will always end when an event starts
   * Considering we are processing the starting points in ascending order, the meeting 
   * for a starting point will always end after or at the same time with the starting point before
   *
   * Complexity: O(nlogn + m)
   * n = number of events
   * m = total number of attendees in all the events
   * nlogn : we sort the events
   * m : we go at most four times (two times with startIndex, two times with endIndex)
   * through each event and each time we check which attendees of the event are in the MeetingRequest
   */
  private Collection<TimeRange> queryMandatories(Collection<Event> events, MeetingRequest request) {
    ArrayList<TimeRange> availableRanges = new ArrayList<>();

    // eventPoints holds a list with starting and ending points of events
    // We need it so we can sort the points by the time and process them in ascending order
    ArrayList<EventPoint> eventPoints = new ArrayList<>();

    // Add an event ending on START_OF_DAY so we also consider starting the meeting here
    eventPoints.add(new EventPoint(EventPoint.Type.END, 
                                   new Event(new String(), 
                                             TimeRange.fromStartDuration(TimeRange.START_OF_DAY, 0),
                                             new HashSet<String>())));

    // Add an event starting on END_OF_DAY so we also consider ending the meeting here
    eventPoints.add(new EventPoint(EventPoint.Type.START, 
                                   new Event(new String(), 
                                             TimeRange.fromStartDuration(TimeRange.END_OF_DAY+1, 0),
                                             new HashSet<String>())));

    for(Event event : events) {
      eventPoints.add(new EventPoint(EventPoint.Type.START, event));
      eventPoints.add(new EventPoint(EventPoint.Type.END, event));
    }

    // Sort by time
    // If the times are equal, ending point first
    eventPoints.sort(EventPoint.ORDER_BY_TIME);

    // This array holds the events that contain mandatory attendees
    // and are held during the eventPoint on startIndex time
    // We add an event to this array when we go through a starting point
    // And delete it when we go through an ending point
    Collection<Event> intersectEvents = new HashSet<>();

    // Index for the meeting's ending point
    // As we increase the starting point, it will never decrease, so we declare it here
    Integer endIndex = 0;

    // We try to start the meeting whenever an event ends
    for(Integer startIndex = 0; startIndex < eventPoints.size(); startIndex++) {
      EventPoint startPoint = eventPoints.get(startIndex);
      Event startEvent = startPoint.getEvent();

      // If it's a starting point, just add the event to the intersectEvents array
      // if it contains mandatory attendees
      if(startPoint.getType() == EventPoint.Type.START) {
        if(!areDisjoint(startEvent.getAttendees(), request.getAttendees())) {
          intersectEvents.add(startEvent);
        }
        continue;
      }

      // It's an ending point, remove the event from the array
      intersectEvents.remove(startEvent);

      // If there is still at least an event with mandatory attendees during startPoint
      // continue to the next startIndex
      if(!intersectEvents.isEmpty()) {
        continue;
      }

      // We try to increase the ending point as much as we can to make the range bigger
      while(endIndex < eventPoints.size()) {
        EventPoint endPoint = eventPoints.get(endIndex);

        // We make sure the ending point is in the right of the starting point
        // We also make sure our ending point is just before and event starts
        if(endIndex > startIndex && endPoint.getType() == EventPoint.Type.START) {
          TimeRange meetingRange = 
            TimeRange.fromStartEnd(startPoint.getTime(), 
                                   endPoint.getTime(), 
                                   false);

          // There are two cases when we don't want to increase the ending point anymore
          // and we want to save the current range if it's long enough:
          // 1. We reached the last point (the one we added at the end of the day)
          // 2. The event that starts now contains mandatory attendees, so going further will
          //    make it impossible for them to participate
          if(endIndex == eventPoints.size() - 1 || 
             !areDisjoint(endPoint.getAttendees(), request.getAttendees())) {
            
            // If the duration of the range is long enough
            // and the ending point is not the same with the one we had at the previous starting point
            if(meetingRange.duration() >= request.getDuration() &&
               (availableRanges.isEmpty() || 
                meetingRange.end() > availableRanges.get(availableRanges.size()-1).end())) {
              availableRanges.add(meetingRange);
            }
            break;
          }
        }
        endIndex++;
      }
    }

    return availableRanges;
  }

  private Boolean areDisjoint(Collection<String> a, Collection<String> b) {
    for(String str : a) {
      if(b.contains(str)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Class that holds a starting or ending point in time of an event
   */
  private static final class EventPoint {

    public static enum Type {
      START,
      END
    }
    private Type type;
    private Event event;

    public EventPoint(Type type, Event event) {
      this.type = type;
      this.event = event;
    }

    /**
     * A comparator for sorting EventPoints by their time in ascending order
     * If the time is equal, return the ending event first
     */
    public static final Comparator<EventPoint> ORDER_BY_TIME = new Comparator<EventPoint>() {
      @Override
      public int compare(EventPoint a, EventPoint b) {
        int result = Long.compare(a.getTime(), b.getTime());
        if(result == 0) {
          return a.type == Type.END ? -1 : 1;
        }
        return result;
      }
    };

    public Type getType() {
      return this.type;
    }

    public int getTime() {
      if(type == Type.START) {
        return event.getWhen().start();
      }
      return event.getWhen().end();
    }

    public Set<String> getAttendees() {
      return event.getAttendees();
    }

    public Event getEvent() {
      return event;
    }
  }
}
