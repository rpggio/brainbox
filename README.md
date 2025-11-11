# Brainbox

Brainbox: a platform enabling vibe-coders to build data-driven apps that run privately on the user's device. 
Brainbox provides services, components, and patterns to keep the user's database and app collecttion stable and iter-able.

## Design constraints

### Data platform

- Data platform must be robust: self-operating, self-validating, self-correcting
- User data layer is common to all apps. There are no app-specific collections.

### Workflow

- User can use any AI tool of their choosing to do app development
- User-generated source code should be version-controlled by the platform and AI agent
- Platform code should be isolated from user code
- Platform should provide commands for the AI agent to use: release workflow, static analysis, testing
- Brainbox platform should supply AI agent with guidance to produce compliant app code
- User can accept or reject a set of app changes
- User can test using a replica of their DB during development
- User has access to both dev and live versions of the app at any point in time

## Tech selections

- PocketBase
- TypeScript for frontend and for DB hooks
- pocketbase-typegen
- Web components
- Lit
- Shoelace
- TipTap UI for editors 
