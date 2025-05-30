"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const node_fetch_1 = __importDefault(require("node-fetch"));
// Load environment variables from .env file
dotenv.config({ path: path.resolve(__dirname, '../.env') });
// Validate environment variables
if (!process.env.SUPABASE_URL) {
    throw new Error('SUPABASE_URL is not set in .env file');
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in .env file');
}
async function executeSql(sql) {
    const response = await (0, node_fetch_1.default)(`${process.env.SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
            'apikey': process.env.SUPABASE_ANON_KEY || ''
        },
        body: JSON.stringify({
            sql: sql
        })
    });
    if (!response.ok) {
        const error = await response.text();
        throw new Error(`SQL execution failed: ${error}`);
    }
}
async function runMigrations() {
    try {
        console.log('Starting database setup...');
        // Read migration files in order
        const migrationFiles = [
            '00_utility_functions.sql',
            '01_initial_schema.sql',
            '02_row_level_security.sql'
        ];
        for (const file of migrationFiles) {
            console.log(`Processing migration file: ${file}`);
            const migrationPath = path.join(__dirname, '..', 'database', 'migrations', file);
            const sql = fs.readFileSync(migrationPath, 'utf8');
            try {
                await executeSql(sql);
                console.log(`Successfully executed ${file}`);
            }
            catch (error) {
                console.error(`Error executing ${file}:`, error);
                throw error;
            }
        }
        console.log('All migrations completed successfully!');
    }
    catch (error) {
        console.error('Error running migrations:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        process.exit(1);
    }
}
runMigrations();
