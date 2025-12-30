/**
 * Environment Configuration with Validation
 * Validates required environment variables at startup
 */

interface EnvConfig {
    DB_HOST: string;
    DB_PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_NAME: string;
    GOOGLE_API_KEY: string;
}

/**
 * Validates a required environment variable
 */
function getRequiredEnv(key: string): string {
    const value = process.env[key];
    if (!value || value.trim() === '') {
        throw new Error(
            `Missing required environment variable: ${key}\n` +
            `Please set ${key} in your .env.local file or environment variables.`
        );
    }
    return value.trim();
}

/**
 * Validates and parses a required port number
 */
function getRequiredPort(key: string): number {
    const value = getRequiredEnv(key);
    const port = Number(value);

    if (isNaN(port) || port <= 0 || port > 65535) {
        throw new Error(
            `Invalid port number for ${key}: "${value}"\n` +
            `Port must be a number between 1 and 65535.`
        );
    }

    return port;
}

/**
 * Validates all environment variables and returns typed config
 */
function validateEnv(): EnvConfig {
    try {
        return {
            DB_HOST: getRequiredEnv('DB_HOST'),
            DB_PORT: getRequiredPort('DB_PORT'),
            DB_USER: getRequiredEnv('DB_USER'),
            DB_PASSWORD: getRequiredEnv('DB_PASSWORD'),
            DB_NAME: getRequiredEnv('DB_NAME'),
            GOOGLE_API_KEY: getRequiredEnv('GOOGLE_API_KEY'),
        };
    } catch (error) {
        console.error('\n❌ Environment Configuration Error:\n');
        console.error(error instanceof Error ? error.message : String(error));
        console.error('\nPlease check your .env.local file and ensure all required variables are set.');
        process.exit(1);
    }
}

// Validate and export configuration
export const config: EnvConfig = validateEnv();