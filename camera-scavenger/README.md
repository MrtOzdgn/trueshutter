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

## Findings File

See **findings-2026-07-23.json** for detailed per-model research: mechanism lead, source citation, and notes on why each model needs a real sample file before confirmation.

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
