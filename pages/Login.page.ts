// @ts-ignore
import * as fs from "node:fs";
import {Locator, Page} from "@playwright/test";

export class LoginPage {
    page: Page;
    emailInput: Locator;
    passwordInput: Locator;
    btnLogin: Locator;
    // email: string;
    // password: string;

    constructor(page: Page) {
        this.page = page;
        this.emailInput = page.getByRole('textbox', { name: 'Email' });
        this.passwordInput = page.getByRole('textbox', { name: 'Password' });
        this.btnLogin = page.getByRole('button', { name: 'LOGIN' });

        // const rawData = fs.readFileSync('utils/users.json', 'utf8');
        // const users = JSON.parse(rawData);
        // const latestUser = users[users.length - 1];
        //
        // this.email = latestUser.email;
        // this.password = latestUser.password;
    }

    async fillLogin(email: string, password: string) {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.btnLogin.click();
    }
}