import { request, APIRequestContext } from "@playwright/test";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

/**
 * Creates and returns an authenticated Playwright API request context for Gmail API.
 * Ensures the GMAIL_ACCESS_TOKEN environment variable is present.
 */
async function createGmailClient(): Promise<APIRequestContext> {
    const token = process.env.GMAIL_ACCESS_TOKEN;
    if (!token) {
        throw new Error("GMAIL_ACCESS_TOKEN is missing in environment variables. Please check your .env file.");
    }

    return await request.newContext({
        baseURL: "https://gmail.googleapis.com",
        extraHTTPHeaders: {
            "Authorization": `Bearer ${token}`
        }
    });
}

/**
 * Fetches the ID of the most recent message matching the optional query.
 * Throws a descriptive error if the API request fails or no messages are found.
 *
 * @param query Optional Gmail search query (e.g. "to:user@example.com")
 * @returns Message ID string
 */
async function fetchId(query?: string): Promise<string> {
    const api = await createGmailClient();

    try {
        const response = await api.get("/gmail/v1/users/me/messages", {
            params: query ? { q: query, maxResults: 1 } : { maxResults: 1 }
        });

        // Verify HTTP status code (detects 401 Unauthorized, 403 Forbidden, etc.)
        if (!response.ok()) {
            const errorBody = await response.text();
            throw new Error(`Gmail API request failed with status ${response.status()}: ${errorBody}`);
        }

        const data = await response.json();

        // Ensure messages array exists and contains at least one item
        if (!data.messages || data.messages.length === 0) {
            throw new Error(`No messages found in Gmail matching query: "${query || "all"}"`);
        }

        // data.messages[0].id is a synchronous string property
        return data.messages[0].id;
    } finally {
        // Dispose API request context to release network resources and prevent leaks
        await api.dispose();
    }
}

/**
 * Fetches the snippet (body preview) of the latest matching email.
 *
 * @param query Optional Gmail search query (e.g. "to:user@example.com")
 * @returns Email snippet text
 */
export async function fetchEmail(query?: string): Promise<string> {
    const emailId = await fetchId(query);
    const api = await createGmailClient();

    try {
        const response = await api.get(`/gmail/v1/users/me/messages/${emailId}`);

        if (!response.ok()) {
            const errorBody = await response.text();
            throw new Error(`Failed to fetch message details for ID ${emailId} with status ${response.status()}: ${errorBody}`);
        }

        const responseData = await response.json();
        return responseData.snippet || "";
    } finally {
        await api.dispose();
    }
}

/**
 * Fetches the latest matching reset password email and extracts the reset URL.
 *
 * @param query Optional Gmail search query (e.g. "to:user@example.com")
 * @returns Reset URL string or null if not found
 */
export async function fetchResetEmail(query?: string): Promise<string | null> {
    const snippet = await fetchEmail(query);

    // Extract the URL starting with http/https from the email snippet
    const urlMatch = snippet.match(/https?:\/\/[^\s]+/);
    return urlMatch ? urlMatch[0] : null;
}