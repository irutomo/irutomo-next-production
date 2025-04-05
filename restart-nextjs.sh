#!/bin/bash
cd /home/irutomokrserver/domains/irutomo-trip.com/public_html
npm install --production
pm2 delete irutomo-nextjs 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
echo "Next.jsアプリケーションが再起動されました"
