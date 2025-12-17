# Court Booking Platform

A full-stack web application for managing sports facility bookings with dynamic pricing, resource management, and atomic transactions.

## Tech Stack
- **Backend**: Node.js, Express, MongoDB
- **Frontend**: React, Vite
- **Database**: MongoDB (Mongoose ODM)

## Features
- **Multi-resource Booking**: Book Courts, Equipment, and Coaches in a single transaction.
- **Dynamic Pricing**: Engine calculates costs based on Peak Hours, Weekends, and Resource rates.
- **Atomic Transactions**: Prevents double-booking even under high concurrency.
- **Admin Dashboard**: Manage Resources and Pricing Rules dynamically.

## Setup Instructions

### Prerequisites
- Node.js (v14+)
- MongoDB (Local or Atlas URI)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/VENKYREDDY14/court-booking.git
   cd court-booking
   ```

2. **Backend Setup**
   ```bash
   cd server
   npm install
   
   # Setup Environment Variables
   # Create a .env file in /server copying the example or using:
   # MONGO_URI=mongodb://localhost:27017/court-booking
   # PORT=5000
   
   # Seed the Database (CRITICAL FIRST STEP)
   node seeder.js
   
   # Start Server
   npm run dev
   ```

3. **Frontend Setup**
   ```bash
   cd client
   npm install
   
   # Create .env file
   # VITE_API_URL=http://localhost:5000
   
   # Start Client
   npm run dev
   ```

4. **Access the App**
   - Frontend: `http://localhost:5173` (or port shown in terminal)
   - Admin Panel: Click "Admin Panel" button on top right.

## Assumptions Made
1. **User Identity**: For this MVP, we use a mock "Guest User" or allow typing a name. Full Auth (JWT) was out of scope but the DB model supports a `userId` string.
2. **Currency**: All prices are in USD ($).
3. **Time Slots**: Bookings are hourly for simplicity, but the logic supports minute-level precision if the frontend time picker is adjusted.
4. **Business Hours**: The system doesn't explicitly block 3AM bookings unless a "Closed" availability rule is added (not currently seeded).

## Technical Design & Pricing Engine Approach

### Database Schema Design
The database is designed around strict separation of concerns and data integrity.

- **Resource Models (`Court`, `Equipment`, `Coach`)**: Standalone collections defining base attributes (base price, total quantity).
- **`PricingRule` Model**: Decouples business logic from code. Rules are stored as data, allowing Admins to change "Peak Hours" or "Weekend Rates" without redeploying.
    - Fields: `type` (PEAK, WEEKEND), `conditions` (Time range, Days), `value` (Multiplier/Adder).
- **`Booking` Model**: The central record. Contains references to all resources. 
    - **Concurrency Control**: A unique compound index on `{ court: 1, date: 1, startTime: 1 }` provides a hard database-level constraint against double-booking the same slot.

### Pricing Engine
The `PricingService` is a stateless engine that calculates costs dynamically.

1. **Base Calculation**: Starts with the Court's base hourly rate.
2. **Rule Application**: Fetches active rules from DB. Iterates through them to check applicability (e.g., Is the booking time overlap with Peak Hours?).
    - **Stacking**: logic applies methods sequentially. Typically `Base * Multiplier1 * Multiplier2`.
    - **Adders**: Adds fixed costs (like Equipment rental) or hourly add-ons (Coach fees) after multipliers are applied to the court fee.
3. **Result**: Returns a final integer price (rounded up).

This modular approach ensures that "Business Logic" is configuration-driven, satisfying the requirement for Admin-managed pricing.

### Atomic Booking Transaction
To handle multi-resource bookings (Court + Shoes + Coach), we use **MongoDB Sessions (Transactions)**.
1. Start Transaction.
2. Verify availability of ALL resources (Court empty? Coach free? Shoes in stock?).
3. Calculate final price (to prevent frontend tampering).
4. Insert Booking.
5. Commit Transaction.
    - If any step fails (e.g. someone booked the last shoe 1ms ago), the entire transaction aborts, ensuring data consistency.
