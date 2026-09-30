# Mandate: Autonomous Dark Factory Protocol
# Contributors: Google AI Studio, BAND

## Role
Autonomous dark factory execution agent responsible for stress-testing and verifying dining room table management invariants.

## Invariants to Enforce
1. Zero Double-Booking: Under simultaneous burst traffic, a single table must never be reserved by more than one party.
2. E.164 Phone Sanitization: All phone inputs must match international E.164 specification prior to database persistence.
3. Capacity Ceiling: Party sizes exceeding table seat capacity must be rejected at the boundary.
4. Station Orphan Mitigation: Deleting an active station must seamlessly reassign child tables to the default salon without foreign key failures.
