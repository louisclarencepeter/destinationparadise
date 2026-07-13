# Destination Paradise Threads auto-commenter

This automation is separate from the Instagram Story publisher. It uses only Meta's official Threads API to search recent public posts and publish replies. It does not scan Facebook Groups, scrape Meta pages, use browser clicks, or keep a lead database.

## Safety model

- Dry-run is the default. Publishing requires `--publish` or the explicit workflow input.
- Candidates must be fresh, original posts with both a Zanzibar/Tanzania destination signal and clear question/request intent.
- News, politics, complaints, businesses, promotions, spam, ambiguous posts, and medical/visa/entry questions are rejected.
- The account is verified as `@yournexttriptoparadise` before candidates are processed.
- The script checks the account's recent replies through `/me/replies` and also keeps minimal duplicate-prevention state.
- The Zanzibar-day cap is five attempts. A run handles at most two posts, and one post is attempted only once.
- State retains only the source post ID, reply ID when known, timestamps, and a small status value. It is pruned after 90 days.
- A post ID is journaled before publishing. The publish endpoint is called exactly once. A timeout, 5xx response, rate-limit response, or other uncertain failure is recorded and is never retried automatically.

## Required Threads authorization

The existing Instagram credentials are not valid for Threads. Create or use a Meta app with the **Threads API** use case, authorize the Destination Paradise Threads profile, and grant:

- `threads_basic`
- `threads_content_publish`
- `threads_manage_replies`
- `threads_read_replies`
- `threads_keyword_search`

Complete Meta's authorization-code flow, exchange the resulting user token for a long-lived Threads user access token, and confirm the scopes and expiry in Meta's Access Token Debugger. Keep the app secret and authorization code out of this repository and out of Actions logs.

Store only the resulting long-lived token in the GitHub Actions secret `THREADS_USER_ACCESS_TOKEN`. For example, from an authenticated shell, this prompts without printing the value:

```sh
gh secret set THREADS_USER_ACCESS_TOKEN --repo louisclarencepeter/destinationparadise
```

Meta's official references:

- [Threads API getting started](https://developers.facebook.com/docs/threads/get-started/)
- [Threads authorization](https://developers.facebook.com/docs/threads/get-started/get-access-tokens-and-permissions/)
- [Threads keyword search](https://developers.facebook.com/docs/threads/keyword-search/)
- [Meta's official Threads API workspace](https://www.postman.com/meta/threads/overview)

## Safe activation order

Scheduled workflows only run from this repository's default branch (`main`). Do not move this workflow to `main` until the OAuth grant has been completed and a manual dry-run has been reviewed.

1. Add `THREADS_USER_ACCESS_TOKEN` as a GitHub Actions secret.
2. After the workflow reaches `main`, manually run **Threads Auto Commenter** with `initialize_state=true` and `publish=false`.
3. Review the dry-run summary. It intentionally logs no source usernames, post text, permalinks, categories, or generated reply text.
4. Manually run once with `publish=true` and inspect the resulting public reply.
5. Leave the schedule enabled only after that reply passes review.

Local commands use the same secret from the environment:

```sh
npm run threads:comment:dry-run
npm run threads:comment:publish
```

Never put the token in a tracked `.env` file. The local state file `.threads-auto-commenter-state.json` is ignored by Git.
