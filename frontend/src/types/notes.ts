// types/note.ts

export type StudyNotesAnalysis = {
  main_theme: string;
  key_points: string[];
  interconnections: string;
  practical_applications: string[];
  critical_insights: string[];
};

export type UsageTelemetry = {
  execution_time_seconds: number;
  tokens: {
    input_tokens: number;
    output_tokens: number;
    [key: string]: number; // Allows flexibility if more token metrics are added
  };
};

/** Schema for creating a new note. */
export type NoteCreate = {
  note_id: string;
  title: string;
  subject: string;
  content: string;
  analysis_result: StudyNotesAnalysis | null;
  summary_result: string | null;
  key_concepts: string[] | null;
  quiz: string | null;
};

/** Schema for updating an existing note. */
export type NoteUpdate = {
  title: string;
  subject: string;
  content: string;
};

/** Schema for returning note data in responses. */
export type NoteResponse = {
  user_id: number;
  note_id: string;
  title: string;
  subject: string;
  content: string;
  analysis_result: StudyNotesAnalysis | null;
  summary_result: string | null;
  key_concepts: string[] | null;
  quiz: string | null;
  created_at: string; // ISO format string from serialize_datetime
  updated_at: string; // ISO format string from serialize_datetime
};

/** Result returned after running the complete note-processing workflow. */
export type QuizGenerationResponse = {
  user_id: number;
  note_id: string;
  title: string;
  analysis_result: StudyNotesAnalysis;
  summary_result: string;
  key_concepts: string[];
  generated_questions: string[];
  telemetry: UsageTelemetry;
};
