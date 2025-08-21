#!/bin/bash

# Deploy the purge-soft-deleted Edge Function to Supabase
echo "Deploying purge-soft-deleted function..."
supabase functions deploy purge-soft-deleted

# Schedule the function to run daily at 4 AM UTC
echo "Scheduling daily purge function..."
supabase functions schedule create daily-purge \
  --cron "0 4 * * *" \
  --endpoint purge-soft-deleted

echo "Deployment and scheduling complete!"
