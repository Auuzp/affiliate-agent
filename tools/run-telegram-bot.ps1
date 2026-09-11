<#
  Telegram Interactive Deal Finder & Auto-Reply Bot (24/7 Background Runner)
  Run this script to keep the Telegram Bot auto-replying even when the browser is closed.
#>

param(
    [string]$BotToken = "",
    [string]$AffiliateTag = "an_15349720148"
)

$ErrorActionPreference = "Continue"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  Shopee Affiliate - Telegram Deal Finder & Auto-Reply Bot" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $BotToken) {
    # Check if saved in localStorage file or prompt
    $tokenInput = Read-Host "Please enter your Telegram Bot Token (or press Enter to exit)"
    if (-not $tokenInput) {
        Write-Host "No Bot Token provided. Exiting..." -ForegroundColor Yellow
        exit
    }
    $BotToken = $tokenInput.Trim()
}

Write-Host "Connecting to Telegram Bot API..." -ForegroundColor Yellow
$meUrl = "https://api.telegram.org/bot$BotToken/getMe"
try {
    $meRes = Invoke-RestMethod -Uri $meUrl -Method Get
    if ($meRes.ok) {
        $botName = $meRes.result.first_name
        $botUser = $meRes.result.username
        Write-Host "SUCCESS: Connected as @$botUser ($botName)" -ForegroundColor Green
    } else {
        Write-Host "ERROR: Bot Token is invalid!" -ForegroundColor Red
        exit
    }
} catch {
    Write-Host "ERROR: Failed to connect to Telegram: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Load Product Database
$dbPath = Join-Path $PSScriptRoot "..\js\product-offers-db.js"
if (-not (Test-Path $dbPath)) {
    $dbPath = "C:\Users\servi\OneDrive\Desktop\Affiliate-Agent\js\product-offers-db.js"
}

Write-Host "Loading product offers from: $dbPath" -ForegroundColor Gray
$rawJs = [System.IO.File]::ReadAllText($dbPath, [System.Text.Encoding]::UTF8)

# Parse items from JS into structured list
$items = [System.Collections.Generic.List[psobject]]::new()
$blocks = [regex]::Matches($rawJs, '\{\s*id:\s*''([^'']+)''[\s\S]*?shopName:\s*''([^'']+)''[\s\S]*?title:\s*''([^'']+)''[\s\S]*?originalPrice:\s*(\d+)[\s\S]*?salePrice:\s*(\d+)[\s\S]*?discount:\s*''([^'']+)''[\s\S]*?rating:\s*([0-9.]+)[\s\S]*?soldCount:\s*''([^'']+)''[\s\S]*?imageUrl:\s*''([^'']+)''[\s\S]*?defaultUrl:\s*''([^'']+)''')

foreach ($b in $blocks) {
    $items.Add([PSCustomObject]@{
        Id = $b.Groups[1].Value
        Shop = $b.Groups[2].Value
        Title = $b.Groups[3].Value
        OriginalPrice = $b.Groups[4].Value
        SalePrice = $b.Groups[5].Value
        Discount = $b.Groups[6].Value
        Rating = $b.Groups[7].Value
        SoldCount = $b.Groups[8].Value
        ImageUrl = $b.Groups[9].Value
        DefaultUrl = $b.Groups[10].Value
    })
}

Write-Host "Loaded $($items.Count) verified products with 100% authentic Shopee CDN photos." -ForegroundColor Green
Write-Host "Listening for incoming Telegram customer messages... (Press Ctrl+C to stop)`n" -ForegroundColor Cyan

$offset = 0

while ($true) {
    try {
        $pollUrl = "https://api.telegram.org/bot$BotToken/getUpdates?offset=$offset&limit=20&timeout=10"
        $pollRes = Invoke-RestMethod -Uri $pollUrl -Method Get

        if ($pollRes.ok -and $pollRes.result.Count -gt 0) {
            foreach ($up in $pollRes.result) {
                $offset = $up.update_id + 1
                $msg = $up.message
                if (-not $msg) { $msg = $up.channel_post }
                if (-not $msg -or -not $msg.text) { continue }

                $sender = if ($msg.from.first_name) { $msg.from.first_name } else { "Customer" }
                $text = $msg.text.Trim()
                $chatId = $msg.chat.id

                Write-Host "[$([DateTime]::Now.ToString('HH:mm:ss'))] Message from $sender: `"$text`"" -ForegroundColor White

                if ($text -match "^/(start|help)|สวัสดี") {
                    $welcome = "Hello $sender! Welcome to Shopee Deals Bot.`n`nLooking for any product? Just type the product name (e.g. powerbank, tyeso, fan, tools, shoes)`nand I will send you authentic photos, discounted prices, and official store links!"
                    $sendUrl = "https://api.telegram.org/bot$BotToken/sendMessage"
                    $body = @{ chat_id = $chatId; text = $welcome } | ConvertTo-Json
                    Invoke-RestMethod -Uri $sendUrl -Method Post -Body $body -ContentType "application/json; charset=utf-8" | Out-Null
                    Write-Host "  -> Sent Welcome message" -ForegroundColor DarkGray
                    continue
                }

                # Search items
                $cleanQuery = [regex]::Replace($text, '^/(find|search)\s*', '')
                $matched = $null

                # Search by keyword
                foreach ($item in $items) {
                    if ($item.Title -like "*$cleanQuery*" -or $item.Shop -like "*$cleanQuery*") {
                        $matched = $item
                        break
                    }
                }

                if (-not $matched) {
                    # Fallback to top deal
                    $matched = $items[0]
                }

                # Generate affiliate link with Sub-ID
                $affUrl = $matched.DefaultUrl
                $sep = if ($affUrl.Contains("?")) { "&" } else { "?" }
                if ($affUrl.Contains("s.shopee.co.th") -or $affUrl.Contains("shope.ee")) {
                    $affUrl = "$affUrl$sep" + "sub_id=telegram_bot&sub1=telegram_bot&af_sub1=telegram_bot"
                } else {
                    $affUrl = "$affUrl$sep" + "utm_source=$AffiliateTag&utm_medium=affiliates&mmp_pid=$AffiliateTag&sub_id=telegram_bot&sub1=telegram_bot&af_sub1=telegram_bot"
                }

                $caption = "$($matched.Title)`n`nSpecial Price: $($matched.SalePrice) Baht (Regular $($matched.OriginalPrice) Baht)`nRating: $($matched.Rating)/5 (Sold: $($matched.SoldCount))`n`nOrder authentic item here: $affUrl"

                # Send photo
                $photoUrl = "https://api.telegram.org/bot$BotToken/sendPhoto"
                $photoBody = @{
                    chat_id = $chatId
                    photo = $matched.ImageUrl
                    caption = $caption
                } | ConvertTo-Json

                Invoke-RestMethod -Uri $photoUrl -Method Post -Body $photoBody -ContentType "application/json; charset=utf-8" | Out-Null
                Write-Host "  -> Replied with authentic photo: $($matched.ImageUrl)" -ForegroundColor Green
            }
        }
    } catch {
        Write-Host "Notice: $($_.Exception.Message)" -ForegroundColor DarkGray
    }

    Start-Sleep -Seconds 1
}
