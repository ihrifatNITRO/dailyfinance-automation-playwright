import {test, expect} from "@playwright/test";
import {ResetPasswordPage} from "../pages/ResetPassword.page";
import * as fs from "node:fs";
import {fetchResetEmail} from "../services/gmailVerification.service";

// reset storageState so resetPassword always runs as a guest user
test.use({storageState: {cookies: [], origins: []}});

test("Reset Password", async ({page}) => {
    const resetPassword = new ResetPasswordPage(page);

    // Reading latest user from users.json
    const rawData = fs.readFileSync('utils/users.json', 'utf8');
    const users = JSON.parse(rawData);
    const latestUser = users[users.length - 1];

    // Send password reset request
    await page.goto('/forgot-password');
    await resetPassword.sentResetEmail(latestUser.email);

    // Poll Gmail until the reset email arrives and extract the reset link
    // Retries every 2 seconds for up to 30 seconds
    let resetLink: string | null = null;
    await expect.poll(async () => {
        try {
            resetLink = await fetchResetEmail(`to:${latestUser.email}`);
            return resetLink;
        } catch {
            return null;
        }
    }, {
        message: "Password reset email was not received within the timeout period.",
        timeout: 30_000,
        intervals: [2_000]
    }).toBeTruthy();

    if (resetLink) {
        await page.goto(resetLink);
    }
    // resetting new password
    const newPassword = await resetPassword.resetPassword();

    // wait for password reset to complete on server
    await page.waitForTimeout(5000);

    // updating/writing the new password to users.json
    latestUser.password = newPassword;
    fs.writeFileSync('utils/users.json', JSON.stringify(users, null, 2));
})