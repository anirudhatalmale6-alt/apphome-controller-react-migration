# AngularJS to ReactJS Migration Mind Map

## AppHomeController.js → React Features Mapping

```
AppHomeController.js (2,729 LOC)
├── Authentication Feature (/src/features/authentication/)
│   ├── Components
│   │   ├── LoginView.tsx ← SignInToOnebase, loginForm, validateUser
│   │   ├── PasswordSetupView.tsx ← submitNewPassword, showNewPassword
│   │   ├── ForgotPasswordView.tsx ← forgotPassword, verify_otp_to_proceed, updateProfiles
│   │   ├── RemoteKeyVerificationView.tsx ← askRemoteKey, verifyRemoteKey
│   │   └── PasswordStrengthIndicator.tsx ← getStrength, validatePassword
│   │
│   ├── Hooks
│   │   ├── useAuthenticationState.ts ← $rootScope.isSigned, loginStatus, validuser
│   │   └── usePasswordValidation.ts ← $rootScope.validatePassword, patternChecks
│   │
│   ├── Services
│   │   ├── AuthenticationFlowService.ts ← deviceDetector, browserData, timezone
│   │   └── PasswordPolicyService.ts ← pwdConfig, weakPasswords, patternChecks
│   │
│   ├── API (RTK Query)
│   │   └── authenticationApi.ts
│   │       ├── signIn ← /baasHome/signIn
│   │       ├── setLoginStatus ← /baasHome/setLoginStatus
│   │       ├── validateUser ← /baasHome/validateUser
│   │       ├── validateOnbaseUser ← /baasHome/validateOnbaseUser
│   │       ├── checkMfa ← /baasHome/checkMFA
│   │       ├── getQrCode ← /baasHome/getQRcode
│   │       ├── verifyCode ← /baasHome/verifyCode
│   │       ├── signOut ← /baasHome/signOutFromOnebase
│   │       ├── setPassword ← /baasHome/setPassword
│   │       └── forgotUsername ← /baasHome/forgotUsername
│   │
│   ├── Store
│   │   └── authSlice.ts ← $rootScope authentication state
│   │
│   ├── Schemas (Zod)
│   │   └── AuthenticationSchemas.ts ← Form validation rules
│   │
│   └── Types
│       └── AuthenticationTypes.ts ← SignInResponse, LoginStatusResponse, etc.
│
├── Navigation Feature (/src/features/navigation/)
│   ├── Components
│   │   └── NavigationShellView.tsx ← sidenav, sidebar, menu selection
│   │
│   ├── Hooks
│   │   └── useNavigationState.ts ← $rootScope.selectItem, isItemSelected
│   │
│   ├── Services
│   │   └── NavigationDecisionService.ts ← pathMapping, proceedToLocation
│   │
│   ├── Store
│   │   └── navigationSlice.ts ← selectedItem, currentPath, isItemSelected
│   │
│   └── Types
│       └── NavigationTypes.ts ← NavigationItem, PathMapping
│
├── User Profile Feature (/src/features/user-profile/)
│   ├── Components
│   │   └── UserProfileView.tsx ← changePassword, ChangePassword.html
│   │
│   ├── API (RTK Query)
│   │   └── userProfileApi.ts
│   │       ├── updateUserProfile ← /baasHome/update_user_profile
│   │       ├── requestOtpForPasswordChange ← /baasHome/otp_to_recover_password
│   │       ├── verifyOtpForProfileUpdate ← /baasHome/verify_otp_to_proceed
│   │       └── updateUserActivityLogging ← /baasHome/updateUserActivitesLogging
│   │
│   ├── Store
│   │   └── userProfileSlice.ts ← stepForPasswordChange, user_profile
│   │
│   └── Types
│       └── UserProfileTypes.ts ← UserProfile, LoggingActivity
│
└── Application Shell Feature (/src/features/application-shell/)
    ├── Components
    │   └── ApplicationShellView.tsx ← isLoginPage, viewFooterDiv, corpDetails
    │
    ├── API (RTK Query)
    │   └── applicationShellApi.ts
    │       ├── getCorpDetails ← /baasContent/corp_details
    │       ├── loadBusinessConfig ← /baasHome/load_business_config
    │       ├── loadSettings ← /baasHome/loadSetting
    │       ├── loadDisplayTime ← /baasHome/loadDisplayTimeForInbox
    │       └── fetchTimezoneDetails ← /baasHome/fetch_TimeZone_Details
    │
    ├── Store
    │   └── applicationShellSlice.ts ← $rootScope global flags
    │
    └── Types
        └── ApplicationShellTypes.ts ← ApplicationShellState, CorpDetails
```

## HTML Pages → React Components Mapping

```
HTML Pages
├── index.html
│   └── LoginPage.tsx + LoginView.tsx
│       ├── Sign-in form
│       ├── Username validation step
│       ├── Password entry with MFA
│       └── Terms of service link
│
├── home_page.html
│   └── HomePage.tsx
│       ├── Welcome section
│       ├── Quick action cards
│       └── Account management
│
├── ChangePassword.html
│   └── UserProfileView.tsx
│       ├── OTP request step
│       ├── OTP verification step
│       └── Password change step
│
└── 404.html
    └── NotFoundPage.tsx
        └── Error display with navigation
```

