import {test} from "@playwright/test";
import {DashboardPage} from "../pages/Dashboard.page";

test("Adding 2 items", async ({page}) => {
    // making object instance
    const dashboardPage = new DashboardPage(page);

    await page.goto('/user');
    for (let i=0; i<2; i++){
        await dashboardPage.clickAddCost();
        await dashboardPage.addNewCost();
    }

    await dashboardPage.exportTableToCsv();
})