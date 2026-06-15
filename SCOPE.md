# Project Scope & Data Anomalies Log

## Database Schema

The application uses **SQLite** with the following Prisma relational schema:

- **User**: Stores users (`id`, `name`, `email`, `passwordHash`).
- **Group**: Stores groups (`id`, `name`).
- **GroupMembership**: Tracks when users join/leave a group (`groupId`, `userId`, `joinedAt`, `leftAt`). This ensures members who join later aren't retroactively billed for old expenses.
- **Expense**: Core expense record (`groupId`, `paidById`, `amount`, `originalCurrency`, `convertedAmount`, `exchangeRate`, `description`, `date`).
- **ExpenseSplit**: The exact amount owed by each user for a specific expense (`expenseId`, `userId`, `amount`).
- **Settlement**: Records when a user pays back another user (`groupId`, `paidById`, `paidToId`, `amount`, `date`).
- **AnomalyLog**: Stores problems found during CSV import and the action taken, surfaced to the user in the Import Report UI.

---

## CSV Anomaly Log & Resolution Policy

The importer strictly follows these policies when ingesting `expenses_export.csv`. Each triggered policy will be saved to the database and displayed in the Import Report.

| Problem Detected | Policy & Action Taken |
| :--- | :--- |
| **Exact Duplicate Row**<br>*(e.g., "Dinner at Marina Bites" vs "dinner - marina bites")* | **Action:** The importer hashes the `date`, `amount`, and `paid_by` fields. If an exact match exists, the subsequent row is skipped. |
| **Conflicting Duplicate**<br>*(e.g., "Dinner at Thalassa" vs "Thalassa dinner")* | **Action:** Ingest both if dates/amounts differ slightly, but based on the notes ("hers is wrong"), the app skips the row with the lower amount or specific note flag. |
| **Missing `paid_by`**<br>*(e.g., "House cleaning supplies")* | **Action:** Row skipped. An expense without a payer cannot be credited to anyone. |
| **Settlements logged as Expenses**<br>*(e.g., "Rohan paid Aisha back", "Sam deposit share")* | **Action:** If the `split_with` contains exactly one person and the notes indicate a settlement or deposit, it is inserted into the `Settlement` table instead of the `Expense` table. |
| **Percentages > 100%**<br>*(e.g., "Pizza Friday" 30+30+30+20)* | **Action:** The importer normalizes the percentages so they sum to 100% exactly (e.g., each 30% becomes 27.27%, 20% becomes 18.18%). |
| **Ambiguous Split Type**<br>*(e.g., "Aisha birthday cake" is `unequal` but gives exact details)* | **Action:** If `split_details` provides numeric values that sum exactly to the total amount, the `split_type` is coerced to `exact`. |
| **Foreign Currency (USD)**<br>*(e.g., "Goa villa booking", "Beach shack lunch")* | **Action:** The importer converts the USD amount to INR using a fixed exchange rate (e.g., 1 USD = 83 INR). The app records both `originalCurrency` and `convertedAmount`. |
| **Negative Amounts**<br>*(e.g., "Parasailing refund" -30 USD)* | **Action:** Treated as a refund. It creates a negative expense which automatically reduces the balance owed by the split members. |
| **Non-Group Guest**<br>*(e.g., "Kabir joined for the day")* | **Action:** Kabir is dynamically created as a User and added to the expense split, but not added to the core flatmate Group. He will appear in the "Who owes whom" summary as a one-off debtor. |
| **Malformed Dates**<br>*(e.g., "Mar-14", "04-05-2026")* | **Action:** `Mar-14` is parsed to `14-03-2026`. `04-05-2026` is parsed contextually based on surrounding rows to `05-04-2026` (April 5th) to maintain chronological order. |
| **Missing Currency**<br>*(e.g., "Groceries DMart" Priya 2105)* | **Action:** Defaults to the group's base currency (`INR`). |
| **Former Member in Split**<br>*(e.g., "Groceries BigBasket" on April 2 includes Meera)* | **Action:** The importer checks `leftAt` dates. Since Meera moved out in March, she is removed from the `split_with` array and the expense is re-split among the remaining valid members. |
| **Zero Amount**<br>*(e.g., "Dinner order Swiggy")* | **Action:** Row skipped as it has zero financial impact. |
| **Conflicting Split Type/Details**<br>*(e.g., "Furniture for common room" is `equal` but has shares)* | **Action:** If `split_details` are provided, they override the `equal` split type, coercing it to `share` and computing fractions based on the provided shares. |
