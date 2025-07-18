-- This file is part of Tech2Net project.
-- It is used to define the database schema for the application for posgresql.
-- This file should be executed in a PostgreSQL database to create the necessary tables.

-- User table to store user information
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(100) NOT NULL,
  surnames VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- Events table to store event information
CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,

  -- Event details
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  organization VARCHAR(100) NOT NULL,
  url VARCHAR(255),
  location VARCHAR(255),

  -- The event start and end times
  event_start_time TIMESTAMP NOT NULL,
  event_end_time TIMESTAMP NOT NULL,

  -- The form open and close times
  form_open_time TIMESTAMP,
  form_close_time TIMESTAMP NOT NULL,

  -- Meetings
  meetings_start_time TIMESTAMP NOT NULL,
  meetings_end_time TIMESTAMP NOT NULL,
  number_of_slots_for_meetings INT NOT NULL,
  meetings_duration INT NOT NULL, -- Duration in minutes, must be coherent with the time slots and meetings start and end times
  max_number_of_meetings_per_presenters INT, 
  max_total_number_of_meetings INT, -- > number_of_slots_for_meetings

  -- Event status

  status VARCHAR(50) NOT NULL CHECK (status IN ('published','open', 'matching', 'scheduled', 'cancelled', 'closed')) DEFAULT 'draft',

  event_summary_data JSONB, -- Summary data of the event in JSON format

  automatic BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);


-- Presenters table to store information about event presenters
-- This table links presenters to events and users owning the event
CREATE TABLE IF NOT EXISTS presenters(
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL, -- User who created the presenter
    event_id INT NOT NULL, -- Event the presenter is associated with
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    organization VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Attendees responses of the form
CREATE TABLE IF NOT EXISTS attendees_responses(
    id SERIAL PRIMARY KEY,
    event_id INT NOT NULL,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,

    requested_speakers INTEGER[] NOT NULL, -- Array of speaker IDs requested by the attendee (like an array of foreign keys)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Meetings table to store information about meetings
CREATE TABLE IF NOT EXISTS meetings(
    event_id INT NOT NULL, -- Event the meeting is associated with
    presenter_id INT NOT NULL, -- Presenter who is hosting the meeting
    attendee_id INT NOT NULL, -- Attendee who is attending the meeting
    meeting_time TIMESTAMP NOT NULL,
    meeting_duration INT NOT NULL, -- Duration in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (event_id, presenter_id, attendee_id), -- Composite primary key to ensure uniqueness of meetings per event, presenter, and attendee

    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    FOREIGN KEY (presenter_id) REFERENCES presenters(id) ON DELETE CASCADE,
    FOREIGN KEY (attendee_id) REFERENCES attendees_responses(id) ON DELETE CASCADE
);

-- Indexes for performance optimization


CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_times ON events(event_start_time, event_end_time);
CREATE INDEX idx_events_form_times ON events(form_open_time, form_close_time);

CREATE INDEX idx_presenters_event_id ON presenters(event_id);
CREATE INDEX idx_presenters_email ON presenters(email);

CREATE INDEX idx_attendees_event_id ON attendees_responses(event_id);
CREATE INDEX idx_attendees_email ON attendees_responses(email);

CREATE INDEX idx_meetings_times ON meetings(meeting_time);