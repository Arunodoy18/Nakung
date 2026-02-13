# Nakung Marquee Promo Tile Generator (1400x560px)
Add-Type -AssemblyName System.Drawing

$width = 1400
$height = 560

# Create bitmap
$bmp = New-Object System.Drawing.Bitmap($width, $height)
$graphics = [System.Drawing.Graphics]::FromImage($bmp)
$graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAlias

# Gradient background (purple to blue)
$rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
$startColor = [System.Drawing.Color]::FromArgb(255, 99, 102, 241)  # Purple
$endColor = [System.Drawing.Color]::FromArgb(255, 59, 130, 246)    # Blue
$brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $startColor, $endColor, 45)
$graphics.FillRectangle($brush, $rect)

# Add subtle pattern overlay
$overlayColor = [System.Drawing.Color]::FromArgb(20, 255, 255, 255)
$overlayBrush = New-Object System.Drawing.SolidBrush($overlayColor)
for ($i = 0; $i -lt 30; $i++) {
    $x = Get-Random -Minimum 0 -Maximum $width
    $y = Get-Random -Minimum 0 -Maximum $height
    $size = Get-Random -Minimum 50 -Maximum 150
    $graphics.FillEllipse($overlayBrush, $x, $y, $size, $size)
}

# White text
$white = [System.Drawing.Color]::White
$whiteTransparent = [System.Drawing.Color]::FromArgb(200, 255, 255, 255)

# Title: "NAKUNG" (large, bold)
$titleFont = New-Object System.Drawing.Font("Segoe UI", 90, [System.Drawing.FontStyle]::Bold)
$titleBrush = New-Object System.Drawing.SolidBrush($white)
$titleText = "NAKUNG"
$titleSize = $graphics.MeasureString($titleText, $titleFont)
$titleX = ($width - $titleSize.Width) / 2
$titleY = 80
$graphics.DrawString($titleText, $titleFont, $titleBrush, $titleX, $titleY)

# Subtitle: "AI Coding Mentor"
$subtitleFont = New-Object System.Drawing.Font("Segoe UI", 36, [System.Drawing.FontStyle]::Regular)
$subtitleBrush = New-Object System.Drawing.SolidBrush($whiteTransparent)
$subtitleText = "AI Coding Mentor"
$subtitleSize = $graphics.MeasureString($subtitleText, $subtitleFont)
$subtitleX = ($width - $subtitleSize.Width) / 2
$subtitleY = 200
$graphics.DrawString($subtitleText, $subtitleFont, $subtitleBrush, $subtitleX, $subtitleY)

# Features line
$featuresFont = New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Regular)
$featuresBrush = New-Object System.Drawing.SolidBrush($white)
$featuresText = "Partner Mode  |  Reviewer Mode  |  LeetCode, CodeChef, HackerRank"
$featuresSize = $graphics.MeasureString($featuresText, $featuresFont)
$featuresX = ($width - $featuresSize.Width) / 2
$featuresY = 280
$graphics.DrawString($featuresText, $featuresFont, $featuresBrush, $featuresX, $featuresY)

# Tagline at bottom
$taglineFont = New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Italic)
$taglineBrush = New-Object System.Drawing.SolidBrush($whiteTransparent)
$taglineText = "Your intelligent companion for mastering competitive programming"
$taglineSize = $graphics.MeasureString($taglineText, $taglineFont)
$taglineX = ($width - $taglineSize.Width) / 2
$taglineY = 450
$graphics.DrawString($taglineText, $taglineFont, $taglineBrush, $taglineX, $taglineY)

# Save
$outputPath = Join-Path (Get-Location) "nakung-marquee-1400x560.png"
$bmp.Save($outputPath, [System.Drawing.Imaging.ImageFormat]::Png)

# Cleanup
$graphics.Dispose()
$bmp.Dispose()

Write-Host "Marquee tile created: $outputPath" -ForegroundColor Green
Write-Host "Size: 1400x560 pixels" -ForegroundColor Cyan
Invoke-Item $outputPath
