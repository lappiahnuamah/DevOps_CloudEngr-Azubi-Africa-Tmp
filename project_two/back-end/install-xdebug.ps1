# Get PHP information
$phpInfo = php -i
$threadSafe = $phpInfo | Select-String "Thread Safety => disabled" -Quiet
$vsVersion = "vs16"
$arch = "x64"
$phpVersion = "8.4"
$xdebugVersion = "3.4.5"

# Set paths
$extDir = php -r "echo ini_get('extension_dir');"
$phpIniDir = php -r "echo php_ini_loaded_file();" | Split-Path -Parent
$herdConfigDir = "C:\Users\lappi\.config\herd-lite\bin"

Write-Host "PHP Extension Dir: $extDir"
Write-Host "PHP INI Dir: $phpIniDir"
Write-Host "Herd Config Dir: $herdConfigDir"

# Download instructions
Write-Host @"

Please follow these steps to install Xdebug:

1. Download Xdebug from:
   https://xdebug.org/files/php_xdebug-$xdebugVersion-$phpVersion-$vsVersion-$arch.dll

2. Save the file as 'php_xdebug.dll' in:
   $extDir

3. Press Enter when done...
"@

Read-Host

# Create Xdebug configuration for both PHP and Herd
$xdebugConfig = @"
[Xdebug]
zend_extension=php_xdebug.dll
xdebug.mode=coverage,debug
xdebug.start_with_request=yes
xdebug.client_port=9003
xdebug.client_host=127.0.0.1
xdebug.output_dir="C:\Users\lappi\Desktop\DEVOPS\azubi\project_two\back-end\coverage"
"@

# Create conf.d directories if they don't exist
$locations = @(
    "$phpIniDir\conf.d",
    "$herdConfigDir\conf.d"
)

foreach ($dir in $locations) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Force -Path $dir | Out-Null
        Write-Host "Created directory: $dir"
    }
    
    $xdebugIni = "$dir\xdebug.ini"
    $xdebugConfig | Out-File -FilePath $xdebugIni -Encoding UTF8 -Force
    Write-Host "Created/Updated Xdebug configuration at: $xdebugIni"
}

Write-Host @"

Installation complete! Please:
1. Restart VS Code and your terminal
2. Verify installation by running: php -v
3. Run tests with coverage: php artisan test --coverage --filter=LoginAPITest
4. View coverage report: start coverage/index.html

"@