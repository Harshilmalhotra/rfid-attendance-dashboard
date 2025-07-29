 ✓ Compiled /_not-found in 4.5s (1549 modules)
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
 ⚠ Unsupported metadata themeColor is configured in metadata export in /_not-found. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 ⚠ Unsupported metadata viewport is configured in metadata export in /_not-found. Please move it to viewport export instead.
Read more: https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 ⚠ Fast Refresh had to perform a full reload. Read more: https://nextjs.org/docs/messages/fast-refresh-reload
 GET /_next/static/webpack/dfecb1010c8ca46d.webpack.hot-update.json 404 in 4349ms
Error fetching unassigned RFIDs: {
  code: 'PGRST100',
  details: 'unexpected "o" expecting null or trilean value (unknown, true, false)',
  hint: null,
  message: '"failed to parse filter (is.not.null)" (line 1, column 5)'
}
 GET /api/users/unassigned-rfids 500 in 5150ms
 ✓ Compiled in 536ms (652 modules)
 GET /api/users? 200 in 5333ms
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error fetching unassigned RFIDs: {
  code: 'PGRST100',
  details: 'unexpected "o" expecting null or trilean value (unknown, true, false)',
  hint: null,
  message: '"failed to parse filter (is.not.null)" (line 1, column 5)'
}
 GET /api/users/unassigned-rfids 500 in 97ms
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
 GET /api/users? 200 in 63ms
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
 GET /api/users? 200 in 56ms
Error fetching unassigned RFIDs: {
  code: 'PGRST100',
  details: 'unexpected "o" expecting null or trilean value (unknown, true, false)',
  hint: null,
  message: '"failed to parse filter (is.not.null)" (line 1, column 5)'
}
 GET /api/users/unassigned-rfids 500 in 73ms
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
Error: Route "/api/users/unassigned-rfids" used `cookies().getAll()`. `cookies()` should be awaited before using its value. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at createCookiesAccessError (..\..\..\src\server\request\cookies.ts:485:9)
    at syncIODev (..\..\..\src\server\request\cookies.ts:473:2)
    at Promise.getAll (..\..\..\src\server\request\cookies.ts:313:8)
    at Object.getAll (lib\supabase\server.js:13:29)
  483 | ) {
  484 |   const prefix = route ? `Route "${route}" ` : 'This route '
> 485 |   return new Error(
      |         ^
  486 |     `${prefix}used ${expression}. ` +
  487 |       `\`cookies()\` should be awaited before using its value. ` +
  488 |       `Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis`
 GET /api/users? 200 in 48ms
Error fetching unassigned RFIDs: {
  code: 'PGRST100',
  details: 'unexpected "o" expecting null or trilean value (unknown, true, false)',
  hint: null,
  message: '"failed to parse filter (is.not.null)" (line 1, column 5)'
}
 GET /api/users/unassigned-rfids 500 in 52ms
