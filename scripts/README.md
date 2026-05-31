# Database Utility Scripts

## Seed Sample Data

This script seeds sample data for every core feature (topics, subtopics, notes,
flashcards, quizzes, and study sessions).

### Usage

```bash
npm run db:seed
```

### Optional: Clear Sample Data

```bash
npm run db:seed -- --clear
```

### Sample Account

- Email: `sample.user@example.com`
- Password: `SamplePass123!`

You can override the defaults using environment variables:

```bash
SAMPLE_USER_EMAIL=you@example.com
SAMPLE_USER_PASSWORD=ChangeMe123!
SAMPLE_USER_NAME="Your Name"
```

### What it does

- Creates a sample user (or reuses it if it exists)
- Adds topics, subtopics, notes, flashcards, quizzes, and study sessions
- Updates topic stats counts

## Clear Database

This script clears all data from your MongoDB database.

### Usage

```bash
npm run db:clear
```

### What it does

- Connects to your MongoDB database (using `MONGODB_URI` from `.env.local`)
- Lists all collections in the database
- Drops (deletes) all collections and their data
- Disconnects from the database

### ⚠️ Warning

**This operation is irreversible!** All data will be permanently deleted.

Only use this during development or when you want to start fresh with a clean database.

### Example Output

```
🔌 Connecting to MongoDB...
✅ Connected to MongoDB

📊 Found 4 collection(s)

⚠️  WARNING: This will delete ALL data from:
   - topics
   - flashcards
   - quizzes
   - notes

🗑️  Clearing all collections...

   ✓ Cleared: topics
   ✓ Cleared: flashcards
   ✓ Cleared: quizzes
   ✓ Cleared: notes

✅ Database cleared successfully! (4/4 collections)
👋 Disconnected from MongoDB
```

### Troubleshooting

- If you get "MONGODB_URI not found", make sure your `.env.local` file exists and contains the `MONGODB_URI` variable
- If the script fails to connect, check that MongoDB is running and the connection string is correct
- If you get permission errors, ensure your MongoDB user has the necessary privileges to drop collections
