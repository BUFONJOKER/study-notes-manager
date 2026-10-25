/** Payload structure to send an OpenAI API key. */
export type OpenAIKeyRequest = {
  api_key: string;
};

/** Response received after successfully storing the key. */
export type OpenAIKeyResponse = {
  message: string;
};
