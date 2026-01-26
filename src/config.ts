type ApiConfig = {
  fileserverhits: number;
  dbURL: string;
};

process.loadEnvFile();

function envOrThrow(key: string) {
  if (process.env[key] === undefined) {
    throw new Error(`${key}; Environment variable is missing.`);
  }
  return process.env[key];
}

envOrThrow("DB_URL");
export const config: ApiConfig = {
  fileserverhits: 0,
  dbURL: envOrThrow("DB_URL"),
};
