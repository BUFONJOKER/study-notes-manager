export type Note = {
  id: string;
  title: string;
  subject: string;
  updated: string;
  created: string;
  content: string;
  tone: string;
  hasQuiz?: boolean;
};

export type UserProfile = {
  name: string;
  username: string;
  email: string;
};
