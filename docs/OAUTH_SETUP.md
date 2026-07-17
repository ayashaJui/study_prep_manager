# OAuth Setup

OAuth (Google / GitHub) is not currently implemented in the NestJS backend.

The application uses email/password authentication with JWT stored in an HttpOnly cookie. Password reset via email is supported — see `EMAIL_USER` and `EMAIL_PASSWORD` in the backend environment variables.
