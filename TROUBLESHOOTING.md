# Troubleshooting Guide

This guide helps you resolve common issues with Writr Laravel package.

## 📋 Quick Diagnostics

### 🔍 Check Your Setup

Before troubleshooting, verify your setup:

```bash
# Check PHP version
php --version

# Check Laravel version  
php artisan --version

# Check Writr version
composer show rafaelogic/writr

# Check if service provider is loaded
php artisan list | grep writr
```

## 🚨 Common Issues

### 1. ❌ "Class 'Rafaelogic\Writr\WritrServiceProvider' not found"

**Symptoms:**
- Error during `composer install` or `php artisan` commands
- Package not auto-discovered

**Solutions:**

1. **Clear autoload cache:**
   ```bash
   composer dump-autoload
   php artisan cache:clear
   php artisan config:clear
   ```

2. **Verify composer.json:**
   ```bash
   composer validate
   ```

3. **Manually register provider** (if auto-discovery fails):
   ```php
   // config/app.php
   'providers' => [
       // Other providers...
       Rafaelogic\Writr\WritrServiceProvider::class,
   ],
   ```

### 2. ❌ CSS/JS Assets Not Loading

**Symptoms:**
- Editor appears unstyled
- JavaScript errors in browser console
- 404 errors for asset files

**Solutions:**

1. **Publish assets:**
   ```bash
   php artisan vendor:publish --tag=writr-assets
   ```

2. **Check asset paths in HTML:**
   ```html
   <!-- Should be present in page head -->
   <link rel="stylesheet" href="...writr.css">
   <script src="...writr.js"></script>
   ```

3. **Verify file permissions:**
   ```bash
   chmod -R 755 public/vendor/writr/
   ```

4. **Clear view cache:**
   ```bash
   php artisan view:clear
   ```

### 3. ❌ "Call to undefined method"

**Symptoms:**
- Method not found errors when using Writr services
- Missing facade or service binding

**Solutions:**

1. **Use proper service injection:**
   ```php
   // Correct way
   use Rafaelogic\Writr\Services\WritrService;
   
   public function store(Request $request, WritrService $writr)
   {
       $html = $writr->toHtml($content);
   }
   ```

2. **Check service provider registration:**
   ```bash
   php artisan config:cache
   php artisan cache:clear
   ```

### 4. ❌ File Upload Issues

**Symptoms:**
- Upload fails with 413 or 500 errors
- Files not saving to storage
- Permission denied errors

**Solutions:**

1. **Check PHP upload limits:**
   ```php
   // Check current limits
   echo 'upload_max_filesize: ' . ini_get('upload_max_filesize') . "\n";
   echo 'post_max_size: ' . ini_get('post_max_size') . "\n";
   echo 'max_execution_time: ' . ini_get('max_execution_time') . "\n";
   ```

2. **Update PHP configuration:**
   ```ini
   ; php.ini
   upload_max_filesize = 10M
   post_max_size = 10M
   max_execution_time = 300
   ```

3. **Check storage permissions:**
   ```bash
   # Laravel storage
   chmod -R 755 storage/
   php artisan storage:link
   
   # Check disk configuration
   php artisan config:clear
   ```

4. **Verify storage configuration:**
   ```php
   // config/filesystems.php
   'disks' => [
       'public' => [
           'driver' => 'local',
           'root' => storage_path('app/public'),
           'url' => env('APP_URL').'/storage',
           'visibility' => 'public',
       ],
   ],
   ```

### 5. ❌ CSRF Token Mismatch

**Symptoms:**
- 419 errors on form submission
- CSRF token mismatch errors

**Solutions:**

1. **Include CSRF token in layout:**
   ```html
   <meta name="csrf-token" content="{{ csrf_token() }}">
   ```

2. **Verify form structure:**
   ```blade
   <form method="POST" action="/save">
       @csrf
       <x-writr-editor name="content" />
       <button type="submit">Save</button>
   </form>
   ```

3. **Check session configuration:**
   ```php
   // config/session.php
   'same_site' => 'lax', // or 'strict' if having issues
   ```

### 6. ❌ Component Not Rendering

**Symptoms:**
- Blank space where editor should appear
- Component tag showing as plain text

**Solutions:**

1. **Verify component registration:**
   ```bash
   php artisan view:clear
   php artisan config:clear
   ```

2. **Check blade syntax:**
   ```blade
   {{-- Correct --}}
   <x-writr-editor name="content" />
   
   {{-- Incorrect --}}
   @writr(['name' => 'content'])
   ```

3. **Ensure proper layout structure:**
   ```blade
   <!DOCTYPE html>
   <html>
   <head>
       @stack('writr-styles')
   </head>
   <body>
       <!-- Your content with editor -->
       @stack('writr-scripts')
   </body>
   </html>
   ```

## 🔧 Browser-Specific Issues

### Chrome Issues

**Issue: Content not saving in Chrome**
- Clear browser cache and cookies
- Disable browser extensions temporarily
- Check for Content Security Policy conflicts

