# Prisma Seed Setup for Winstory Moderation

This document explains how to set up and use the Prisma seed to populate your database with test campaigns for the moderation system.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set up Database
Make sure your `DATABASE_URL` is configured in your `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/winstory_db"
```

### 3. Generate Prisma Client
```bash
npm run db:generate
```

### 4. Push Schema to Database
```bash
npm run db:push
```

### 5. Seed the Database
```bash
npm run db:seed
```

## 📊 What Gets Created

The seed script creates 4 test campaigns:

### Initial Story Campaigns
1. **Nike Running Challenge** (B2C & Agencies)
   - Company: Nike Inc.
   - Agency: Wieden+Kennedy
   - Content: Running inspiration story
   - Rewards: Nike shoes, Apple Watch, coaching

2. **Street Art Revolution** (Individual Creators)
   - Creator: Independent street artist
   - Content: Urban transformation story
   - Rewards: None (individual creator)

### Completion Campaigns
3. **Nike Community Completions** (For B2C)
   - Company: Nike Inc.
   - Content: Community running stories
   - Rewards: WINC tokens, certificates

4. **Art Community Collaborations** (For Individuals)
   - Creator: Street artist community
   - Content: Artistic collaborations
   - Rewards: WINC tokens, virtual exhibitions

## 🛠️ Available Scripts

- `npm run db:seed` - Populate database with test data
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio to view/edit data

## 🔍 Viewing Data

### Prisma Studio
```bash
npm run db:studio
```
This opens a web interface where you can:
- View all campaigns
- Edit campaign data
- See relationships between models
- Add new test data

### Database Direct Access
You can also connect directly to your PostgreSQL database using any SQL client.

## 📝 Customizing Test Data

To modify the test campaigns:

1. Edit `prisma/seed.ts`
2. Modify the campaign data objects
3. Run `npm run db:seed` again

**Note:** The seed script cleans the database before creating new data, so all existing test data will be replaced.

## 🧪 Testing the Moderation Interface

After seeding:

1. Start your development server: `npm run dev`
2. Navigate to `/moderation`
3. Connect your wallet
4. Test different tab combinations:
   - **Initial Story** → **B2C & Agencies** (should show Nike campaign)
   - **Initial Story** → **Individual Creators** (should show Street Art campaign)
   - **Completion** → **For B2C** (should show Nike completions)
   - **Completion** → **For Individuals** (should show Art collaborations)

## 🔄 Updating Schema

If you modify the Prisma schema:

1. Update `prisma/schema.prisma`
2. Run `npm run db:generate`
3. Run `npm run db:push`
4. Run `npm run db:seed` to recreate test data

## 🚨 Troubleshooting

### Common Issues

**"Property does not exist on PrismaClient"**
- Run `npm run db:generate` to regenerate the client

**"Table does not exist"**
- Run `npm run db:push` to create tables

**"Connection failed"**
- Check your `DATABASE_URL` in `.env`
- Ensure your database is running

### Reset Everything
```bash
# Drop and recreate database
npx prisma db push --force-reset

# Regenerate client
npm run db:generate

# Seed with test data
npm run db:seed
```

## 📚 Next Steps

Once you have test data:

1. **Test the moderation interface** with real campaign examples
2. **Identify UI improvements** based on real content
3. **Test edge cases** with various campaign types
4. **Iterate on the design** based on user feedback

## 🤝 Contributing

When adding new test campaigns:
- Use realistic but non-production data
- Include various content types and creator types
- Test both positive and edge cases
- Document any special requirements

---

**Happy Testing! 🎯** 