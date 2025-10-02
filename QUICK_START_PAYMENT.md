# 🚀 Quick Start - Winstory Payment System

**Version**: 1.0 - Test Mode (Sandbox)  
**Estimated Time**: 10 minutes

---

## ✅ What's Already Done

✅ Stripe packages installed  
✅ Database updated (Payment models created)  
✅ API routes created (`/api/payment/create-intent` and `/api/payment/webhook`)  
✅ Payment modal component created  
✅ Mint and thank you pages configured  

**🎯 You're 5 minutes away from your first payment test!**

---

## 📝 Step 1: Get Your Stripe TEST Keys (2 min)

1. Go to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Create an account or sign in
3. **Enable TEST mode** (toggle at the top right of the page)
4. Go to **Developers > API Keys**
5. Copy your keys:
   - **Publishable key** (starts with `pk_test_...`)
   - **Secret key** (starts with `sk_test_...`) - click "Reveal"

---

## 🔧 Step 2: Configure Environment Variables (2 min)

Create a `.env.local` file at the project root:

```bash
# In the terminal, at the project root
touch .env.local
```

Then add this content (replace with YOUR keys):

```bash
# Stripe TEST Mode
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_temporary_for_local_tests

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database (if you already have a configured DB, keep it)
DATABASE_URL=postgresql://your_existing_url

# Company info (already pre-filled)
COMPANY_NAME=Winstory
COMPANY_IBAN=FR76 1741 8000 0100 0117 5195 874
COMPANY_BIC=SNNNFR22XXX
```

**⚠️ Important**: Never commit this file! It's already in `.gitignore`.

---

## 💾 Step 3: Update the Database (1 min)

```bash
# In the terminal
npm run db:push
```

This will create the `payments` and `payment_receipts` tables in your database.

**✅ You should see**: `Your database is now in sync with your schema.`

---

## 🎮 Step 4: Start the Server (1 min)

```bash
npm run dev
```

The server starts on `http://localhost:3000`

---

## 🧪 Step 5: Test a Payment (3 min)

### A. Access the mint page

Open your browser and go to:
- **B2C**: `http://localhost:3000/creation/b2c/mint`
- **Agency B2C**: `http://localhost:3000/creation/agencyb2c/mint`

### B. Initiate a payment

1. Click on **"Visa / Mastercard"** (or any button except USDC)
2. An elegant modal opens 🎉

### C. Enter test information

Use these Stripe test card details:

| Field | Value |
|-------|--------|
| **Card number** | `4242 4242 4242 4242` |
| **Expiration date** | `12/25` (any future date) |
| **CVC** | `123` (any 3-digit code) |
| **Zip code** | `75001` (any code) |
| **Email** | Your email (optional) |

### D. Validate the payment

1. Click on **"Pay $1000"** (or the displayed amount)
2. ⏳ Payment is processing...
3. ✅ Success! You're redirected to the thank you page
4. 🎬 After 10 seconds, automatic redirect to "My Creations"

---

## 🎉 Congratulations! Your First Payment is Validated

### Check the payment in Stripe Dashboard

1. Return to [dashboard.stripe.com](https://dashboard.stripe.com)
2. Make sure you're in **TEST mode**
3. Click on **"Payments"** in the left menu
4. You should see your payment with:
   - ✅ Status "Succeeded"
   - 💵 Amount $1000 (or your amount)
   - 🔖 Label "TEST MODE"

### Check in the database (optional)

```sql
SELECT * FROM payments ORDER BY "createdAt" DESC LIMIT 1;
```

You should see:
- `provider` = `"stripe"`
- `status` = `"PENDING_SETTLEMENT"`
- `amount` = `1000`
- `currency` = `"usd"`

---

## 🔍 Other Stripe Test Cards

To test different scenarios:

| Card | Number | Result |
|-------|--------|----------|
| ✅ Visa success | `4242 4242 4242 4242` | Payment succeeded |
| ❌ Visa declined | `4000 0000 0000 0002` | Card declined |
| ✅ Mastercard | `5555 5555 5555 4444` | Payment succeeded |
| ⚠️ 3D Secure | `4000 0025 0000 3155` | Requires authentication |

[Complete list of test cards](https://stripe.com/docs/testing)

---

## 🐛 Common Issues

### ❌ "Invalid API Key provided"

**Solution**: Check that your keys in `.env.local` are correct and that you've restarted the server (`npm run dev`).

### ❌ Modal doesn't open

**Solution**: 
1. Open browser console (F12)
2. Look at errors
3. Check that `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` is defined

### ❌ Error "Database connection failed"

**Solution**: Check your `DATABASE_URL` in `.env.local`.

### ❌ Webhook doesn't work

**Solution**: For now, in simple local test mode, webhooks aren't critical. Payment will work anyway. To test webhooks, install Stripe CLI (see `PAYMENT_SETUP_GUIDE.md`).

---

## 🎯 Next Steps

Now that the system works in test mode:

### Immediate (today)
- [ ] Test multiple payments
- [ ] Test with different cards
- [ ] Check complete B2C and AgencyB2C flow
- [ ] View payments in Stripe Dashboard

### Short term (this week)
- [ ] Configure webhooks locally (optional)
- [ ] Test errors and refunds
- [ ] Read `PAYMENT_SETUP_GUIDE.md` to go further

### Medium term (before production)
- [ ] Get LIVE Stripe keys
- [ ] Configure production webhooks
- [ ] Implement confirmation emails
- [ ] Generate PDF invoices

---

## 📚 Complete Documentation

To go further, check out:

- **Complete guide**: `PAYMENT_SETUP_GUIDE.md`
- **Technical summary**: `PAYMENT_IMPLEMENTATION_SUMMARY.md`
- **Stripe documentation**: https://stripe.com/docs

---

## 🆘 Need Help?

1. Check the FAQ in `PAYMENT_SETUP_GUIDE.md` first
2. Check browser console for errors
3. View server logs
4. Check [Stripe Dashboard > Logs](https://dashboard.stripe.com/test/logs)

---

## ✅ Final Checklist

Before starting:
- [x] ✅ Stripe packages installed
- [x] ✅ Database updated
- [ ] `.env.local` created with your TEST keys
- [ ] `npm run db:push` executed
- [ ] `npm run dev` launched
- [ ] First test payment succeeded

---

**🚀 Happy first payment on Winstory!**

**Total time**: ~10 minutes  
**Difficulty**: Easy  
**Result**: Functional payment system in test mode 