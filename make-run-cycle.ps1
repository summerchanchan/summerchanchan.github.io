# Build a 2-frame run cycle from the single rumi-run.png.
# Frame 2 = same sprite but the legs strip (lower part of the dog) is mirrored
# horizontally, so the legs visibly swap stride -> reads as running.
# Output: rumi-run-sheet.png  (two frames side by side, transparent)
Add-Type -AssemblyName System.Drawing
$dir = "C:\Users\cxiay\personal-website\assets"
$run = [System.Drawing.Bitmap]::FromFile("$dir\rumi-run.png")
$w = $run.Width; $h = $run.Height

# bounding box of opaque pixels
$minX = $w; $minY = $h; $maxX = 0; $maxY = 0
for ($y = 0; $y -lt $h; $y++) { for ($x = 0; $x -lt $w; $x++) {
  if ($run.GetPixel($x, $y).A -gt 20) {
    if ($x -lt $minX) { $minX = $x }; if ($x -gt $maxX) { $maxX = $x }
    if ($y -lt $minY) { $minY = $y }; if ($y -gt $maxY) { $maxY = $y }
  }
}}
$bh = $maxY - $minY
$legTop = [int]($minY + $bh * 0.58)      # legs occupy the lower ~42%
$stripW = $maxX - $minX + 1
$stripH = $maxY - $legTop + 1

# frame 2 starts as a clone
$f2 = New-Object System.Drawing.Bitmap($run)

# extract the legs strip, flip it horizontally
$strip = New-Object System.Drawing.Bitmap($stripW, $stripH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($strip)
$src = New-Object System.Drawing.Rectangle($minX, $legTop, $stripW, $stripH)
$dst = New-Object System.Drawing.Rectangle(0, 0, $stripW, $stripH)
$g.DrawImage($run, $dst, $src, [System.Drawing.GraphicsUnit]::Pixel)
$g.Dispose()
$strip.RotateFlip([System.Drawing.RotateFlipType]::RotateNoneFlipX)

# clear the legs area on frame 2, then stamp the flipped legs back
$g2 = [System.Drawing.Graphics]::FromImage($f2)
$g2.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
$clear = New-Object System.Drawing.Rectangle($minX, $legTop, $stripW, $stripH)
$g2.SetClip($clear); $g2.Clear([System.Drawing.Color]::FromArgb(0,0,0,0)); $g2.ResetClip()
$g2.DrawImage($strip, $minX, $legTop)
$g2.Dispose()

# compose 2-frame sheet
$sheet = New-Object System.Drawing.Bitmap(($w * 2), $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$gs = [System.Drawing.Graphics]::FromImage($sheet)
$gs.DrawImage($run, 0, 0, $w, $h)
$gs.DrawImage($f2,  $w, 0, $w, $h)
$gs.Dispose()
$sheet.Save("$dir\rumi-run-sheet.png", [System.Drawing.Imaging.ImageFormat]::Png)
$f2.Save("$dir\rumi-run2.png", [System.Drawing.Imaging.ImageFormat]::Png)
$run.Dispose(); $f2.Dispose(); $sheet.Dispose(); $strip.Dispose()
Write-Host ("done. bbox=($minX,$minY)-($maxX,$maxY) legTop=$legTop  sheet=$($w*2)x$h")
