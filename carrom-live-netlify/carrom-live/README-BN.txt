CARROM TOURNAMENT LIVE — NETLIFY SETUP

এই ZIP-এর ফাইলগুলো একই project folder structure-এ রাখতে হবে:
- index.html
- package.json
- netlify.toml
- netlify/functions/carrom.mjs

SETUP:
1) ZIP extract করুন।
2) GitHub repository-র ROOT-এ index.html, package.json, netlify.toml এবং netlify/functions/carrom.mjs upload করুন।
   গুরুত্বপূর্ণ: index.html যেন repository-র root-এ থাকে, আলাদা nested folder-এর ভেতরে নয়।
3) Netlify site-এর Site configuration / Environment variables-এ যোগ করুন:
   ADMIN_PASSWORD = আপনার নিজের শক্তিশালী Admin password
   TOKEN_SECRET = আলাদা দীর্ঘ random secret (ঐচ্ছিক, কিন্তু সুপারিশকৃত)
4) Environment variable save করার পর Netlify থেকে নতুন deploy trigger করুন।
5) Deploy complete হলে live site খুলে Admin বাটনে ক্লিক করে ADMIN_PASSWORD দিয়ে login করুন।
6) ম্যাচের ফলাফল বা দলের ছবি পরিবর্তন করলে তা Netlify Blobs-এ save হবে। অন্য ডিভাইসগুলো প্রায় 3 সেকেন্ডের মধ্যে ফলাফল দেখতে পাবে।

নিরাপত্তা:
- ADMIN_PASSWORD কাউকে দেবেন না এবং index.html-এ লিখবেন না।
- TOKEN_SECRET-ও public repository-তে রাখবেন না। এগুলো শুধু Netlify Environment Variables-এ থাকবে।
- Netlify Blobs প্রথম deploy-এর পর function-এর মাধ্যমে নিজে তৈরি/ব্যবহার হবে।

দ্রষ্টব্য: পুরোনো Firebase config আর প্রয়োজন নেই। এই project Netlify Function + Netlify Blobs ব্যবহার করে।
