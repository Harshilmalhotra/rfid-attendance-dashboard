 ✓ Compiled /auth in 8.4s (1871 modules)
Error: Route "/auth" used `searchParams.message`. `searchParams` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at LoginPage (app\auth\page.js:23:18)
  21 |
  22 | export default function LoginPage({ searchParams }) {
> 23 |   const message = searchParams?.message
     |                  ^
  24 |
  25 |   return (
  26 |     <Container component="main" maxWidth="xs">
A button can only specify a formAction along with type="submit" or no type.
 GET /auth 200 in 10276ms
 ✓ Compiled in 1964ms (784 modules)
Error: Route "/auth" used `searchParams.message`. `searchParams` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at LoginPage (app\auth\page.js:23:18)
  21 |
  22 | export default function LoginPage({ searchParams }) {
> 23 |   const message = searchParams?.message
     |                  ^
  24 |
  25 |   return (
  26 |     <Container component="main" maxWidth="xs">
 GET /auth 200 in 133ms
Error: Route "/auth" used `searchParams.message`. `searchParams` should be awaited before using its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at LoginPage (app\auth\page.js:23:18)
  21 |
  22 | export default function LoginPage({ searchParams }) {
> 23 |   const message = searchParams?.message
     |                  ^
  24 |
  25 |   return (
  26 |     <Container component="main" maxWidth="xs">
 GET /auth 200 in 170ms
