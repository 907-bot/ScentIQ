# OdorNet Dataset Card

## Dataset Details
- **Dataset Name:** OdorNet Aligned Multi-Label Benchmark
- **Version:** 1.0.0
- **Source Repository:** <https://github.com/NKU-DOIE/OdorNet>
- **Zenodo DOI:** `10.5281/zenodo.19838455`
- **License:** CC BY 4.0
- **Primary Task:** Monomolecular multi-label odor classification across 12 broad categories.

## Categories & Vocabulary
1. `fruity`
2. `floral`
3. `woody`
4. `sweet`
5. `green`
6. `herbal`
7. `spicy`
8. `citrus`
9. `earthy`
10. `chemical`
11. `animalic`
12. `minty`

## Partitions & Split Strategy
- Standard fixed 7:2:1 stereochemistry-safe split:
  - Train: 6,224 molecules (70%)
  - Validation: 1,778 molecules (20%)
  - Test: 890 molecules (10%)
  - Total: 8,892 aligned molecules

## Missing-Label Policy
- Unresolved / unannotated cells remain `NaN`.
- ScentIQ implements **Masked BCE Loss**: only observed cells contribute to gradient updates. Unobserved annotations are never treated as negative evidence (`0.0`).
