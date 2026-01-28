# Deployment Guide

## AppHomeController Migration - React 18.x

This guide covers installation, building, and running the migrated React application.

## Prerequisites

- Node.js 18+ (recommended: 20+)
- npm 9+ or yarn
- Git

## Installation

```bash
# Navigate to the project directory
cd app-home

# Install dependencies
npm install
```

## Environment Configuration

Create a `.env` file in the project root:

```env
# API Gateway URL
VITE_API_GATEWAY=https://your-api-gateway.com

# Optional: Enable debug mode
VITE_DEBUG=false
```

## Development

```bash
# Start development server
npm run dev

# The app will be available at http://localhost:5173
```

## Production Build

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

## Project Structure

```
app-home/
├── src/
│   ├── app/           # App configuration (store, router, providers)
│   ├── features/      # Feature modules
│   │   ├── authentication/
│   │   ├── navigation/
│   │   ├── user-profile/
│   │   └── application-shell/
│   ├── pages/         # Route-level pages
│   ├── lib/           # Utilities (API, crypto)
│   ├── styles/        # Tailwind CSS
│   └── types/         # TypeScript types
├── docs/              # Documentation
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

## Functional Verification

### 1. Login Flow

1. Navigate to `/` or `/login`
2. Enter valid email address
3. Click "Continue" to validate username
4. Enter password
5. If MFA enabled, complete TOTP verification
6. Successful login redirects to `/BusinessHomeViews`

### 2. Logout Flow

1. From home page, click "Sign Out"
2. Confirms sign-out via API
3. Redirects to login page

### 3. Forgot Password Flow

1. From login page, click "Forgot Password?"
2. Enter email address
3. Click "Send Verification Code"
4. Enter 6-digit OTP received via email
5. Enter new password (8 characters, meets complexity rules)
6. Click "Update Password"
7. Redirects to login on success

### 4. Password Setup (New User)

1. Access URL with params: `/?username=user@email.com&userType=newUser`
2. Password setup form appears
3. Enter new password meeting requirements
4. Confirm password
5. Click "Set Password"
6. Redirects to login on success

## API Integration

The application connects to your API Gateway at the URL specified in `VITE_API_GATEWAY`.

### Encryption

All API requests use AES-256-CBC encryption:
- Secret Key: 32 bytes
- IV: 16 bytes
- Mode: CBC
- Padding: PKCS7

This matches the original AngularJS encryption pattern.

### API Endpoints Used

| Feature | Endpoint |
|---------|----------|
| Sign In | POST /baasHome/signIn |
| Sign Out | POST /baasHome/signOutFromOnebase |
| Validate User | POST /baasHome/validateUser |
| Check MFA | POST /baasHome/checkMFA |
| Set Password | POST /baasHome/setPassword |
| OTP Recovery | POST /baasHome/otp_to_recover_password |
| Verify OTP | POST /baasHome/verify_otp_to_proceed |
| Update Profile | POST /baasHome/update_user_profile |
| Corp Details | POST /baasContent/corp_details |

## Troubleshooting

### Build Errors

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

```bash
# Check TypeScript compilation
npm run typecheck
```

### API Connection Issues

1. Verify `VITE_API_GATEWAY` is set correctly
2. Check CORS configuration on API Gateway
3. Verify encryption keys match backend

## Support

For issues or questions, contact the developer through Freelancer.com messaging.

---

**Migration completed by:** Anirudha Talmale
**Date:** January 2026
**Technology:** React 18.x + TypeScript + Redux Toolkit + Vite
