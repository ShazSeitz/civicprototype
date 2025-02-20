
# Development Guide

## Project Structure
```
src/
  ├── components/     # Reusable UI components
  ├── docs/          # Project documentation
  ├── hooks/         # Custom React hooks
  ├── integrations/  # External service integrations
  ├── lib/          # Utility functions
  ├── pages/        # Route components
  └── types/        # TypeScript type definitions
```

## Getting Started
1. Authentication is handled through Supabase
2. User profiles are stored in the profiles table
3. All database operations should use RLS policies

## Best Practices
1. Use TypeScript for all new code
2. Follow the existing component structure
3. Use Shadcn/ui components when possible
4. Document all new features in this folder

## Testing
1. Manual testing steps for auth:
   - Test signup with new email
   - Test login with existing account
   - Test password reset flow
   - Verify error messages are clear

## Debugging
1. Check console logs for errors
2. Verify Supabase connection
3. Confirm proper error handling
4. Review auth state management
