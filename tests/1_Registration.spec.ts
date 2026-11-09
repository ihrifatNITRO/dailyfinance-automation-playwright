import { test, expect } from '@playwright/test';
import {RegistrationPage} from "../pages/Registration.page";
import {PersonModel} from "../userModel/person.model";

test('Doing registration', async ({ page }) => {

  const registrationPage = new RegistrationPage(page);
  const randomUser = new PersonModel();

  await page.goto('/register');

  await registrationPage.fillRegistration(randomUser);



  await page.pause();
})