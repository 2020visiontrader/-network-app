# Setting Up Custom SMTP in Supabase

## Problem
Your Supabase project's emails are being blocked, which prevents users from receiving confirmation emails during signup.

## Solution
Set up a custom SMTP provider in Supabase to reliably send emails.

## Step-by-Step Instructions

### Option 1: Use Brevo (Sendinblue) - Recommended

1. **Create a Brevo Account**
   - Go to [Brevo](https://www.brevo.com/) and sign up for a free account
   - Free tier includes 300 emails per day, which is sufficient for testing

2. **Get SMTP Credentials**
   - In Brevo dashboard, go to "SMTP & API" section
   - Find your SMTP credentials (server, port, login, password)

3. **Configure Supabase**
   - Go to Supabase Dashboard > Authentication > Email Templates
   - Click "Enable Custom SMTP" button
   - Fill in these details:
     ```
     SMTP Host: smtp-relay.brevo.com
     Port: 587
     Username: [your Brevo username]
     Password: [your Brevo password]
     Sender Name: Network App
     Sender Email: [your verified sender email]
     ```
   - Click "Save"
   - Enable TLS/SSL

### Option 2: Use Gmail (For Testing Only)

1. **Enable 2-Step Verification**
   - Go to your Google Account > Security
   - Enable 2-Step Verification if not already enabled

2. **Create App Password**
   - Go to your Google Account > Security > App passwords
   - Select "Mail" and your device
   - Generate an app password

3. **Configure Supabase**
   - Go to Supabase Dashboard > Authentication > Email Templates
   - Click "Enable Custom SMTP" button
   - Fill in these details:
     ```
     SMTP Host: smtp.gmail.com
     Port: 587
     Username: [your Gmail address]
     Password: [your generated app password]
     Sender Name: Network App
     Sender Email: [your Gmail address]
     ```
   - Click "Save"
   - Enable TLS/SSL

## Verify Setup

1. Test the email functionality by creating a new user account
2. Check that the confirmation email is sent successfully
3. Complete the signup process

## Troubleshooting

If emails are still not being sent:

1. Check Supabase logs for any SMTP-related errors
2. Verify that your sender email is properly verified with your SMTP provider
3. Check spam/junk folders for test emails
4. Make sure your SMTP provider hasn't blocked your account for suspicious activity

For production use, consider using professional email service providers like:
- SendGrid
- Mailgun
- Postmark
- Amazon SES
