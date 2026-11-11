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

    // sending reset request
    await page.goto('/forgot-password');
    await resetPassword.sentResetEmail(latestUser.email);
    // waiting for reset email to be arrived for 5s
    await page.waitForTimeout(5000);
    // fetching & clicking the reset link from gmail
    const resetLink = await fetchResetEmail();
    expect(resetLink).toBeTruthy(); //Guarantees the email & link were found

    if(resetLink) {
        await page.goto(resetLink);
    }
    // resetting new password
    const newPassword = await resetPassword.resetPassword();

    // wait for password reset to complete on server
    await page.waitForTimeout(3000);

    // updating/writing the new password to users.json
    latestUser.password = newPassword;
    fs.writeFileSync('utils/users.json', JSON.stringify(users, null, 2));
})