/* Performs the login once and saves the session
(authToken + cookies + localStorage) to playwright/.auth/user.json. */

import {test as setup, expect} from "@playwright/test";
import {LoginPage} from "../pages/Login.page";
import * as fs from "node:fs";

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({page}) => {

    const loginPage = new LoginPage(page);
    // read latest user from users.json
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