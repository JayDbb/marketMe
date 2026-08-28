MarketMe Instagram Integration Limitations & Testing Guide

Purpose

This document describes the known limitations, development restrictions, configuration requirements, testing expectations, and common failure modes for the MarketMe Instagram integration.

It is intended for senior developers and testers validating the Instagram integration before production use.

The goal is to distinguish between:

Meta / Instagram platform limitations

Development-mode restrictions

Permission or App Review restrictions

MarketMe implementation issues

Token / account configuration issues

Expected API failures

1. Current Integration Scope

MarketMe currently uses the Instagram API with Facebook Login through the Meta Graph API.

Current characteristics

Graph API host: graph.facebook.com

Current tested Graph API version: v26.0

Supported connected account types:

Instagram Business

Instagram Creator

Unsupported as a connected MarketMe account:

Personal / Consumer Instagram

The Instagram Professional account must be linked to a Facebook Page.

Instagram inbox actions are delegated through the MarketMe AI / Render backend.

Request flow

MarketMe Frontend
        ↓
Next.js API
        ↓
MarketMe AI / Render Backend
        ↓
Meta Graph API
        ↓
Instagram

This architecture adds failure points beyond Meta itself.

2. Development vs Production Access

Meta distinguishes between Standard Access and Advanced Access.

Standard Access

Standard Access is intended for development and testing with accounts that belong to, are managed by, or are associated with developers/testers of the Meta application.

A feature working with developer or tester accounts does not prove that it will work for arbitrary production users.

Advanced Access

Advanced Access is generally required before MarketMe can serve Instagram Professional accounts outside the development organization.

Permissions may also require:

Meta App Review

Business verification

Privacy Policy URL

Data deletion instructions

Demonstration of requested functionality during App Review

Important: Development success does not imply production readiness.

3. Current Meta Permissions

The current integration has been tested with the following permissions:

pages_show_list
business_management
pages_messaging
instagram_basic
instagram_manage_comments
instagram_content_publish
instagram_manage_messages
pages_read_engagement
pages_manage_metadata
public_profile

Not every MarketMe feature uses every permission above. Permissions should be reviewed individually before production deployment.

4. Tester and App Role Limitations

While the app is using Standard Access, developers should use accounts properly configured for testing.

Possible roles include:

Administrator

Developer

Tester

Instagram Tester

Depending on the Meta configuration, an invited Instagram tester may need to accept the invitation from:

Instagram
→ Apps and Websites
→ Tester Invites

If the tester invitation is not accepted, OAuth or API testing may fail even when the MarketMe implementation is correct.

Production expectation

Normal production users should not need to be manually added as Meta app testers.

If MarketMe requires every customer to become an app tester, the integration is not production-ready and likely requires the relevant permissions to receive Advanced Access.

4.1. Required Test-User Setup

For development under Standard Access, simply having an Instagram account is not enough. The test account must be properly authorized for the Meta app and the Instagram Professional account being tested.

Developer-side setup

Before asking the tester to connect their Instagram account:

Open the MarketMe app in Meta for Developers.

Go to App roles / Roles.

Add the person as the appropriate tester/developer role.

If the Instagram product exposes a separate Instagram Tester role, add the exact Instagram account that will be used for testing.

Confirm that the tester has access to, or an appropriate role on, the Instagram Professional account and linked Facebook Page being tested.

Ensure the required Instagram permissions are enabled for the app.

Meta's Instagram messaging documentation states that app testers must:

Have a role on the Meta app.

Grant the app the required permissions.

Have an appropriate role on the Instagram Professional account used for testing.

Tester-side acceptance

The invited tester must accept the invitation before MarketMe testing is considered valid.

On Instagram, the tester should sign in to the exact Instagram account that was invited, then open:

Instagram
→ Profile
→ Menu
→ Apps and websites
→ Tester Invites
→ MarketMe
→ Accept

Depending on the Instagram app version, Apps and websites may appear under a settings, security, website-permissions, or account-access area.

If the invitation is still pending, OAuth or API operations may fail even though MarketMe's code is correct.

Test-user validation checklist

Correct Facebook/Meta account was added to the app role.

Correct Instagram username was added where an Instagram Tester role is required.

Tester invitation has been accepted.

Tester is logged into the same Instagram account that was invited.

Instagram account is Business or Creator when being connected as a managed MarketMe account.

Tester has appropriate access to the linked Facebook Page / Instagram Professional account.

OAuth permission screen was completed and required permissions were granted.

