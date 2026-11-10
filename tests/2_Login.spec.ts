import {test, expect} from "@playwright/test";
import {LoginPage} from "../pages/Login.page";
import * as fs from "node:fs";

// Run as a guest user when testing login page specifically
test.use({ storageState: { cookies: [], origins: [] } });

test("Doing login", async ({ page }) => {
    // making object instance
    const loginPage = new LoginPage(page);

    // Read latest user from users.json
    const rawData = fs.readFileSync('utils/users.json', 'utf8');
    const users = JSON.parse(rawData);
    const latestUser = users[users.length - 1];

    // url setup for login
    await page.goto('/login');
    await loginPage.fillLogin(latestUser.email, latestUser.password);
    // assertion of successfull login
    await expect(page).toHaveURL(/\/user$/);

    // get the authToken from the session local storage and save on .env
    // const authToken = await page.evaluate(() => {
    //     return localStorage.getItem("authToken");
    // });
    // fs.appendFileSync('.env', `\nAUTH_TOKEN=${authToken}`);
    await page.pause();
})