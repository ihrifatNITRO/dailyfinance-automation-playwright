import {Locator, Page} from "@playwright/test";
import {faker} from "@faker-js/faker";
import * as fs from "node:fs";

export class DashboardPage {
    page: Page;
    btnAddCost: Locator;
    itemName: Locator;
    amount: Locator;
    purchaseDate: Locator;
    month: Locator;
    remarks: Locator;
    btnSubmit: Locator;
    table: Locator;

    constructor(page: Page) {
        this.page = page;
        this.btnAddCost = page.getByRole("button", { name: "Add Cost" });
        this.itemName = page.getByRole("textbox", { name: "Item Name" });
        this.amount = page.getByRole("spinbutton", { name: "Amount" });
        this.purchaseDate = page.getByRole("textbox", { name: "Purchase Date" });
        this.month = page.getByLabel("Month");
        this.remarks = page.getByRole("textbox", { name: "Remarks" });
        this.btnSubmit = page.getByRole("button", { name: "Submit" });
        this.table = page.getByRole("table");
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
        this.page.once('dialog', async dialog => {
            await dialog.accept();
        });
        await this.btnSubmit.click();
    }

    async exportTableToCsv(filePath: string = "utils/dashboard_table.csv") {
        // Ensure table and rows are loaded and visible
        await this.table.waitFor({ state: 'visible', timeout: 10000 });
        await this.table.locator("tbody tr").first().waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});

        // 1. Read column headers (excluding "View" column)
        const headerElements = await this.table.locator("th").allInnerTexts();
        const headers = headerElements.map(h => h.trim());
        const validIndices = headers
            .map((h, i) => ({ h, i }))
            .filter(({ h }) => h.toLowerCase() !== "view")
            .map(({ i }) => i);

        const filteredHeaders = validIndices.map(i => headers[i]);
        const csvLines: string[] = [];

        if (filteredHeaders.length > 0) {
            csvLines.push(filteredHeaders.join(","));
        }

        const extractCurrentPageRows = async () => {
            const rows = await this.table.locator("tbody tr").all();
            for (const row of rows) {
                const cells = await row.locator("td").allInnerTexts();
                if (cells.length > 0) {
                    const rowValues = validIndices
                        .map(i => cells[i] !== undefined ? cells[i] : "")
                        .map(cell => `"${cell.trim().replace(/"/g, '""')}"`);
                    csvLines.push(rowValues.join(","));
                }
            }
        };

        const pageButtons = this.page.locator(".pagination-container button.page-number");
        const totalPages = await pageButtons.count();

        if (totalPages <= 1) {
            await extractCurrentPageRows();
        } else {
            for (let i = 0; i < totalPages; i++) {
                const btn = pageButtons.nth(i);
                await btn.click();
                await this.page.waitForTimeout(500);
                await this.table.locator("tbody tr").first().waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
                await extractCurrentPageRows();
            }
        }

        // 3. Write file (supports both csv and txt based on filePath)
        fs.writeFileSync(filePath, csvLines.join("\n"), "utf8");
    }
}