**Issue: Upload problems in Chrome**
- Check for adblockers blocking uploads
- Verify HTTPS if using secure cookies

### Firefox Issues

**Issue: Editor toolbar not appearing**
- Check for tracking protection interference
- Disable strict privacy settings temporarily

### Safari Issues

**Issue: Touch events not working on iPad**
- Ensure touch-action CSS is not interfering
- Check for iOS version compatibility

## 🐛 JavaScript Errors

### Common Console Errors

**Error: "WritrEditor is not defined"**
```javascript
// Solution: Ensure scripts are loaded in correct order
// 1. First: writr.js or writr.min.js
// 2. Then: your initialization code
```

**Error: "Cannot read property 'blocks' of undefined"**
```javascript
// Solution: Ensure content is valid JSON
const content = {
    blocks: [],
    version: "2.24.3"
};
```

**Error: "Failed to fetch"**
```javascript
// Solution: Check CORS and API endpoints
// Verify upload URLs are correct and accessible
```

### Debug JavaScript Issues

1. **Enable debug mode:**
   ```javascript
   const editor = new WritrEditor({
       holder: 'editor',
       logLevel: 'VERBOSE', // Enable detailed logging
       onReady: () => console.log('Editor ready'),
       onChange: (data) => console.log('Content changed', data)
   });
   ```

2. **Check browser network tab:**
   - Look for failed API requests
   - Verify CSRF tokens are sent
   - Check response status codes

## 📱 Mobile Issues

### Touch Interface Problems

**Issue: Toolbar not appearing on mobile**
- Check viewport meta tag
- Verify touch event handling
- Test on actual devices, not just browser dev tools

**Issue: Upload not working on mobile**
- Check file input limitations on mobile browsers
- Verify drag-and-drop fallbacks work

## ⚡ Performance Issues

### Slow Loading

1. **Check asset sizes:**
   ```bash
   # Check compiled asset sizes
   ls -la public/vendor/writr/
   ```

2. **Enable production mode:**
   ```bash
   npm run production
   ```

3. **Optimize configuration:**
   ```php
   // config/writr.php
   'performance' => [
       'lazy_load_tools' => true,
       'cache_assets' => true,
       'minify_output' => true,
   ],
   ```

### Memory Issues

**Large documents causing slowdowns:**
```php
// config/writr.php
'features' => [
    'auto_save' => [
        'enabled' => true,
        'interval' => 60000, // Increase interval
        'debounce' => 2000,  // Increase debounce
    ],
],
```

## 🔍 Debug Mode

### Enable Detailed Logging

1. **PHP Debug:**
   ```php
   // In your controller
   Log::debug('Writr content received', ['content' => $request->content]);
   ```

2. **JavaScript Debug:**
   ```javascript
   localStorage.setItem('writr-debug', 'true');
   // Reload page to see detailed console logs
   ```

3. **Laravel Debug:**
   ```env
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```

## 🛠️ Diagnostic Commands

### Health Check Script

```bash
#!/bin/bash
echo "=== Writr Health Check ==="

echo "PHP Version:"
php --version

echo "Laravel Version:"
php artisan --version

echo "Writr Version:"
composer show rafaelogic/writr

echo "Storage Permissions:"
ls -la storage/

echo "Config Cache Status:"
php artisan config:cache

echo "View Cache Status:"  
php artisan view:clear

echo "Service Providers:"
php artisan list | grep -i writr

echo "Published Assets:"
ls -la public/vendor/writr/ 2>/dev/null || echo "No published assets"

echo "=== Health Check Complete ==="
```

## 📞 Getting Help

### Before Reporting Issues

1. **Check this troubleshooting guide**
2. **Search existing issues**: [GitHub Issues](https://github.com/rafaelogic/writr/issues)
3. **Try latest version**: `composer update rafaelogic/writr`
4. **Clear all caches**: Run all cache clear commands

### When Reporting Issues

Include this information:

```markdown
**Environment:**
- PHP Version: [php --version]
- Laravel Version: [php artisan --version]  
- Writr Version: [composer show rafaelogic/writr]
- Browser: [Chrome 91.0.4472.124]
- OS: [macOS 12.0]

**Issue Description:**
[Clear description of the problem]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [Third step]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Error Messages:**
[Any error messages from logs or console]

**Additional Context:**
[Screenshots, configuration files, etc.]
```

### Support Channels

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community support
- **Documentation**: Check README.md and other guides

## 🔧 Quick Fixes Checklist

When experiencing issues, try these steps in order:

```bash
# 1. Clear all caches
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# 2. Refresh autoload
composer dump-autoload

# 3. Republish assets (if needed)
php artisan vendor:publish --tag=writr-assets --force

# 4. Check file permissions
chmod -R 755 storage/
chmod -R 755 public/vendor/writr/

# 5. Restart web server
# (Method depends on your setup)
```

---

**Last Updated**: August 14, 2025  
**Guide Version**: 1.0
