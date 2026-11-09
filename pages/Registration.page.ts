import {Locator, Page} from "@playwright/test";
import {PersonModel} from "../userModel/person.model";


export class RegistrationPage {

    readonly page: Page;
    readonly firstName: Locator;
    readonly lastName: Locator;
    readonly email: Locator;
    readonly password: Locator;
    readonly phoneNumber: Locator;
    readonly address: Locator;
    readonly termsCheckbox: Locator;
    readonly btnRegister: Locator;

    constructor(page: Page) {
        this.page = page;
        this.firstName = page.getByRole("textbox", {name: "First Name"});
        this.lastName = page.getByRole("textbox", {name: "Last Name"});
        this.email = page.getByRole("textbox", {name: "Email"});
        this.password = page.getByRole("textbox", {name: "Password"});
        this.phoneNumber = page.getByRole("textbox", {name: "Phone Number"});
        this.address = page.getByRole("textbox", {name: "Address"});
        this.termsCheckbox = page.locator('.auth-checkbox').getByRole('checkbox');
        this.btnRegister = page.getByRole('button', { name: 'Register' });
    }

    async fillRegistration(user: PersonModel) {
        await this.firstName.fill(user.firstName);
        await this.lastName.fill(user.lastName);
        await this.email.fill(user.email);
        await this.password.fill(user.password);
        await this.phoneNumber.fill(user.phoneNumber);
        await this.address.fill(user.address);
        await this.page.locator(`input[value="${user.gender}"]`).check();
        await this.termsCheckbox.check();
        await this.btnRegister.scrollIntoViewIfNeeded();
        await this.btnRegister.click();
    }
}