Connection was re-authorized after any permission or role changes.

4.2. Instagram App Settings Required for Third-Party Management

For DM management, the Instagram account owner must explicitly allow connected tools to access Instagram messages.

This setting is controlled from the Instagram mobile app and should be part of MarketMe's onboarding and troubleshooting documentation.

Required setting: Allow access to messages

On the Instagram Professional account:

Instagram mobile app
→ Profile
→ Menu
→ Messages and story replies
→ Message controls / Message requests
→ Connected tools
→ Allow access to messages
→ ON

Instagram's UI wording can vary slightly by app version. The important destination is the Connected tools section containing Allow access to messages.

When this setting is OFF:

A third-party management app may be unable to read Instagram DMs.

Webhook delivery for new DMs may stop.

Outbound DM sending through the API may fail.

Publishing may still work, which can make the account appear partially connected.

Reconnecting OAuth alone may not fix inbox behavior.

MarketMe onboarding requirement

MarketMe should tell the account owner to verify this setting when:

Connecting Instagram messaging for the first time.

Reconnecting an Instagram account.

Changing the Instagram account between Personal, Creator, or Business.

Re-linking the Facebook Page.

Instagram DMs stop appearing in MarketMe.

Publishing works but messaging does not.

Meta reports that access to Instagram Direct Messages is disabled or revoked.

Recommended user-facing onboarding instruction

To let MarketMe read and reply to Instagram messages:

1. Open the Instagram mobile app.
2. Switch to the Professional account you are connecting.
3. Open Profile → Menu.
4. Open Messages and story replies.
5. Open Message controls or Message requests.
6. Under Connected tools, enable Allow access to messages.
7. Return to MarketMe and reconnect/refresh the Instagram connection.

This setting gives connected management tools access to Instagram messages. Users should only enable it for third-party services they trust.

4.3. Facebook Page and Instagram Account Ownership / Access

Because MarketMe currently uses Instagram API with Facebook Login, the Professional Instagram account must be linked to a Facebook Page.

The person completing OAuth should have sufficient access to manage the Page and the linked Instagram account.

Before connecting MarketMe, verify:

Instagram account is Business or Creator.

Instagram account is linked to the intended Facebook Page.

The person authorizing MarketMe has appropriate access to that Page.

The Page appears in the person's accessible Pages during OAuth.

The Instagram Professional account appears under the correct Page.

Message access for connected tools is enabled in Instagram.

Required permissions are granted during MarketMe OAuth.

If the wrong Page is selected or the user lacks sufficient Page/Instagram access, MarketMe may authenticate successfully but later fail when retrieving the Instagram account, publishing, reading inbox data, or replying to DMs.

4.4. Reauthorization After User-Side Changes

Meta permissions and third-party access should be treated as stateful configuration.

After any of the following changes, testers should reconnect the Instagram account in MarketMe:

Tester/app role added or changed.

Tester invitation accepted after an earlier failed connection.

Allow access to messages changed.

Facebook Page linked or relinked.

Instagram account converted between Personal, Creator, and Business.

Permissions granted/revoked.

Facebook Page access changed.

Instagram account ownership/access changed.

Recommended test sequence:

Change Meta/Instagram configuration
        ↓
Disconnect MarketMe Instagram connection
        ↓
Reconnect through OAuth
        ↓
Grant all requested permissions
        ↓
Verify Page + Instagram account mapping
        ↓
Verify Page subscribed_apps
        ↓
Send new inbound DM
        ↓
Verify webhook
        ↓
Test MarketMe reply

5. Instagram Professional Account Requirement

Supported connected accounts:

Instagram Business     ✅
Instagram Creator      ✅
Personal Instagram     ❌

A personal Instagram user may still message a connected Professional account as a customer.

6. Facebook Page Requirement

The current Facebook Login integration requires the Instagram Professional account to be connected to a Facebook Page.

Known working development configuration:

Facebook Page
<FACEBOOK_PAGE_NAME>

Page ID
<FACEBOOK_PAGE_ID>

Instagram Professional Account
@<BUSINESS_INSTAGRAM_USERNAME>

Instagram Account ID
<INSTAGRAM_BUSINESS_ACCOUNT_ID>

If the Page ↔ Instagram connection is removed, MarketMe Instagram capabilities may stop working.

7. Instagram Messaging Limitations

Instagram messaging is one of the most restricted parts of the integration.

Customer should initiate the conversation

MarketMe should not be treated as a cold-DM system.

