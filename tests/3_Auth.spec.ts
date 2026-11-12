/* Performs the login once and saves the session
(authToken + cookies + localStorage) to playwright/.auth/user.json. */

import {test as setup, expect, test} from "@playwright/test";
import {LoginPage} from "../pages/Login.page";
// @ts-ignore
import * as fs from "node:fs";

const authFile = 'playwright/.auth/user.json';

// reset storageState so auth starts with clean context to perform login
test.use({storageState: {cookies: [], origins: []}});

setup('authenticate', async ({page}) => {

    const loginPage = new LoginPage(page);
    // read last user from users.json
    const rawData = fs.readFileSync('utils/users.json', 'utf8');
    const users = JSON.parse(rawData);
    const lastUser = users[users.length - 1];
    // doing the login
    await page.goto('/login');
    await loginPage.fillLogin(lastUser.email, lastUser.password);
    await expect(page).toHaveURL(/\/user$/);
    // automatically captures localStorage authToken & cookies to file
    await page.context().storageState({path: authFile})

})