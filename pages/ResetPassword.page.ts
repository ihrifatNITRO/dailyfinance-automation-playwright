import {Locator, Page} from "@playwright/test";
import {faker} from "@faker-js/faker";

export class ResetPasswordPage {
    page: Page;
    email: Locator;
    btnSendResetPassword: Locator;
    newPassword: Locator;
    confirmPassword: Locator;
    btnResetPassword: Locator;

    constructor(page: Page) {
        this.page = page;
        this.email = page.getByRole('textbox', { name: 'Email' });
        this.btnSendResetPassword = page.getByRole('button', { name: 'SEND RESET LINK' });
        this.newPassword = page.getByRole('textbox', { name: 'New Password' });
        this.confirmPassword = page.getByRole('textbox', { name: 'Confirm Password' });
        this.btnResetPassword = page.getByRole('button', { name: 'RESET PASSWORD' });
    }

    async sentResetEmail(email: string){
        await this.email.fill(email);
        await this.btnSendResetPassword.click();
    }
    async resetPassword(){
        const password = faker.internet.password();
        await this.newPassword.fill(password);
        await this.confirmPassword.fill(password);
        await this.btnResetPassword.click();

        return password;
    }
}