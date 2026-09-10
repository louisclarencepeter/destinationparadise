# DPO onboarding meeting — questions (Zanzibar, 2026-08-03)

Get answers IN WRITING (ask for an email summary). Items marked ⚙ change how
the deployed integration behaves; bring logo files for §15.

## A. Account, timeline, money

1. Approval requirements for a tour operator (entity docs, settlement bank
   account) — and time to (a) sandbox credentials, (b) production credentials.
   Sandbox today is ideal: the integration is built and waiting.
2. Chargeable currencies (USD, TZS, EUR, GBP) and settlement currencies;
   conversion treatment when the payer uses another currency. ⚙
3. Card pricing (domestic vs international) and mobile money pricing per MNO.
4. Settlement frequency; bank/FX fees; rolling reserve % and release period.
5. Transaction + monthly limits, incl. per-MNO mobile money caps.
6. Chargeback process, evidence requirements, fees.
7. Partial refunds: can ONE trip be refunded from a combined multi-service
   payment, per payment method (esp. mobile money)? Refund fees? If not,
   we define a manual policy before launch. ⚙

## B. Technical integration

8. API host/version for our account — integration targets
   secure.3gdirectpay.com/API/v6; confirm or correct. ⚙
9. Approved ServiceType code(s); ServiceRef format constraints; confirm
   ServiceDate = YYYY/MM/DD HH:MM local time. ⚙
10. Server-to-server callback: enabled? Method (GET/POST), payload, retry
    schedule. Register URLs — production:
    https://yournexttriptoparadise.com/api/payments/dpo/return
    https://yournexttriptoparadise.com/api/payments/dpo/callback
    sandbox/staging: the same paths on
    https://store--destinationparadisezanzibar.netlify.app ⚙
11. verifyToken: authoritative amount/currency fields under payer conversion;
    exact semantics of VerifyTransaction=1 (we verify with 0, finalize, then
    acknowledge with 1 — confirm the sequence). ⚙
12. CompanyRefUnique: may the same CompanyRef be reused when re-creating a
    token for a still-unpaid retry? (Our retry flow does this.) ⚙
13. Maximum PTL (payment window) in minutes. ⚙
14. Sandbox test assets: test cards, test mobile numbers, supported scenarios
    (success, decline, timeout, currency conversion).

## C. Guest experience

15. Hosted page branding (docs-confirmed): configure logo, trading name,
    colours in the meeting — how is it set up and previewed?
16. Iframe embedding of the hosted page: permitted for our account? 3-D Secure
    behaviour inside frames? Docs read redirect-only — get the written stance. ⚙
17. On-site mobile money: chargeTokenMobile enabled? Which Tanzanian MNOs
    (M-Pesa, Tigo Pesa, Airtel Money, Halopesa)? getMobilePaymentOptions
    reflects the account? Extra approvals? (Guests pay without leaving our
    site — priority enhancement after activation.) ⚙
18. Hosted page localization (EN/DE/PL guests) — can we pass a language?

## D. Operations

19. Named support/escalation contact + hours for production incidents.
20. Any account-specific behaviour that differs from docs.dpopay.com
    (their callback docs are known-inconsistent — what is true for US?). ⚙
