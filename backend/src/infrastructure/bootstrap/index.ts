/**
 * Bootstrap layer - Application initialization
 *
 * This layer is responsible for:
 * - Loading environment variables
 * - Initializing database connections
 * - Setting up dependency injection container
 */

export { initializeEnv, validateEnv } from "./env.js";
export { initializeDatabase, getDatabasePool, closeDatabase } from "./db.js";
export { initializeContainer, getContainer } from "./container.js";
