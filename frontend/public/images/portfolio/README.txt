# Gallery photos.
#
# The easy way: /admin → "גלריה" → upload. The server resizes the photo,
# commits it here together with data/gallery.json, and the site redeploys.
#
# By hand:
# 1. Drop a file in this folder, e.g. wedding-01.jpg (long edge ≤ 1600px)
# 2. Add an entry to data/gallery.json with  "src": "/images/portfolio/wedding-01.jpg"
# 3. Write an `alt` that describes the actual photo
#
# The build fails if this folder and gallery.json disagree (scripts/check-images.mjs).
