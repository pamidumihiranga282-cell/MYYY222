# MRM Shopping - Hosting Guide

## To host on your server:
1. Run `npm run build` - this creates the `dist/` folder
2. Upload ALL files from the `dist/` folder to your hosting `public_html` or `www` folder
3. Create a `.htaccess` file in the root with this content (for Apache):

```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QR,L]
```

## Firebase Setup Required:
Go to Firebase Console (https://console.firebase.google.com/project/mrm-shopping)

### 1. Enable Authentication:
- Go to Authentication → Sign-in methods
- Enable Email/Password
- Enable Google Sign-in

### 2. Firestore Database Rules:
- Go to Firestore Database → Rules
- Paste this:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read, write: if request.auth.token.email == 'mrmshopping2025@gmail.com';
    }
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth.token.email == 'mrmshopping2025@gmail.com';
    }
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.email == 'mrmshopping2025@gmail.com');
      allow create: if request.auth != null;
    }
    match /settings/{doc} {
      allow read: if true;
      allow write: if request.auth.token.email == 'mrmshopping2025@gmail.com';
    }
    match /contacts/{doc} {
      allow create: if true;
      allow read, write: if request.auth.token.email == 'mrmshopping2025@gmail.com';
    }
  }
}
```

### 3. Firebase Storage Rules:
- Go to Storage → Rules
- Paste this:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /products/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.token.email == 'mrmshopping2025@gmail.com';
    }
    match /settings/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth.token.email == 'mrmshopping2025@gmail.com';
    }
  }
}
```

## Admin Login:
- URL: yourdomain.com/admin
- Email: mrmshopping2025@gmail.com
- Password: Mazin@0830

## Features:
✅ Home page with hero, featured products, special offers
✅ Products page with search & filter
✅ Product detail page
✅ User registration & login (Email + Google)
✅ Password reset via email
✅ Shopping cart with delivery calculation
✅ Order placement with shipping details
✅ WhatsApp notification popup on order
✅ Order tracking by tracking number
✅ Customer account page with order history
✅ Admin panel: Products, Orders, Users, Site Settings
✅ Admin: Upload product images from device
✅ Admin: Update order status with WhatsApp notification
✅ Admin: Edit/delete users
✅ Admin: Edit hero banner, announcements, special offers
✅ Firebase Firestore database for all data
✅ Firebase Storage for images
