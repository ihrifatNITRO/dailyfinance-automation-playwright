# Daily Finance — End-to-End Test Automation Framework

[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Playwright](https://img.shields.io/badge/Playwright-1.65.0-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Faker.js](https://img.shields.io/badge/@faker--js/faker-10.6.0-blue)](https://fakerjs.dev/)
[![Dotenv](https://img.shields.io/badge/Dotenv-18.0.10-ECD53F?logo=dotenv&logoColor=black)](https://github.com/motdotla/dotenv)
[![Design Pattern](https://img.shields.io/badge/Design%20Pattern-Page%20Object%20Model%20(POM)-brightgreen)](#architecture--design-pattern)

A robust, scalable UI and API test automation framework for the **Daily Finance** web application ([https://dailyfinance.roadtocareer.net/](https://dailyfinance.roadtocareer.net/)). Built using **TypeScript**, **Playwright Test**, and **Faker.js**, following enterprise-grade **Page Object Model (POM)** principles, dynamic data generation, Google Gmail REST API integration with resilient asynchronous polling for email verification and password reset workflows, session state persistence (`storageState`), and end-to-end user lifecycle integration.

---

## Table of Contents

- [Architecture & Design Pattern](#architecture--design-pattern)
- [Playwright Configuration Architecture](#playwright-configuration-architecture)
- [End-to-End Test Suite Sequence](#end-to-end-test-suite-sequence)
  - [Execution Flow Diagram](#execution-flow-diagram)
  - [Detailed Test Sequence & Scenarios](#detailed-test-sequence--scenarios)
- [Test Data & State Management](#test-data--state-management)
- [Tech Stack & Dependencies](#tech-stack--dependencies)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Running Tests](#running-tests)
- [Project Structure](#project-structure)
- [Reporting & Artifacts](#reporting--artifacts)

---

## Architecture & Design Pattern

The framework is architected for high maintainability, reusability, and stability:

- **Page Object Model (POM):** Clean separation between page web element locators (`page.getByRole`, `page.locator`), user interactions/actions in `pages/`, and test validations in `tests/`.
- **Modular Data Modeling:** Encapsulates synthetic user profile generation within `PersonModel` (`userModel/person.model.ts`), leveraging `@faker-js/faker` for realistic, collision-free dynamic test data per execution.
- **Third-Party API Integration (Gmail API):** Custom API service (`services/gmailVerification.service.ts`) interacting with the Google Gmail REST API v1 using Playwright's `request` context and OAuth2 Bearer authentication to programmatically fetch activation emails and password reset links. Features HTTP response verification (`response.ok()`), context lifecycle cleanup (`api.dispose()`), and recipient-based query filtering (`q: "to:..."`).
- **Resilient Dynamic Polling:** Uses Playwright's `expect.poll()` in email-dependent tests (`1_Registration.spec.ts` and `5_ResetPassword.spec.ts`) instead of fragile static timeouts (`waitForTimeout`), polling Gmail dynamically until the message arrives.
- **Session & State Management (`storageState`):** Uses Playwright's native authentication state persistence (`playwright/.auth/user.json`) captured via `3_Auth.spec.ts`. Default `storageState` is configured in `playwright.config.ts` for authenticated tests (`4_Dashboard.spec.ts`, `6_Profile.spec.ts`), while unauthenticated guest tests (`1_Registration.spec.ts`, `2_Login.spec.ts`, `5_ResetPassword.spec.ts`) explicitly reset context via `test.use({ storageState: { cookies: [], origins: [] } })`.
- **Dynamic Table Scraping & Export:** Built-in automated pagination traversal and HTML table parsing inside `DashboardPage` to extract and export active expense records into formatted CSV datasets (`utils/dashboard_table.csv`).
- **Data Persistence:** Synchronizes newly registered user credentials and updated passwords directly into structured JSON (`utils/users.json`) across sequential test runs.

---

## Playwright Configuration Architecture

The test runner configuration (`playwright.config.ts`) is customized from standard defaults to support environment-driven secrets, headed debug visibility, sequential test ordering, and session reuse:

### Key Configuration Directives & Rationale

| Configuration Block | Setting / Value | Purpose & Architectural Rationale |
| :--- | :--- | :--- |
| **Environment Secrets (`dotenv`)** | `dotenv.config({ path: path.resolve(__dirname, '.env') })` | Resolves absolute `.env` path dynamically so Google OAuth2 credentials (`GMAIL_ACCESS_TOKEN`) load seamlessly regardless of execution directory. |
| **Base Application URL** | `baseURL: 'https://dailyfinance.roadtocareer.net/'` | Normalizes target routing so POM page models use clean relative paths (e.g., `page.goto('/register')`, `page.goto('/user')`). |
| **Headed Mode Default** | `headless: false` | Launches real visible browser sessions by default for visual inspection during test development and debugging. |
| **Viewport & Window Geometry** | `viewport: { width: 800, height: 700 }`<br>`launchOptions.args: ['--window-size=900,800', '--no-sandbox']` | Enforces a compact, standardized window/canvas footprint to prevent responsive UI layout drift and ensure container compatibility. |
| **Execution Flow & Concurrency** | `fullyParallel: false`<br>`workers: 2` | Runs tests in orderly alphabetical/numeric sequence (`1_` through `6_`) to respect data dependencies across user lifecycle stages. |
| **Session State Default** | `storageState: 'playwright/.auth/user.json'` | Configures authenticated session as default for dashboard and profile tests; unauthenticated specs override this locally via `test.use()`. |
| **CI/CD Guardrails** | `forbidOnly: !!process.env.CI`<br>`retries: process.env.CI ? 2 : 0` | Prevents leftover `test.only` blocks from passing on CI and adds automatic retries for transient CI latency. |
| **Diagnostic Tracing** | `trace: 'on-first-retry'` | Captures detailed DOM/network/action traces on test failure retries without storage overhead on clean runs. |

---

## End-to-End Test Suite Sequence

The test suite executes a sequential, 6-phase end-to-end user lifecycle workflow where output credentials from earlier stages are dynamically consumed by subsequent phases:

### Execution Flow Diagram

```text
+-----------------------------------------------------------------------------------+
|                            E2E Automation Workflow                                |
+-----------------------------------------------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |  1. User Registration (1_Registration)      |
                   |  - Run in guest session (empty storageState)|
                   |  - Generate synthetic user via PersonModel  |
                   |  - Fill registration form & submit          |
                   |  - Poll Gmail API until email is received   |
                   |  - Append credentials to utils/users.json   |
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |  2. User Authentication (2_Login)           |
                   |  - Run in guest session (empty storageState)|
                   |  - Load latest credentials from users.json  |
                   |  - Perform login & assert dashboard redirect|
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |  3. Global Auth Setup (3_Auth)              |
                   |  - Clean guest context login                |
                   |  - Authenticate latest registered user      |
                   |  - Save storageState to .auth/user.json     |
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |  4. Expense Management (4_Dashboard)        |
                   |  - Reuse authenticated storageState session |
                   |  - Add 2 cost items dynamically             |
                   |  - Accept browser dialog confirmation       |
                   |  - Scrape paginated cost table & export CSV |
                   |  - Logout from dashboard menu               |
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |  5. Password Reset (5_ResetPassword)        |
                   |  - Run in guest session (empty storageState)|
                   |  - Request reset email for latest user      |
                   |  - Poll Gmail API & extract reset link      |
                   |  - Submit new password via reset URL        |
                   |  - Update new password in utils/users.json  |
                   +---------------------------------------------+
                                          |
                                          v
                   +---------------------------------------------+
                   |  6. Profile Picture Upload (6_Profile)      |
                   |  - Access profile in authenticated session  |
                   |  - Trigger file chooser & upload avatar     |
                   |  - Verify updated image src attribute       |
                   +---------------------------------------------+
```

---

### Detailed Test Sequence & Scenarios

#### 1. Phase 1 — User Registration (`1_Registration.spec.ts`)
*Context: Guest / Unauthenticated (`storageState: { cookies: [], origins: [] }`)*

| Priority | Test Name | Scenario Type | Description & Validation |
| :---: | :--- | :---: | :--- |
| **P1** | `Doing registration` | Positive (E2E) | Generates dynamic user credentials (first name, last name, Gmail alias with random seed, password, phone number, address, gender) using `PersonModel`. Submits registration form at `/register`, uses `expect.poll()` to dynamically query the Gmail REST API for the confirmation email matching `to:${user.email}`, asserts receipt from `"Road to Career"`, and appends the new record to `utils/users.json`. |

#### 2. Phase 2 — User Authentication (`2_Login.spec.ts`)
*Context: Guest / Unauthenticated (`storageState: { cookies: [], origins: [] }`)*

| Priority | Test Name | Scenario Type | Description & Validation |
| :---: | :--- | :---: | :--- |
| **P1** | `Doing login` | Positive (E2E) | Reads the latest registered user credentials from `utils/users.json` and submits the login form at `/login`. Asserts successful login by verifying navigation to the user dashboard (`/user`). |

#### 3. Phase 3 — Global Authentication Setup (`3_Auth.spec.ts`)
*Context: Session Setup (`storageState: { cookies: [], origins: [] }`)*

| Priority | Test Name | Scenario Type | Description & Validation |
| :---: | :--- | :---: | :--- |
| **Pre-Hook** | `authenticate` | Session Setup | Authenticates the latest user from `utils/users.json` on `/login`, verifies navigation to `/user`, and captures the complete browser authentication context (cookies, tokens, and `localStorage`) into `playwright/.auth/user.json` for subsequent authenticated tests. |

#### 4. Phase 4 — Expense Management & Table Scraping (`4_Dashboard.spec.ts`)
*Context: Authenticated Session (Default `storageState`)*

| Priority | Test Name | Scenario Type | Description & Validation |
| :---: | :--- | :---: | :--- |
| **P1** | `Adding 2 items` | Functional (E2E) | Launches dashboard under authenticated session. Iteratively creates 2 new expense entries with randomized book titles, amounts (1–1000), date (`2000-01-01`), month selection (`June`), and remarks. Handles browser confirmation dialogs (`dialog.accept()`). Automatically iterates across all pagination pages to scrape table records, exports them to `utils/dashboard_table.csv`, and performs user logout. |

#### 5. Phase 5 — Password Recovery & Reset (`5_ResetPassword.spec.ts`)
*Context: Guest / Unauthenticated (`storageState: { cookies: [], origins: [] }`)*

| Priority | Test Name | Scenario Type | Description & Validation |
| :---: | :--- | :---: | :--- |
| **P1** | `Reset Password` | Functional (E2E) | Loads the latest user email from `utils/users.json`, submits a password reset request at `/forgot-password`, uses `expect.poll()` to query the Gmail REST API for the reset email, extracts the reset link, navigates to the reset URL, inputs a new random password, submits the change, and writes the updated password back into `utils/users.json`. |

#### 6. Phase 6 — Profile Picture Upload (`6_Profile.spec.ts`)
*Context: Authenticated Session (Default `storageState`)*

| Priority | Test Name | Scenario Type | Description & Validation |
| :---: | :--- | :---: | :--- |
| **P1** | `Upload Profile Picture` | Functional (E2E) | Navigates to `/user` under authenticated state, opens user profile via the account menu, clicks edit, binds file chooser event to upload `resources/profile_photo.png`, submits upload, and asserts that the avatar image `src` attribute contains the updated `/profileImage/` path. |

---

## Test Data & State Management

| Resource File | Purpose & Role in Test Pipeline |
| :--- | :--- |
| `utils/users.json` | Centralized JSON store for registered test users. Accounts are dynamically appended during registration and updated during password reset. |
| `playwright/.auth/user.json` | Saved browser session state (cookies, `localStorage`, and session tokens) for fast authenticated testing across dependent test suites. |
| `services/gmailVerification.service.ts` | Gmail REST API integration service utilizing `GMAIL_ACCESS_TOKEN` from `.env` with response validation, resource disposal, and recipient filtering. |
| `userModel/person.model.ts` | Dynamic synthetic test data model generating realistic person details with `@faker-js/faker`. |
| `resources/profile_photo.png` | Static test image artifact used for profile avatar upload validation. |
| `utils/dashboard_table.csv` | Output dataset generated by table scraping logic during dashboard tests. |
| `.env` | Stores environment configurations and API secrets (e.g., `GMAIL_ACCESS_TOKEN`). |

---

## Tech Stack & Dependencies

- **Language:** TypeScript / JavaScript (Node.js 18+)
- **Test Runner & Automation Framework:** Playwright Test (`@playwright/test` ^1.65.0)
- **Test Data Generation:** `@faker-js/faker` (^10.6.0)
- **Environment Variable Management:** `dotenv` (^18.0.10)
- **API Client:** Playwright APIRequestContext (`@playwright/test`)
- **Type Definitions:** `@types/node` (^26.6.6)
- **Browser Automation:** Chromium, Firefox, WebKit (Headed / Headless with custom viewport configuration)

---

## Prerequisites

- **Node.js:** Version 18.x or higher installed on your machine.
- **npm:** Node Package Manager (bundled with Node.js).
- **Google Chrome / Playwright Browsers:** Installed via `npx playwright install`.
- **Gmail API Token (Required for Email Verification & Password Reset):** Valid Google OAuth2 access token with `https://www.googleapis.com/auth/gmail.readonly` scope configured in `.env` as `GMAIL_ACCESS_TOKEN`.
- **Network Access:** Stable internet connection to access the live web application (`https://dailyfinance.roadtocareer.net/`).

---

## Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd dailyfinance-automation-playwright
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Install required Playwright browser binaries:**
   ```bash
   npx playwright install
   ```

4. **Configure Environment Variables:**
   Create a `.env` file in the project root:
   ```env
   GMAIL_ACCESS_TOKEN=your_google_gmail_oauth_access_token_here
   ```

---

## Running Tests

### 1. Run Complete End-to-End Test Suite

Executes all test specifications in sequential order:

- **Windows (PowerShell / CMD):**
  ```powershell
  npx playwright test
  ```

- **macOS / Linux:**
  ```bash
  npx playwright test
  ```

### 2. Run Tests in Headless Mode

```powershell
npx playwright test --headed=false
```

### 3. Run Specific Test File

To execute individual test scenarios:

```powershell
# Run 1. Registration & Email Verification test
npx playwright test tests/1_Registration.spec.ts

# Run 2. Login test
npx playwright test tests/2_Login.spec.ts

# Run 3. Auth Setup (Generates .auth/user.json)
npx playwright test tests/3_Auth.spec.ts

# Run 4. Dashboard & Table Scraping test
npx playwright test tests/4_Dashboard.spec.ts

# Run 5. Password Reset test
npx playwright test tests/5_ResetPassword.spec.ts

# Run 6. Profile Picture Upload test
npx playwright test tests/6_Profile.spec.ts
```

### 4. Run Tests with Interactive UI Mode or Debugger

```powershell
# Open interactive Playwright UI mode
npx playwright test --ui

# Run in step-by-step debug mode
npx playwright test --debug
```

### 5. View Test Execution Report

```powershell
npx playwright show-report
```

---

## Project Structure

```text
dailyfinance-automation-playwright
├── pages/                                # Page Object Model (POM) classes
│   ├── Dashboard.page.ts                 # Expense management, table scraping & CSV export
│   ├── Login.page.ts                     # Login form elements & action methods
│   ├── Profile.page.ts                   # User profile editing & photo upload interactions
│   ├── Registration.page.ts              # Account registration form elements & actions
│   └── ResetPassword.page.ts             # Password reset request & confirmation interactions
├── playwright/
│   └── .auth/
│       └── user.json                     # Cached browser authentication session state
├── resources/
│   └── profile_photo.png                 # Sample image asset for profile upload testing
├── services/
│   └── gmailVerification.service.ts      # Resilient Gmail REST API client with query filters & status checks
├── tests/                                # Sequential E2E test specifications
│   ├── 1_Registration.spec.ts            # Phase 1: User registration & dynamic Gmail polling
│   ├── 2_Login.spec.ts                   # Phase 2: User authentication validation test
│   ├── 3_Auth.spec.ts                    # Phase 3: Global authentication setup script
│   ├── 4_Dashboard.spec.ts               # Phase 4: Expense creation, table scraping & CSV export test
│   ├── 5_ResetPassword.spec.ts           # Phase 5: Forgot password & reset link polling workflow
│   └── 6_Profile.spec.ts                 # Phase 6: Profile image upload validation test
├── userModel/
│   └── person.model.ts                   # Synthetic user data model using Faker.js
├── utils/
│   ├── dashboard_table.csv               # Scraped expense records exported to CSV
│   └── users.json                        # Central test user repository & credentials
├── .env                                  # Environment secrets (Gmail API token)
├── package.json                          # Node dependencies & project metadata
├── package-lock.json                     # Locked dependency tree
├── playwright.config.ts                  # Playwright Test configuration
└── README.md                             # Project documentation
```

---

## Reporting & Artifacts

Test execution reports and traces are automatically generated by Playwright upon test completion:

- **Playwright HTML Test Report:**
  ```text
  playwright-report/index.html
  ```
- **Test Results & Artifacts (Screenshots, Videos, Traces):**
  ```text
  test-results/
  ```
- **Exported Table Data:**
  ```text
  utils/dashboard_table.csv
  ```

To open the generated HTML test report in your default browser, run:
```bash
npx playwright show-report
```
