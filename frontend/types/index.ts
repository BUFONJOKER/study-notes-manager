import { z } from "zod";

const nullableOptionalString = z.string().nullable().optional();

// schemas for notes related apis
export const NoteCreateSchema = z.object({
	user_id: z.number().int(),
	note_id: z.string(),
	title: z.string(),
	subject: z.string(),
	content: z.string(),
	quiz: nullableOptionalString,
});

export type NoteCreate = z.infer<typeof NoteCreateSchema>;

export const NoteUpdateSchema = z.object({
	title: z.string(),
	subject: z.string(),
	content: z.string(),
	quiz: nullableOptionalString,
});

export type NoteUpdate = z.infer<typeof NoteUpdateSchema>;

export const NoteResponseSchema = z.object({
	user_id: z.number().int(),
	note_id: z.string(),
	title: z.string(),
	subject: z.string(),
	content: z.string(),
	quiz: nullableOptionalString,
	created_at: z.coerce.date(),
	updated_at: z.coerce.date(),
});

export type NoteResponse = z.infer<typeof NoteResponseSchema>;

export const UsageTelemetrySchema = z.object({
	execution_time_seconds: z.number(),
	tokens: z.record(z.string(), z.unknown()),
});

export type UsageTelemetry = z.infer<typeof UsageTelemetrySchema>;

export const QuizGenerationResponseSchema = z.object({
	user_id: z.number().int(),
	note_id: z.string(),
	title: z.string(),
	analysis_result: z.string(),
	summary_result: z.string(),
	key_concepts: z.array(z.string()),
	generated_questions: z.array(z.string()),
	telemetry: UsageTelemetrySchema,
});

export type QuizGenerationResponse = z.infer<
	typeof QuizGenerationResponseSchema
>;

// schemas for setting openai api key api
export const OpenAIKeyRequestSchema = z.object({
	api_key: z.string(),
});

export type OpenAIKeyRequest = z.infer<typeof OpenAIKeyRequestSchema>;

export const OpenAIKeyResponseSchema = z.object({
	message: z.string(),
});

export type OpenAIKeyResponse = z.infer<typeof OpenAIKeyResponseSchema>;

// schemas for user related apis
export const UserCreateSchema = z.object({
	user_name: z.string(),
	password: z.string().min(8),
});

export type UserCreate = z.infer<typeof UserCreateSchema>;

export const UserUpdateSchema = z.object({
	user_name: nullableOptionalString,
	password: z.string().min(8),
});

export type UserUpdate = z.infer<typeof UserUpdateSchema>;

export const UserResponseSchema = z.object({
	user_id: z.number().int(),
	user_name: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const TokenSchema = z.object({
	access_token: z.string(),
	token_type: z.string(),
});

export type Token = z.infer<typeof TokenSchema>;

export const TokenDataSchema = z.object({
	username: nullableOptionalString,
});

export type TokenData = z.infer<typeof TokenDataSchema>;
