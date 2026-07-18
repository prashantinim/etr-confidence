# ETR Confidence

A shadow-mode prototype for improving electricity outage Estimated Time of Restoration (ETR) forecasts.

The interface demonstrates the MVP workflow:

- active outage prioritisation;
- dynamic P50 operational and P80 customer ETRs;
- explanation of each ETR recalibration;
- incident trajectories that preserve category changes; and
- confidence factors for safer operator judgement.

## Calculation approach

The product mirrors the utility's ADMS ETR rules rather than replacing them with
a black-box model. It calculates dispatch delay, adjusted travel and adjusted
repair time, then applies switching and backfeed effects. Travel uses the
operational-zone, traffic, day/night and weather coefficients. Repair uses
cause, asset damage, weather, access, crew availability and escalation
coefficients. Fault-location confidence and material availability widen the
customer-facing P80 range.

The coefficients in this prototype are illustrative. Production deployment must
map every value to the utility's specific ADMS rules and calibrate against
completed outage records.

## Run locally

```bash
npm install
npm run dev
```

## MVP boundary

This prototype is read-only decision support. It does not control an ADMS, dispatch crews, or issue customer notifications.
