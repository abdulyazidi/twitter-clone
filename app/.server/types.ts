export type AuthCookie = {
  userId: string;
  email: string;
  username: string;
  sessionId: string;
  avatarURL?: string | null | undefined;
};

export type SignUpFormErrors = {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  general: string;
  hasErrors: boolean;
};

export type LoginFormErrors = {
  username_email: string;
  password: string;
  general: string;
  hasErrors: boolean;
};
