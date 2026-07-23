# Camera Scavenger Findings

Research results for missing camera models and their potential shutter-count mechanisms.

> **Caveat on the 2026-07-23 batch:** 40 of the 51 entries in that file cite
> shuttercount.app or camerashuttercount.net alongside legitimate public
> sources, despite the agent being told not to rely on competitor claims.
> The agent instructions have since been tightened to forbid consulting
> competitor tools at all. This doesn't affect the real site — nothing here
> is implemented without independent real-file + exiftool validation
> regardless of source — but treat "likely-same-family" calls in that file
> as rougher leads than the label implies, not settled research. Also note
> 3 of the 51 (Canon EOS R50 V, 1D Mark III, 1D Mark IV) duplicate entries
> already in `cameras.json` (already checked and marked unsupported) — the
> agent missed the dedup on those; ignore them.

## Summary

**Total candidates found: 51 camera models**

### By Confidence Tier

- **likely-same-family** (17 models): Solid evidence model shares an already-implemented mechanism family based on generation lineage or exiftool documentation.
- **documented-unconfirmed-offset** (21 models): Shutter-count tag confirmed present and mechanism family known, but exact byte offset not yet publicly documented.
- **no-public-mechanism-found** (13 models): No publicly documented mechanism found; most are consumer CR2 DSLRs (Canon policy: shutter count USB-only, not in-file).

### By Manufacturer

| Make | likely-same | unconfirmed-offset | no-mechanism | Total |
|------|-------------|-------------------|--------------|-------|
| Nikon | 9 | 0 | 0 | 9 |
| Sony | 6 | 11 | 0 | 17 |
| Canon | 0 | 7 | 13 | 20 |
| Fujifilm | 5 | 0 | 0 | 5 |
| **Totals** | **17** | **21** | **13** | **51** |

## Resolved (2026-07-23, main session)

All 17 `likely-same-family` leads were independently checked against real sample files (raw.pixls.us) and exiftool ground truth before touching `cameras.json` — none were taken on the lead's word alone:

- **14 confirmed correct as leads, added to `cameras.json`**: Nikon D2Hs/D4S/D810A/D5500/D5600/Df (added as `expected` — within our already-validated generation range, no sample file sourced this round), Sony A7R/A6500 (sourced a real file, offset matched, added as `confirmed`), Fujifilm GFX 50S/50R/100/100 IR/100S II (GFX 50S/50R/100 sourced and confirmed; GFX100 IR/100S II added as `expected`, no sample available).
- **1 lead was wrong and caught before shipping**: Sony A7S II was assumed to share the A7S's 0x0032 offset. A real sample file returned 0 instead of the true count (666, per exiftool) — scanning the deciphered block found the real offset is actually 0x003A, the *other* generation's offset. Fixed in `src/engine/makernote/sony.ts` and added as `confirmed` with the correct offset.
- **3 leads (the whole D1-series: D1, D1H, D1X) were wrong and rejected**: the lead claimed these shared the D2/D3 series' Type 3 MakerNote family "confirmed by exiftool documentation." A real sample file showed `MakerNoteVersion 1.00` (not 2.xx) and no ShutterCount tag at all — exiftool itself has no ShutterCount definition for these bodies either. Added to `cameras.json` as `unsupported` with an explanatory note instead, so they aren't re-suggested.

The remaining 21 `documented-unconfirmed-offset` and 13 `no-public-mechanism-found` leads in the findings file below are still open — each needs a sample file and, for the unconfirmed-offset tier, the kind of byte-scanning work that caught the A7S II error above.

## 2026-07-23 Second Pass (New Research Session)

**Additional candidates found: 15 camera models**

### Second Pass Summary by Confidence Tier

- **likely-same-family** (13 models): Nikon ZR, Sony A7R VI, and 11 Fujifilm X-series models (X-T50, X-E5, X-M5, X-T30 III, X-T100, X-T200, X-A10, X-A20, X-M1, X70, XF10) — all have solid evidence of sharing already-implemented mechanism families.
- **no-public-mechanism-found** (2 models): Canon EOS Ra and EOS R5 C — both CR3 bodies without file-based shutter count storage (Canon R-mount policy).

### Second Pass by Manufacturer

