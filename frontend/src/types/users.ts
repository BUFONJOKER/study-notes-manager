/** Schema for creating a new user. */
export type UserCreate = {
  user_name: string;
  password: string; // SecretStr maps to plain string on the frontend
};

/** Schema for updating an existing user. */
export type UserUpdate = {
  user_name?: string; // Optional field using ? mapping to Optional[str]
  password?: string;  // Optional field
};

/** Schema for returning user data in responses (excluding password). */
export type UserResponse = {
  user_id: number;
  user_name: string;
};

/** JWT access token schema for authentication. */
export type Token = {
  access_token: string;
  token_type: string;
};

/** Data payload structure extracted from the JWT token. */
export type TokenData = {
  username: string | null;
};
