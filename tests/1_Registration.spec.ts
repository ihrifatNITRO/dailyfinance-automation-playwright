import { test, expect } from '@playwright/test';
import {RegistrationPage} from "../pages/Registration.page";
import {PersonModel} from "../userModel/person.model";
import {fetchEmail} from "../services/gmailVerification.service";
import * as fs from "node:fs";

// reset storageState so registration always runs as a guest user
test.use({storageState: {cookies: [], origins: []}});

test('Doing registration', async ({ page }) => {
  // making objects of the page and usermodel
  const registrationPage = new RegistrationPage(page);
  const randomUser = new PersonModel();

  // Navigate to registration page and submit registration form
  await page.goto('/register');
  await registrationPage.fillRegistration(randomUser);

  // Poll Gmail until the registration email arrives (Playwright best practice over static waitForTimeout)
  // Checks every 2 seconds for up to 30 seconds
  await expect.poll(async () => {
    try {
      return await fetchEmail(`to:${randomUser.email}`);
    } catch {
      return null;
    }
  }, {
    message: "Registration email was not received within the timeout period.",
    timeout: 30_000,
    intervals: [2_000]
  }).toContain("Road to Career");

  // reading from users.json
  const rawData = fs.readFileSync('utils/users.json', 'utf8');
  const users = rawData ? JSON.parse(rawData) : [];
  // saving user details on user.json
  users.push(randomUser);
  // writing back to users.json
  fs.writeFileSync('utils/users.json', JSON.stringify(users, null, 2));

  // await page.pause();
})