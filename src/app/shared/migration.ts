import { Database } from './database';

export type Migration = (database: Database) => boolean;