Expected flow:

Instagram User
        ↓
sends DM
        ↓
Instagram Professional Account
        ↓
Meta Webhook
        ↓
MarketMe Inbox
        ↓
MarketMe Reply

The application should not attempt to send unsolicited messages to arbitrary Instagram users.

8. Messaging Window

Normal replies are subject to Meta's messaging window.

A reply outside the permitted window may return:

(#10) This message is sent outside of allowed window.
error_subcode: 2534022

This is an expected Meta restriction, not necessarily a MarketMe bug.

Test expectation

Fresh inbound DM → immediate reply          ✅ Expected to work
Expired conversation → normal reply         ❌ Expected Meta rejection

MarketMe should translate messaging-window failures into a user-friendly error.

9. HUMAN_AGENT Limitation

Meta provides a HUMAN_AGENT capability for certain human-support scenarios outside the normal messaging window.

Important restrictions:

Requires appropriate Meta approval/access.

Intended for human support.

Must not be used as a workaround for automated marketing or automated AI messages.

The allowed period is longer than the normal reply window but is still limited.

MarketMe should not automatically fall back to HUMAN_AGENT unless its use complies with Meta requirements.

10. Instagram-Scoped User ID (IGSID)

Replies must target the customer's Instagram-scoped user ID, not the conversation ID.

Known working test user:

Instagram User
@<TEST_INSTAGRAM_USERNAME>

IGSID
<INSTAGRAM_SCOPED_USER_ID>

Example correct send target:

{
  "recipient": {
    "id": "<INSTAGRAM_SCOPED_USER_ID>"
  },
  "message": {
    "text": "Hello"
  }
}

Do not substitute

Conversation ID             ❌
Message ID                  ❌
Facebook Page ID            ❌
MarketMe connection UUID    ❌
MarketMe database UUID      ❌

11. ID Reference

Identifier

Known Test Value

Represents

Facebook Page ID

<FACEBOOK_PAGE_ID>

<FACEBOOK_PAGE_NAME>

Instagram Professional Account ID

<INSTAGRAM_BUSINESS_ACCOUNT_ID>

@<BUSINESS_INSTAGRAM_USERNAME>

Customer IGSID

<INSTAGRAM_SCOPED_USER_ID>

@<TEST_INSTAGRAM_USERNAME>

Meta App ID

<META_APP_ID>

MarketMe

Conversation ID

<INSTAGRAM_CONVERSATION_ID>

Instagram DM thread

Conversation IDs must never be treated as recipient IDs.

12. Webhook Dependency

Instagram messaging depends heavily on Meta Webhooks.

Expected configuration:

Meta App
    ↓
Verified Webhook Callback
    ↓
Facebook Page
    ↓
Page subscribed to "messages"
    ↓
Inbound Instagram DM
    ↓
MarketMe / Render webhook handler

Required Page subscription

Check using:

GET /PAGE_ID/subscribed_apps

A broken configuration may return:

{
  "data": []
}

A working configuration should show MarketMe and the messages field:

{
  "data": [
    {
      "name": "MarketMe",
      "id": "<META_APP_ID>",
      "subscribed_fields": [
        "messages"
      ]
    }
  ]
}

13. Subscribing the Page to Messaging

Known working subscription request:

POST /<FACEBOOK_PAGE_ID>/subscribed_apps?subscribed_fields=messages

Expected response:

{
  "success": true
}

Verify afterward:

GET /<FACEBOOK_PAGE_ID>/subscribed_apps

14. Webhook vs Polling

Recommended architecture:

Webhooks
→ primary real-time inbox ingestion

Graph Conversations API
→ synchronization, reconciliation, and history

Polling alone can lead to:

Delayed inbox updates

Increased Graph API usage

Rate-limit pressure

Missing event context

Incorrect messaging-window assumptions

15. Page Access Token Requirement

A common error is:

(#190) This method must be called with a Page Access Token

Developers must distinguish between:

User Access Token
Page Access Token
Instagram Access Token

These token types are not interchangeable.

For the current Facebook Login messaging implementation, the backend must use the correct Page Access Token where required.

16. Token Validation

Before troubleshooting Meta functionality, verify the token used by the MarketMe backend.

Recommended checks:

Token exists.

Token has not expired.

Token belongs to the expected Meta application.

Token represents the expected Page.

Required scopes are granted.

Token has not been revoked.

Useful diagnostic request:

GET /me?fields=id,name

For the known working Page token, the expected identity is:

ID:
<FACEBOOK_PAGE_ID>

Name:
<FACEBOOK_PAGE_NAME>

For deeper inspection, use Meta's Access Token Debugger / token-debugging mechanism.

17. Token Security Requirements

Never expose Meta access tokens.

Do not:

Log raw access tokens                 ❌
Return them in API responses          ❌
Store them in frontend JavaScript     ❌
Commit them to Git                    ❌
Include them in screenshots           ❌
Send them through analytics tools     ❌

Safe logs may include:

tokenPresent: true
tokenType: page
tokenValid: true

Never log:

access_token
app_secret
client_secret
refresh_token

18. Known Working Messaging Request

A direct Graph API request was successfully tested using:

POST https://graph.facebook.com/v26.0/me/messages

with a valid Page Access Token.

Payload:

{
  "recipient": {
    "id": "<INSTAGRAM_SCOPED_USER_ID>"
  },
  "messaging_type": "RESPONSE",
  "message": {
    "text": "Reply after subscription test"
  }
}

Successful response shape:

{
  "recipient_id": "<INSTAGRAM_SCOPED_USER_ID>",
  "message_id": "<instagram-message-id>"
}

This should be treated as the baseline when debugging MarketMe outbound messaging.

19. MarketMe Backend Comparison Checklist

If Graph API Explorer succeeds but MarketMe fails, compare the backend request against the known working request.

Verify:

Graph host
Graph API version
Endpoint
HTTP method
Token type
Token identity
Token scopes
Recipient IGSID
Messaging type
Payload structure
Meta error code
Meta error subcode
fbtrace_id

Expected baseline:

Host:
graph.facebook.com

Version:
v26.0

Endpoint:
/me/messages

Method:
POST

Recipient:
<INSTAGRAM_SCOPED_USER_ID>

Messaging type:
RESPONSE

Token:
Page Access Token

20. Common Meta Errors Encountered

Error #190

(#190) This method must be called with a Page Access Token

Likely cause:

Wrong access-token type.

Error #10 / Subcode 2534022

(#10) This message is sent outside of allowed window.

Likely causes:

Messaging window has expired.

No qualifying recent inbound message exists.

Error #3

(#3) Application does not have the capability to make this API call.

Possible causes:

Wrong token

Stale token

Missing app capability

Wrong Graph endpoint

Wrong Graph API flow

Missing permission

App configuration mismatch

Compare against a known-good Graph API Explorer request before assuming the recipient ID is invalid.

Error #100 — No matching user found

(#100) No matching user found

Possible causes:

Identifier invalid for the endpoint.

ID valid but scoped differently for the API context.

Wrong Page/app context.

Do not immediately conclude that the IGSID itself is invalid.

Error #100 — Nonexisting field permissions

(#100) Tried accessing nonexisting field (permissions)

Meaning:

A Graph request attempted to request a field named permissions from an object that does not expose that field.

This is a malformed Graph diagnostic request, not proof that Instagram messaging permission was denied.

Use Meta's token-debugging mechanisms instead of requesting permissions as an Instagram object field.

Error #504

(#504) Invalid reply thread id

Possible causes:

Wrong HTTP method

Incorrect thread identifier

Conversation ID used with the wrong endpoint

Old POST parameters accidentally carried into a GET request

21. Feature-Specific Permissions

A successful connection does not mean every Instagram feature is available.

Treat these capabilities independently:

Authentication
Account/Profile
Publishing
Comments
Insights
Messaging
Webhooks

For example:

OAuth succeeds          ✅
Publishing succeeds     ✅

does not prove

DM sending succeeds     ✅

22. Publishing Limitations

Instagram publishing has independent permissions, platform restrictions, and publishing limits.

MarketMe should not assume unlimited publishing capacity.

Before implementing or changing publishing behavior, verify Meta's current documentation for:

Image formats

Reels

Stories

Carousels

Shopping tags

Branded content

Media-processing requirements

Publishing limits

These capabilities can change between Graph API versions.

23. API Version Dependency

Current tested Graph API version:

v26.0

Before upgrading:

Review Meta's changelog.

Verify deprecated fields.

Verify permissions.

Test OAuth.

Test publishing.

Test comments.

Test inbox retrieval.

Test inbound webhooks.

Test outbound messaging.

24. MarketMe Architecture Limitations

Potential failure locations:

Frontend sends wrong recipientId
        ↓
Next.js renames/drops recipientId
        ↓
Render receives null recipient_id
        ↓
Render uses wrong/stale token
        ↓
Render uses wrong Graph host/endpoint
        ↓
Meta rejects request

The recipient identifier should remain unchanged end-to-end:

Frontend recipientId
<INSTAGRAM_SCOPED_USER_ID>
        ↓
Next.js recipientId
<INSTAGRAM_SCOPED_USER_ID>
        ↓
Render recipient_id
<INSTAGRAM_SCOPED_USER_ID>
        ↓
Meta recipient.id
<INSTAGRAM_SCOPED_USER_ID>

25. Diagnostic Logging Requirements

Every Instagram operation should produce safe structured diagnostics.

Recommended fields:

platform
operation
connectionId
recipientId
conversationId
graphHost
graphVersion
graphEndpoint
tokenPresent
tokenType
metaErrorCode
metaErrorSubcode
fbtrace_id
requestCorrelationId

Example:

platform: instagram
operation: send_message
recipientId: <INSTAGRAM_SCOPED_USER_ID>
graphHost: graph.facebook.com
graphVersion: v26.0
graphEndpoint: /me/messages
tokenPresent: true
tokenType: page
metaErrorCode: 3
metaErrorSubcode: null

26. User-Friendly Error Handling

Raw Meta errors should not normally be shown directly to MarketMe users.

Meta Condition

Suggested MarketMe Message

Messaging window expired

This conversation is no longer eligible for a standard Instagram reply.

Token expired

Instagram connection expired. Please reconnect your account.

Missing messaging capability

Instagram messaging is not enabled for this connection.

Invalid recipient

This Instagram conversation can no longer be replied to.

Meta unavailable

Instagram is temporarily unavailable. Please try again later.

Technical details should remain available in logs.

27. Development Testing Matrix

Test

Expected Result

Connect Instagram Business account

Pass

Connect Instagram Creator account

Pass

Connect Personal Instagram account

Reject / Unsupported

Connect account without Facebook Page

Reject / Configuration error

Tester accepts Meta invitation

Pass

Tester does not accept invitation

Restricted / OAuth failure

Wrong Instagram account accepts / tester uses different account

Restricted / test invalid

Allow access to messages enabled in Instagram

DM integration expected to work

Allow access to messages disabled

Inbox/webhook/send behavior should fail gracefully

OAuth reauthorized after tester/permission changes

Pass

User has correct access to linked Facebook Page

Pass

User lacks sufficient Page/Instagram access

Connection or capability failure

Receive inbound DM from valid tester

Pass

Reply immediately to fresh DM

Pass

Reply outside messaging window

Expected Meta failure

Use valid IGSID

Pass

Use conversation ID as recipient

Fail

Use invalid recipient ID

Graceful failure

Page not subscribed to messages

Webhook failure

Page subscribed to messages

Webhook delivery expected

Webhook callback unavailable

Retry / recovery behavior

Duplicate webhook received

Must not duplicate inbox record

Webhooks arrive out of order

Inbox must remain consistent

User token used for Page-only endpoint

Expected #190

Valid Page Access Token

Pass

Token expired

Re-authentication required

Token revoked

Re-authentication required

Missing instagram_manage_messages

Messaging unavailable

MarketMe AI / Render offline

Graceful service failure

Meta API unavailable

Graceful failure

Direct Graph request succeeds while MarketMe fails

Investigate MarketMe backend

Disconnect Instagram from Facebook Page

Detect invalid connection

Customer blocks business account

Handle Meta restriction

Rate limit encountered

Backoff / retry logic

Publishing limit reached

Scheduler must prevent invalid publish

28. Reference Configuration Template

Meta Application

App Name:
MarketMe

App ID:
<META_APP_ID>

Facebook Page

Name:
<FACEBOOK_PAGE_NAME>

Page ID:
<FACEBOOK_PAGE_ID>

Instagram Professional Account

Username:
@<BUSINESS_INSTAGRAM_USERNAME>

Instagram ID:
<INSTAGRAM_BUSINESS_ACCOUNT_ID>

Test Instagram User

Username:
@<TEST_INSTAGRAM_USERNAME>

Instagram-Scoped User ID:
<INSTAGRAM_SCOPED_USER_ID>

Required Page Subscription

messages

Graph API

Host:
graph.facebook.com

Version:
v26.0

Known Working Send Endpoint

POST /me/messages

Do not store access tokens, App Secrets, or other credentials in this document.

29. Production Readiness Checklist

Required Meta permissions have the necessary access level.

Required permissions have passed App Review where necessary.

Meta Business verification is complete if required.

Privacy Policy URL is configured.

Data deletion instructions / callback are configured.

OAuth works for an account outside the development team.

Instagram Business connection works.

Instagram Creator connection works.

Personal Instagram accounts are handled gracefully.

Facebook Page linkage is validated.

Onboarding verifies or clearly instructs users to enable Instagram Allow access to messages.

Messaging-disabled accounts receive a clear remediation message.

Tester/app-role requirements are documented for Standard Access.

Production onboarding does not require ordinary customers to become Meta app testers after Advanced Access is approved.

OAuth is repeated after relevant role, permission, Page-link, or Instagram setting changes.

Page is automatically subscribed to required webhook fields.

Webhook callback is verified.

Webhook signatures are validated.

Duplicate webhooks are idempotent.

Out-of-order webhooks are handled.

Inbox synchronization can recover from missed webhooks.

Fresh DMs can be replied to.

Expired messaging-window replies fail gracefully.

Invalid recipients fail gracefully.

Access-token expiration is handled.

Token revocation is handled.

Tokens are encrypted at rest.

Tokens are never logged.

Meta rate limits are handled.

Publishing limits are enforced.

Render downtime is handled.

Meta downtime is handled.

User-facing errors do not expose raw Meta implementation details.

Logs retain Meta error codes, subcodes, and fbtrace_id.

Integration is tested with a non-developer/non-tester account after required Advanced Access approval.

30. Limitation Classification Template

Use this format when documenting new issues:

Field

Description

Limitation

What cannot be done or what restriction exists

Source

Meta / MarketMe / Infrastructure

Development Only

Yes / No

Production Impact

Description

Required Permission

Meta permission if applicable

Reproduction Steps

How to reproduce

Expected Behavior

Expected MarketMe response

Meta Error

Code / subcode if applicable

Workaround

Supported workaround if any

Production Blocker

Yes / No

Example:

Field

Value

Limitation

Standard replies cannot be sent outside Meta messaging window

Source

Meta

Development Only

No

Production Impact

Late automated replies fail

Required Permission

instagram_manage_messages

Reproduction Steps

Wait until reply window expires and attempt reply

Expected Behavior

MarketMe prevents or gracefully rejects send

Meta Error

#10 / 2534022

Workaround

Approved HUMAN_AGENT flow for eligible human support

Production Blocker

No, if handled correctly

31. User-Side Preflight Checklist

Before escalating an Instagram integration failure to the backend team, confirm the account owner has completed the following user-side setup:

Using an Instagram Business or Creator account.

Instagram Professional account is linked to the correct Facebook Page.

Person authorizing MarketMe has sufficient access to the Facebook Page / Instagram account.

If testing under Standard Access, tester/developer role has been added.

Tester invitation has been accepted from the exact Instagram account being tested.

Instagram mobile app → Connected tools → Allow access to messages is enabled.

MarketMe OAuth was completed after the above settings were in place.

All requested Meta permissions were granted.

Account was reconnected after any role, Page-link, account-type, or message-access changes.

A new DM was sent after setup so the messaging window and webhook flow can be tested cleanly.

If any item above is false, resolve it before treating the behavior as a MarketMe backend defect.

32. Recommended Debugging Order

When an Instagram feature fails, do not immediately classify it as an Instagram API limitation.

Use this order:

1. Confirm account type
2. Confirm Facebook Page linkage
3. Confirm Meta app/test role
4. Confirm required permissions
5. Confirm Standard vs Advanced Access
6. Confirm correct token type
7. Confirm token identity
8. Confirm Page webhook subscription
9. Confirm webhook callback delivery
10. Confirm recipient IGSID
11. Confirm messaging window
12. Reproduce request directly in Graph API Explorer
13. Compare successful direct request with MarketMe backend request
14. Only then classify the failure

A direct Graph API request succeeding while the same operation fails in MarketMe should normally be treated as a MarketMe implementation/configuration issue, not a Meta platform limitation.

33. Maintenance Notes

Review this document whenever:

Meta releases a new Graph API version.

MarketMe changes OAuth flows.

New Instagram permissions are added.

App Review status changes.

Advanced Access is granted or revoked.

Instagram messaging behavior changes.

Meta changes publishing or messaging limits.

The MarketMe AI / Render service changes its Meta integration.

New Meta errors are discovered during testing.

Always validate Meta-specific limits against the current Meta developer documentation before a production release.