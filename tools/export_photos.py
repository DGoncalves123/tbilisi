#!/usr/bin/env python3
"""
Export / resize the photos for the site (the mechanical step, run at finalize time).

Reads docs/data/photos.json and, for every photo with "include": true,
writes a web-sized JPEG into docs/assets/photos/ using the same filename.

Source priority:
  1. If --source DIR is given, use <DIR>/<filename> (your EDITED version).
  2. Otherwise use the original from the phone dump.

Sizing (by the per-photo "layout" field):
  hero / wide  -> max 2400 px on the long edge
  small        -> max 900 px
  standard     -> max 1800 px

Usage:
  python3 tools/export_photos.py --dry-run
  python3 tools/export_photos.py                        # from originals
  python3 tools/export_photos.py --source tools/edited  # from your edited copies
"""
import os, sys, json, argparse

PROJ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MANIFEST = os.path.join(PROJ, "docs", "data", "photos.json")
ORIG = "/home/diogo/Documentos/s22_photos/Camera/Camera"
DEST = os.path.join(PROJ, "docs", "assets", "photos")

try:
    from PIL import Image
    HAVE_PIL = True
except Exception:
    HAVE_PIL = False

def size_for(layout):
    if layout in ("hero", "wide"):
        return 2400
    if layout == "small":
        return 900
    return 1800

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--source", help="dir with edited versions (same filenames)")
    ap.add_argument("--dry-run", action="store_true", help="print only, do not write")
    ap.add_argument("--quality", type=int, default=85)
    args = ap.parse_args()

    if not HAVE_PIL:
        print("PIL not available — cannot resize. Install Pillow.")
        sys.exit(1)

    m = json.load(open(MANIFEST))
    photos = [p for p in m["photos"] if p.get("include", True)]
    os.makedirs(DEST, exist_ok=True)

    done = skipped = 0
    for p in photos:
        fn = p["filename"]
        src = os.path.join(args.source, fn) if args.source else os.path.join(ORIG, fn)
        if not os.path.exists(src):
            print(f"  [missing] {fn}  (looked at {src})")
            skipped += 1
            continue
        maxpx = size_for(p.get("layout", ""))
        dest = os.path.join(DEST, fn)
        try:
            im = Image.open(src)
            im.thumbnail((maxpx, maxpx))
            if im.mode not in ("RGB", "L"):
                im = im.convert("RGB")
            if args.dry_run:
                print(f"  [dry] {fn}  {im.size[0]}x{im.size[1]}  (layout={p.get('layout') or 'auto'})")
            else:
                im.save(dest, "JPEG", quality=args.quality, optimize=True)
                print(f"  [wrote] {fn}  {im.size[0]}x{im.size[1]}")
            done += 1
        except Exception as e:
            print(f"  [error] {fn}: {e}")
            skipped += 1

    print(f"\n{done} processed, {skipped} skipped/missing (of {len(photos)} included).")
    if args.dry_run:
        print("Dry run — nothing written.")

if __name__ == "__main__":
    main()
