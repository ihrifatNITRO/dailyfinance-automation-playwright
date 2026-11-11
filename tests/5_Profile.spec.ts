import {expect, test} from "@playwright/test";
import {ProfilePage} from "../pages/Profile.page";
import path from "path";

test("Upload Profile Picture", async ({page}) => {
    const profilePage = new ProfilePage(page);

    const filePath = path.resolve(__dirname, '../resources', 'profile_photo.png');
    await page.goto('/user');
    await profilePage.uploadProfileImage(filePath);

    const profileImg = page.getByRole('img', {name: 'User'});
    await expect(profileImg).toHaveAttribute('src', /profileImage/);
})