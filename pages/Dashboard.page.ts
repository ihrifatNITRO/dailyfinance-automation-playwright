import {Locator, Page} from "@playwright/test";
import {faker} from "@faker-js/faker";

export class DashboardPage {
    page: Page;
    btnAddCost: Locator;
    itemName: Locator;
    amount: Locator;
    purchaseDate: Locator;
    month: Locator;
    remarks: Locator;
    btnSubmit: Locator;

    constructor(page: Page) {
        this.page = page;
        this.btnAddCost = page.getByRole("button", { name: "Add Cost" });
        this.itemName = page.getByRole("textbox", { name: "Item Name" });
        this.amount = page.getByRole("spinbutton", { name: "Amount" });
        this.purchaseDate = page.getByRole("textbox", { name: "Purchase Date" });
        this.month = page.getByLabel("Month");
        this.remarks = page.getByRole("textbox", { name: "Remarks" });
        this.btnSubmit = page.getByRole("button", { name: "Submit" });
    }

    async clickAddCost() {
        await this.btnAddCost.click();
    }
    async addNewCost(){
        const itemName = faker.book.title();
        await this.itemName.fill(itemName);
        const amount = faker.number.int({min: 1, max: 1000});
        await this.amount.fill(String(amount));
        await this.purchaseDate.fill('2000-01-01');
        await this.month.selectOption('June');
        const remarks = faker.lorem.sentence();
        await this.remarks.fill(remarks);
        await this.btnSubmit.click();
    }
}