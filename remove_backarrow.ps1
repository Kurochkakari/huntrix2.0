# PowerShell script to remove back arrow functionality from group 1.html files

# Get all target files (1.html in group folders)
$girlsFiles = Get-ChildItem -Path "альбомы общие женских групп" -Filter "1.html" | Where-Object { $_.DirectoryName -notmatch '\1$' -and $_.DirectoryName -notmatch '\2$' -and $_.DirectoryName -notmatch '\3$' -and $_.DirectoryName -notmatch '\group$' }
$boysFiles = Get-ChildItem -Path "альбомы общие мужских групп" -Filter "1.html" | Where-Object { $_.DirectoryName -notmatch '\1$' -and $_.DirectoryName -notmatch '\2$' -and $_.DirectoryName -notmatch '\3$' -and $_.DirectoryName -notmatch '\group$' }
$allFiles = $girlsFiles + $boysFiles

Write-Host "Found $($allFiles.Count) files to process"
$count = 0

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    
    $modified = $false
    
    # 1. Remove .back-arrow CSS block (including .back-arrow:hover and .back-arrow::before)
    if ($content -match '\.back-arrow\s*\{[^}]*\}\s*\.back-arrow:hover\s*\{[^}]*\}\s*\.back-arrow::before\s*\{[^}]*\}') {
        $content = $content -replace '\.back-arrow\s*\{[^}]*\}\s*\.back-arrow:hover\s*\{[^}]*\}\s*\.back-arrow::before\s*\{[^}]*\}', ''
        $modified = $true
    }
    
    # 2. Remove .back-arrow in media queries
    if ($content -match '\.back-arrow\s*\{[^}]*\}') {
        $content = $content -replace '\.back-arrow\s*\{[^}]*\}', ''
        $modified = $true
    }
    
    # 3. Remove <div id="backArrowContainer"></div>
    if ($content -match '<div id="backArrowContainer"></div>') {
        $content = $content -replace '<div id="backArrowContainer"></div>', ''
        $modified = $true
    }
    
    # 4. Remove <div class="back-arrow" id="fullscreenBackArrow"></div>
    if ($content -match '<div class="back-arrow" id="fullscreenBackArrow"></div>') {
        $content = $content -replace '<div class="back-arrow" id="fullscreenBackArrow"></div>', ''
        $modified = $true
    }
    
    # 5. Remove the JavaScript code that creates the back arrow
    if ($content -match '// Проверяем, находимся ли мы на странице альбома') {
        $content = $content -replace '// Проверяем, находимся ли мы на странице альбома.*?document\.getElementById\([^)]+\)\.appendChild\(backArrow\);', ''
        $modified = $true
    }
    
    # 6. Remove the event listener for fullscreenBackArrow
    if ($content -match "document\.getElementById\('fullscreenBackArrow'\)\.addEventListener\('click', closeFullscreen\)") {
        $content = $content -replace "document\.getElementById\('fullscreenBackArrow'\)\.addEventListener\('click', closeFullscreen\);", ''
        $modified = $true
    }
    
    if ($modified) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $count++
        Write-Host "Processed: $($file.Name)"
    }
}

Write-Host "`nCompleted! Modified $count files."