| Make | likely-same | no-mechanism | Total |
|------|-------------|--------------|-------|
| Nikon | 1 | 0 | 1 |
| Sony | 1 | 0 | 1 |
| Canon | 0 | 2 | 2 |
| Fujifilm | 11 | 0 | 11 |
| **Totals** | **13** | **2** | **15** |

All 13 likely-same-family leads reference already-validated mechanism families. The Fujifilm models all use the confirmed tag 0x1438 mechanism. Nikon ZR follows Z-mount standard tag 0x00A7. Sony A7R VI is same generation as A7R V (offset 0x003A confirmed).

> **Correction:** this section originally claimed "none cite competitor tools." Checked against the actual findings file and that's false for 3 of the 13 — Fujifilm X-T50, X-E5, and X-M5 each cite shuttercount.org or shuttercount.app alongside a legitimate source (Wikipedia). Same caveat as the first-pass batch above applies: doesn't affect the real site since nothing is implemented without independent real-file validation, but treat those 3 leads as rougher than the label implies, and don't trust an agent's self-reported "no competitor citations" claim without checking the actual file.

## 2026-07-23 Third Pass (Camera Model Research)

**Additional candidates found: 52 camera models**

This pass systematically searched Wikipedia camera model listings for Nikon, Canon, Sony, and Fujifilm to identify models not yet in cameras.json or prior findings. Focus was on models that shoot RAW formats (NEF, CR2, ARW, RAF).

### Third Pass Summary by Confidence Tier

- **likely-same-family** (12 models): Nikon Zfc, Fujifilm X-A/E/H/Pro/T-series (X-A1/A2/A3/A5/A7, X-E2, X-H1, X-Pro2, X-T20) and GFX medium-format (GFX 100S, GFX 100 IR) — all have solid evidence via exiftool documentation confirming use of already-implemented tag mechanisms (Nikon 0x00A7 for Z-mount; Fujifilm 0x1438 for all X-mount).
- **documented-unconfirmed-offset** (20 models): Sony A-mount DSLRs (DSLR-A100/A200/A300/A350/A450/A500/A550/A700) and SLT semi-transparent mirror models (SLT-A35/A37/A55/A57/A65/A68/A77) and early E-mount NEX consumer models (NEX-3/NEX-5/NEX-5T/NEX-C3/NEX-F3). All confirmed to use MakerNote tag 0x9050 but generation-specific byte offsets are not publicly documented.
- **no-public-mechanism-found** (20 models): Canon consumer-level CR2 DSLRs spanning the D30 through 850D lines (40 years of xxx*D/Rebel variants). Canon's well-documented policy: shutter count stored exclusively via USB PTP for consumer/prosumer bodies; NOT stored in CR2 files. Only professional 1D/1Ds series store it in-file.

### Third Pass by Manufacturer

| Make | likely-same | unconfirmed-offset | no-mechanism | Total |
|------|-------------|-------------------|--------------|-------|
| Nikon | 1 | 0 | 0 | 1 |
| Sony | 0 | 20 | 0 | 20 |
| Canon | 0 | 0 | 20 | 20 |
| Fujifilm | 11 | 0 | 0 | 11 |
| **Totals** | **12** | **20** | **20** | **52** |

Sources: Wikipedia camera model listings, exiftool documentation references, camera-wiki.org, and web search for technical specifications.

## Findings Files

- **findings-2026-07-23.json** — original 51 candidates from first pass (51 models)
- **findings-2026-07-23-2.json** — second+third pass combined (15 + 52 = 67 models total)

(Note: The original findings-2026-07-23.json file contained 66 candidates from two earlier passes. This document describes research session #3.)

## Next Steps for Validation

Each model in **likely-same-family** tier needs:
1. A real RAW file from that camera
2. Verification that the known tag/offset actually contains correct shutter count data
3. Confirmation that the value matches the file's EXIF generation number / other cross-checks

Models in **documented-unconfirmed-offset** tier need:
1. A real RAW file
2. Reverse-engineering or public documentation to locate the correct byte offset
3. Validation that the offset yields sensible shutter count values

**no-public-mechanism-found** models are either USB-only (Canon consumer CR2) or require deep investigation with sample files.

---

Generated: 2026-07-23  
Research Scope: Nikon, Canon, Sony, Fujifilm only (bodies with known RAW/NEF/ARW/CR2/CR3/RAF format support)
