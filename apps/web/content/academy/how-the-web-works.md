# How the Web Works: Requests, Responses, Cookies and Sessions

## 1. Learning objectives

By the end of this lesson, you should be able to:

- Trace the main steps between entering a web address and seeing a page.
- Explain what a client, server, DNS lookup, HTTPS, and HTTP message do.
- Recognize common request methods, headers, query parameters, and JSON bodies.
- Describe how cookies and server-side sessions support authentication.
- Inspect a request safely with browser developer tools.
- Identify practical ways to reduce common web security risks.

## 2. What happens when you open a website

A browser is a client: software that asks for a resource and displays the result. A web server is a program that receives requests and sends responses. When you enter an address, the browser parses it into parts such as a scheme, host, path, and optional query string.

The browser resolves the host to a network address, establishes a connection, and, for HTTPS, negotiates encrypted transport. It then sends an HTTP request. The server may check the request, read or change data, and return an HTTP response. The browser interprets the response and may make more requests for images, scripts, styles, or data before rendering the page.

This is a useful model, not a promise that every site uses one server. A service may use caches, gateways, application servers, databases, and other components behind one public address.

## 3. Client-server architecture

The client starts a conversation by requesting something. The server decides how to handle that request and returns a result. A client can be a browser, a mobile app, or another program. A server can be a local development process or a remote service.

Keeping responsibilities separate helps security. The client can improve the experience, but it is not a trustworthy authority: users can alter browser requests. The server must independently verify identity, permissions, input, and any important business rule before changing data.

## 4. DNS and HTTPS

The Domain Name System, or DNS, helps translate a human-readable host name into an address computers can use. A browser or operating system may use a cached answer; otherwise a resolver asks DNS servers. A DNS answer can include records such as A for an IPv4 address, AAAA for IPv6, or CNAME for an alias. DNS helps locate a destination; it does not prove that a page is safe.

HTTPS is HTTP carried inside TLS, a protocol that encrypts and authenticates the connection. Certificate validation helps the browser verify that it is talking to a server authorized for the host name. Encryption helps prevent network observers from reading or silently changing traffic in transit. HTTPS does not make a dishonest site trustworthy, fix vulnerable application code, or protect a device that is already compromised.

## 5. HTTP request structure

HTTP is a request-and-response protocol. A request commonly contains a method and path, headers, and sometimes a body. The exact wire format depends on the HTTP version; the example below is a readable HTTP/1.1-style illustration.

```http
GET /api/academy/courses?level=beginner HTTP/1.1
Host: training.example.test
Accept: application/json
```

The first line names the method, target path, query string, and protocol version. Headers are metadata: here the client says which response representation it can use. A GET request normally reads data and does not ask the server to change it.

## 6. HTTP response structure and status codes

A response contains a status code, headers, and optionally a body. The code gives a broad result category; the response body may contain more detail suitable for the caller.

- 2xx means the request succeeded, such as 200 OK or 201 Created.
- 3xx means the client may need to follow a redirect or use a cached result.
- 4xx means the request could not be accepted as sent, such as 400 Bad Request, 401 Unauthorized, 403 Forbidden, or 404 Not Found.
- 5xx means the server failed to complete an apparently valid request.

Codes do not replace careful handling. A client should not assume every response body is JSON or display sensitive internal error details to a user.

## 7. Request methods

Methods describe the intended operation, though the server must still enforce its own rules.

- GET retrieves a representation. It should not perform a state-changing action.
- POST submits data or asks the server to perform an operation, such as creating a record.
- PUT usually replaces a resource representation; PATCH usually applies a partial update. The exact API contract matters.
- DELETE requests removal of a resource. A server must check that the caller is allowed to remove it.

A method name is not access control. A route that accepts POST still needs authentication, authorization, validation, and safe error handling.

## 8. Headers, query parameters, bodies, and JSON

Headers describe a message. Examples include Accept, Content-Type, and Authorization. Treat authorization headers and cookies as secrets: do not paste them into reports or share screenshots containing them.

Query parameters are the part of a URL after a question mark. For example, in /search?q=proxy, q has the value proxy. Query strings can appear in browser history, server logs, screenshots, and referrer data, so do not put passwords or tokens there.

A request body carries data for methods such as POST or PATCH. JSON is a common text format for objects and arrays. Content-Type: application/json tells the server how to interpret a JSON body. The server must still validate the parsed value, expected fields, sizes, and allowed values. Client-side validation helps usability but cannot replace server validation.

## 9. Cookies and sessions

A cookie is a small value that a server asks a browser to store for a site. On later matching requests, the browser may send it automatically. A session is server-side state associated with a client, commonly looked up using a random, hard-to-guess session identifier stored in a cookie. Some systems use signed tokens instead; those have different storage and revocation trade-offs.

A session identifier is a bearer secret: someone who steals it may be able to act as its owner. Secure session design uses HTTPS and appropriate cookie options. Secure limits sending to HTTPS, HttpOnly prevents page scripts from reading the cookie, and SameSite helps limit some cross-site cookie sending. Path and expiration settings should also be deliberate. These controls reduce risk but do not replace server-side authorization or protection against cross-site request forgery (CSRF).

Do not copy a real session cookie into notes, chat, screenshots, or a public issue. Sign out of shared devices and use the application's session-revocation process if a session may have been exposed.

## 10. Authentication versus authorization

Authentication answers “Who is making this request?” For example, the server validates a session and identifies an account. Authorization answers “What is this identified account allowed to do?” For example, a learner may read a published lesson but not edit another learner's progress.