## CSS → Tailwind Migration

```
index.css
└── src/styles/index.css
    ├── CSS Variables → Tailwind theme extend
    ├── Button styles → @layer components .btn-primary, .btn-secondary
    ├── Input styles → @layer components .input-field
    ├── Card styles → @layer components .card
    └── Animations → @keyframes fadeIn, slideIn
```

## API Endpoints Continuity

| AngularJS $http | React RTK Query | Endpoint |
|-----------------|-----------------|----------|
| SignInToOnebase | useSignInMutation | /baasHome/signIn |
| setLoginStatus | useSetLoginStatusMutation | /baasHome/setLoginStatus |
| validateUser | useValidateUserMutation | /baasHome/validateUser |
| validateOnbaseUser | useValidateOnbaseUserMutation | /baasHome/validateOnbaseUser |
| checkMFA | useCheckMfaMutation | /baasHome/checkMFA |
| getQRcode | useGetQrCodeMutation | /baasHome/getQRcode |
| verifyCode | useVerifyCodeMutation | /baasHome/verifyCode |
| signOutFromOnebase | useSignOutMutation | /baasHome/signOutFromOnebase |
| setPassword | useSetPasswordMutation | /baasHome/setPassword |
| forgotUsername | useForgotUsernameMutation | /baasHome/forgotUsername |
| otp_to_recover_password | useRequestOtpForPasswordChangeMutation | /baasHome/otp_to_recover_password |
| verify_otp_to_proceed | useVerifyOtpForProfileUpdateMutation | /baasHome/verify_otp_to_proceed |
| update_user_profile | useUpdateUserProfileMutation | /baasHome/update_user_profile |
| updateUserActivitesLogging | useUpdateUserActivityLoggingMutation | /baasHome/updateUserActivitesLogging |
| corp_details | useGetCorpDetailsQuery | /baasContent/corp_details |
| load_business_config | useLoadBusinessConfigMutation | /baasHome/load_business_config |
| loadSetting | useLoadSettingsQuery | /baasHome/loadSetting |

## State Management Migration

| AngularJS ($rootScope/$scope) | React (Redux Toolkit) |
|------------------------------|----------------------|
| $rootScope.isSigned | auth.isAuthenticated |
| $rootScope.loginedUserData | auth.user |
| $rootScope.sessionId | auth.sessionId |
| $rootScope.validuser | auth.isValidUser |
| $scope.mfaAuthEnable | auth.isMfaEnabled |
| $rootScope.isItemSelected | navigation.isItemSelected |
| $rootScope.selectedItem | navigation.selectedItem |
| $rootScope.currentPath | navigation.currentPath |
| $scope.stepForPasswordChange | userProfile.stepForPasswordChange |
| $rootScope.isLoginPage | applicationShell.isLoginPage |
| $rootScope.viewFooterDiv | applicationShell.viewFooterDiv |

## Technology Stack Compliance

| Requirement | Implementation |
|-------------|----------------|
| React 18.x | ✓ React 18 with TypeScript |
| Vite | ✓ Vite build tooling |
| Redux Toolkit (RTK) | ✓ configureStore, createSlice |
| RTK Query | ✓ All API calls use RTK Query |
| Tailwind CSS + shadcn/ui | ✓ Tailwind with component classes |
| React Hook Form + Zod | ✓ Form validation with Zod schemas |
| React Router v6 | ✓ Routes, Navigate, useNavigate |
| TypeScript (.ts/.tsx) | ✓ All files are .ts/.tsx |
| No .jsx files | ✓ Confirmed |
| 300-400 LOC per file | ✓ All components under 400 LOC |

## File Structure (Golden React JS Structure V27J26V1)

```
src/
├── main.tsx                 # Application bootstrap
├── app/
│   ├── App.tsx             # Root application shell
│   ├── router.tsx          # React Router v6 configuration
│   ├── providers.tsx       # Redux & Router providers
│   ├── store.ts            # Redux Toolkit store
│   └── hooks.ts            # Typed Redux hooks
├── features/
│   ├── authentication/     # Auth feature (login, password, MFA)
│   ├── navigation/         # Navigation feature (sidebar, routes)
│   ├── user-profile/       # User profile feature (password change)
│   └── application-shell/  # Global app state feature
├── pages/
│   ├── LoginPage.tsx
│   ├── ForgotPasswordPage.tsx
│   ├── PasswordSetupPage.tsx
│   ├── HomePage.tsx
│   └── NotFoundPage.tsx
├── lib/
│   ├── api.ts              # Axios instance & endpoints
│   └── crypto.ts           # AES encryption utilities
├── styles/
│   └── index.css           # Tailwind base styles
└── types/
    └── global.ts           # Shared TypeScript types
```
