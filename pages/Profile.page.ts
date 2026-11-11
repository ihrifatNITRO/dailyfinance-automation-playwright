import {Locator, Page} from "@playwright/test";

export class ProfilePage{
    page: Page;
    btnAccount: Locator;
    menuProfile: Locator;
    btnEdit: Locator;
    btnChooseFile: Locator;
    btnUploadImage: Locator;

    constructor(page: Page){
        this.page = page;
        this.btnAccount = page.getByRole('button', { name: 'account of current user' });
        this.menuProfile = page.getByRole('menuitem', { name: 'Profile' });
        this.btnEdit = page.getByRole('button', { name: 'EDIT' });
        this.btnChooseFile = page.getByRole('button', { name: 'Choose File' });
        this.btnUploadImage = page.getByRole('button', { name: 'UPLOAD IMAGE' });
    }

    async uploadProfileImage(filePath: string){
        await this.btnAccount.click();
        await this.menuProfile.click();
        await this.btnEdit.click();
        // waiting for the file chooser dialog while clicking the 'Choose File' button
        const fileChooserPromise = this.page.waitForEvent('filechooser');
        await this.btnChooseFile.click();
        const fileChooser = await fileChooserPromise;
        // set the file to upload
        await fileChooser.setFiles(filePath);
        // waiting 1s for it to be upload
        await this.page.waitForTimeout(1000);
        await this.btnUploadImage.click();
    }
}