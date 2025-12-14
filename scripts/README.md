# Database Management Scripts

This directory contains scripts for managing the Supabase database directly from your IDE. No need to use the Supabase dashboard for routine operations!

## Setup

### 1. Get Your Service Role Key

1. Go to your Supabase Dashboard
2. Navigate to: **Settings** → **API**
3. Under "Project API keys", find the **service_role** key (marked as "secret")
4. Copy the key

### 2. Add to Environment Variables

Add this to your `.env.local` file:

```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**⚠️ SECURITY WARNING**:
- The service role key bypasses Row Level Security (RLS)
- NEVER commit this key to git
- NEVER expose this key to the client-side code
- Only use it in server-side scripts

## Available Commands

### Seed Achievements

Populates the achievements table with all 17 achievements:

```bash
npm run db:seed-achievements
```

This will:
- ✅ Insert all achievements if they don't exist
- ⏭️  Skip achievements that are already in the database
- 📊 Show a summary of what was inserted

**Run this whenever you:**
- Set up a new database
- Add new achievements to the seed data
- Reset your achievements table

---

### Grant All Achievements to a User

Give a specific user all achievements (useful for testing):

```bash
npm run db:grant-achievements <username>
```

**Example:**
```bash
npm run db:grant-achievements CoDeBarS
```

This will:
- 🔍 Find the user by username
- ✅ Grant all achievements they don't have
- 🎯 Award the points for each achievement
- 📊 Update the user's achievement counter

**Run this whenever you:**
- Want to test the achievement display
- Need to give someone all achievements for testing
- Verify the profile page shows achievements correctly

---

### Run Database Migrations

Execute SQL migration files:

```bash
npm run db:migrate <migration-file>
```

**Example:**
```bash
npm run db:migrate add_achievements.sql
```

This will:
- 📄 Read the migration file from `supabase/migrations/`
- 📋 Split it into individual SQL statements
- ✅ Execute each statement
- 📊 Show success/failure for each

**Run this whenever you:**
- Create a new migration file
- Need to update database schema
- Add new tables or columns

---

## File Structure

```
scripts/
├── README.md                    # This file
├── db-admin.ts                  # Admin client with service role
├── seed-achievements.ts         # Seeds achievements data
├── grant-all-achievements.ts    # Grants achievements to users
└── run-migration.ts             # Runs SQL migrations
```

## Common Workflows

### Fresh Database Setup

```bash
# 1. Run the achievements migration
npm run db:migrate add_achievements.sql

# 2. Seed the achievements
npm run db:seed-achievements

# 3. Grant achievements to test user (optional)
npm run db:grant-achievements CoDeBarS
```

### Adding New Achievements

1. Edit `scripts/seed-achievements.ts`
2. Add your new achievement to the `achievementSeeds` array
3. Run: `npm run db:seed-achievements`

### Testing Achievement Display

```bash
# Grant all achievements to your test user
npm run db:grant-achievements YourUsername

# Start the dev server and check the profile page
npm run dev
```

## Troubleshooting

### "Missing Supabase credentials"

Make sure you have both variables in your `.env.local`:
- `VITE_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### "achievements table does not exist"

Run the migration first:
```bash
npm run db:migrate add_achievements.sql
```

### "User not found"

Make sure the username exists in your database. Check the exact spelling (case-sensitive).

### "Row-level security policy violated"

This means you're using the anon key instead of the service role key. Make sure `SUPABASE_SERVICE_ROLE_KEY` is set correctly.

## Best Practices

1. **Always seed achievements** after running migrations
2. **Test with a dedicated test user** before affecting real users
3. **Keep service role key secure** - never commit it
4. **Run migrations in order** if you have multiple migration files
5. **Backup your database** before running destructive migrations

## Adding New Scripts

To add a new database script:

1. Create a new `.ts` file in the `scripts/` directory
2. Import the admin client: `import supabaseAdmin from './db-admin.js'`
3. Use `supabaseAdmin` for all database operations
4. Add a new script to `package.json`

Example:
```typescript
import supabaseAdmin from './db-admin.js'

async function myScript() {
  const { data, error } = await supabaseAdmin
    .from('your_table')
    .select('*')

  // Your logic here
}

myScript()
```