A valid login does not grant every permission. The server should check authorization on every protected operation, using the authenticated identity from trusted server-side session state rather than a user ID supplied by the browser.

## 11. Inspect Network requests safely

Browser developer tools provide a Network panel that lists requests made by the current page. You can inspect a request's method, path, status, timing, headers, and response preview. This is useful for learning how your own application communicates.

Practice only with an application you own or are explicitly authorized to test. For this exercise, use the local CyberSecDev app at localhost. Do not probe public services, change another user's data, or replay requests that perform writes. Do not copy cookies, authorization headers, passwords, or private response data when sharing results. Clear the Network log and redact sensitive values before taking screenshots.

## 12. Common security mistakes and defenses

- Trusting a user ID, role, price, or reward sent by the browser: derive identity and sensitive decisions on the server.
- Treating hidden buttons as protection: enforce authorization in the API as well as the interface.
- Accepting unvalidated bodies: check type, shape, size, and allowed values before using input.
- Putting secrets in URLs or logs: use appropriate headers or secure cookies, and redact sensitive values.
- Using cookies without considering CSRF: choose SameSite deliberately and use additional CSRF defenses where the design requires them.
- Returning stack traces or database errors: log details privately and return a safe, general response.
- Assuming HTTPS fixes application flaws: also patch dependencies, validate access, encode output, and review state-changing operations.
- Repeating a state-changing request without idempotency: design the server so retries cannot duplicate important effects.

## 13. Worked request and response

This is an illustrative, read-only example using the reserved example.test domain. It is not a real third-party target and does not describe a guaranteed response from every application.

```http
GET /api/academy/courses?level=beginner HTTP/1.1
Host: training.example.test
Accept: application/json
```

```http
HTTP/1.1 200 OK
Content-Type: application/json
Cache-Control: no-store

{"courses":[{"title":"Web Basics","level":"beginner"}]}
```

The browser asks for a filtered collection and says it can accept JSON. The server returns a success status, describes the body format, and provides data. A different server might require authentication, ignore the filter, return an empty collection, or use a different response shape. Always follow the documented contract for the application you are using.

## 14. Short glossary

- Browser: client software that requests and displays web resources.
- Client: the program that initiates a request.
- Server: the program that processes requests and returns responses.
- DNS: the naming system that helps resolve host names to network destinations.
- TLS: the protocol used by HTTPS to protect and authenticate a connection.
- HTTP: the application protocol that defines web requests and responses.
- Header: message metadata sent with a request or response.
- JSON: a text format commonly used for structured data.
- Cookie: a small value stored by a browser and sent with matching requests.
- Session: server-side state associated with an authenticated client.
- Authentication: verifying identity.
- Authorization: deciding which actions an identity may perform.
- CSRF: a class of attack that tricks a browser into sending an unwanted authenticated request.

## 15. Knowledge check

These questions are for self-check only. The current Academy does not grade or persist quiz answers.

### Question 1

Which component normally begins an HTTP request?

- A. The client
- B. The DNS root server
- C. The response status code
- D. The database index

Answer: A. The client begins the request; the server processes it and returns a response.

### Question 2

What does HTTPS add to HTTP in transit?

- A. A guarantee that the website's content is honest
- B. TLS protection for connection confidentiality and integrity, plus server authentication
- C. Automatic authorization for every account
- D. A guarantee that application code has no vulnerabilities

Answer: B. HTTPS uses TLS to protect the connection and authenticate the server for the host. It does not prove the site is honest or secure in every other way.

### Question 3

Where should an API enforce permission to change a learner's progress?

- A. Only by hiding the button in the browser
- B. On the server for each protected operation
- C. In a query parameter supplied by the client
- D. In the page title

Answer: B. The server must authorize every protected operation using trusted identity and policy.

### Question 4

Which statement about a session cookie is safest?

- A. It is harmless to post it in a screenshot
- B. It should be treated as a secret because possession may grant account access
- C. It replaces server-side access checks
- D. It should be placed in a URL so it is easy to inspect

Answer: B. A stolen bearer session identifier may let someone act as its owner. Keep it private and use appropriate cookie protections.

### Question 5

What should you do before inspecting a Network request for this lesson?

- A. Replay requests against a random public website
- B. Copy all headers into a public forum
- C. Use the local app or a system you are authorized to test, and redact secrets
- D. Send a DELETE request to see what happens

Answer: C. Limit testing to authorized systems and keep credentials and session values private.

## 16. Practical exercise: inspect a local read-only request

1. Open the local CyberSecDev app at http://localhost:3000/academy while signed in, if a test account is available.
2. Open browser developer tools and select the Network panel. Clear the current log.
3. In a new tab on the same local app, visit http://localhost:3000/api/academy/courses. This is a read-only request to the local application.
4. Select the request in Network. Record its method, path, status, Content-Type, and the names of the public fields in the response. Do not record cookies, authorization values, account details, or unrelated response data.
5. Return to the Academy page and compare the course card with the public course data. Do not send POST, PATCH, PUT, or DELETE requests for this exercise.
6. In your own notes, explain which part was the client request and which part was the server response. If the local app is unavailable, stop; do not substitute a third-party site.

## 17. Lesson summary

A browser client locates a server, establishes a connection, and exchanges HTTP requests and responses. DNS helps resolve names; HTTPS uses TLS to protect the connection. Methods, headers, query parameters, and bodies describe the requested operation and its data. Cookies can carry session identifiers, so they must be protected as secrets. Authentication identifies a user, while authorization controls that user's actions. Inspect only authorized traffic, and enforce security-sensitive decisions on the server.
