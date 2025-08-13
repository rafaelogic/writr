# Upgrade Guide

This guide helps you upgrade Writr between major and minor versions.

## 📋 Version Compatibility Matrix

| Writr Version | PHP Requirement | Laravel Support | Status |
|---------------|-----------------|-----------------|--------|
| 1.1.x         | 8.1+           | 10.x, 11.x, 12.x | ✅ Current |
| 1.0.x         | 8.1+           | 10.x, 11.x, 12.x | ✅ Supported |
| 0.9.x (Beta)  | 8.1+           | 10.x, 11.x      | ❌ Deprecated |

## 🚀 Upgrading to 1.1.x from 1.0.x

### ✅ No Breaking Changes

Version 1.1.x is **fully backward compatible** with 1.0.x. This is a feature release with enhancements.

### 🆕 New Features in 1.1.x

- **Enhanced Inline Toolbar**: Modern bottom-positioned toolbar
- **Content Capture System**: Automatic form integration
- **Improved Block Editability**: Fixed single-line block issues
- **AJAX Form Integration**: Better form submission handling

### 📦 Update Steps

1. **Update Package**
   ```bash
   composer update rafaelogic/writr
   ```

2. **Clear Cache** (Recommended)
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan view:clear
   ```

3. **Rebuild Assets** (If customized)
   ```bash
   npm install
   npm run production
   ```

4. **Test New Features** (Optional)
   ```blade
   {{-- Test the enhanced inline toolbar --}}
   <x-writr-editor 
       name="content" 
       placeholder="Try the new inline toolbar!"
   />
   ```

### 🔧 Configuration Updates

No configuration changes required, but you can take advantage of new features:

```php
// config/writr.php - New optional settings
return [
    'features' => [
        'enhanced_inline_toolbar' => true, // Default: true
        'content_capture' => [
            'enabled' => true, // Default: true
            'auto_capture' => true,
        ],
    ],
];
```

### 🆘 Migration Issues

If you experience any issues:

1. **Clear all caches**
2. **Republish config** (if heavily customized):
   ```bash
   php artisan vendor:publish --tag=writr-config --force
   ```
3. **Check browser console** for JavaScript errors
4. **Report issues** on GitHub

---

## 🔄 Upgrading to 1.0.x from Beta (0.9.x)

### ⚠️ Breaking Changes

This is a **major upgrade** with breaking changes. Please test thoroughly.

### 🆕 Major Changes in 1.0.x

- **New Blade Component Syntax**: `<x-writr-editor />` instead of custom tags
- **Configuration Structure**: Completely rewritten config system
- **Asset Management**: New self-contained asset system
- **Service Provider**: Enhanced auto-discovery
- **File Upload System**: Completely rewritten
- **Security**: Enhanced validation and sanitization

### 📦 Update Steps

1. **Backup Everything**
   ```bash
   # Backup your database
   php artisan backup:run # or your backup solution
   
   # Backup custom views and config
   cp -r resources/views/vendor/writr resources/views/vendor/writr.backup
   cp config/writr.php config/writr.php.backup
   ```

2. **Update Package**
   ```bash
   composer update rafaelogic/writr
   ```

3. **Republish Everything**
   ```bash
   php artisan vendor:publish --provider="Rafaelogic\Writr\WritrServiceProvider" --force
   ```

4. **Update Blade Templates**

   **Before (0.9.x):**
   ```blade
   @writr([
       'name' => 'content',
       'value' => $content
   ])
   ```

   **After (1.0.x):**
   ```blade
   <x-writr-editor 
       name="content" 
       :value="$content"
   />
   ```

5. **Update Configuration**

   The config structure has changed significantly. Compare your backed-up config with the new structure:

   ```bash
   php artisan vendor:publish --tag=writr-config
   ```

6. **Update Controllers**

   **Before (0.9.x):**
   ```php
   $content = Writr::process($request->input('content'));
   ```

   **After (1.0.x):**
   ```php
   use Rafaelogic\Writr\Services\WritrService;
   
   public function store(Request $request, WritrService $writr)
   {
       $content = $writr->process($request->input('content'));
   }
   ```

7. **Update Routes** (if using custom routes)

   Custom upload routes need to be updated to use the new controller structure.

8. **Clear Everything**
   ```bash
   php artisan cache:clear
   php artisan config:clear
   php artisan view:clear
   composer dump-autoload
   ```

### 🔧 Configuration Migration

#### Old Config (0.9.x)
```php
return [
    'editor_config' => [
        'tools' => ['header', 'paragraph'],
        'settings' => ['autofocus' => true]
    ]
];
```

#### New Config (1.0.x)
```php
return [
    'editor' => [
        'autofocus' => true,
    ],
    'tools' => [
        'header' => ['enabled' => true],
        'paragraph' => ['enabled' => true],
    ]
];
```

### 🔍 Testing Your Upgrade

1. **Create a Test Page**
   ```blade
   {{-- resources/views/test-writr.blade.php --}}
   @extends('layouts.app')
   
   @section('content')
   <form method="POST" action="/test-writr">
       @csrf
       <x-writr-editor name="content" placeholder="Test the upgrade..." />
       <button type="submit">Test Save</button>
   </form>
   @endsection
   ```

2. **Test All Features**
   - Basic text editing
   - File uploads
   - Form submission
   - Content export
   - Dark mode toggle

3. **Check Browser Console**
   - No JavaScript errors
   - Assets loading correctly
   - No 404s for resources

### 🐛 Common Issues After Upgrade

#### Issue: "Class not found" errors
**Solution:**
```bash
composer dump-autoload
php artisan cache:clear
```

#### Issue: CSS/JS not loading
**Solution:**
```bash
php artisan vendor:publish --tag=writr-assets --force
```

#### Issue: Old Blade syntax not working
**Solution:** Update all blade templates to use `<x-writr-editor />` component.

#### Issue: Upload errors
**Solution:** Check file permissions and storage configuration:
```bash
php artisan storage:link
chmod -R 755 storage/
```

---

## 🔧 General Upgrade Best Practices

### Before Upgrading

1. **Read Release Notes**: Always check CHANGELOG.md
2. **Backup Database**: Full database backup
3. **Backup Files**: Custom views, configs, and assets
4. **Test Environment**: Always upgrade staging first
5. **Dependency Check**: Ensure Laravel compatibility

### During Upgrade

1. **Follow Steps**: Complete each step before moving on
2. **Clear Caches**: Clear all Laravel caches after updates
3. **Check Logs**: Monitor Laravel logs for errors
4. **Test Immediately**: Test basic functionality right away

### After Upgrade

1. **Full Testing**: Test all editor functionality
2. **Performance Check**: Monitor page load times
3. **User Testing**: Have users test the editor
4. **Monitor Errors**: Watch for any new error reports

### Upgrade Commands Summary

```bash
# Standard upgrade process
composer update rafaelogic/writr
php artisan cache:clear
php artisan config:clear
php artisan view:clear

# If you have published assets
php artisan vendor:publish --tag=writr-assets --force

# If you have custom configuration
php artisan vendor:publish --tag=writr-config --force

# If you have published views
php artisan vendor:publish --tag=writr-views --force
```

## 🆘 Getting Help

If you encounter issues during upgrade:

### 1. Check Documentation
- [README.md](README.md) - Main documentation
- [CHANGELOG.md](CHANGELOG.md) - Version changes
- [TROUBLESHOOTING.md](TROUBLESHOOTING.md) - Common issues

### 2. Search Issues
- [GitHub Issues](https://github.com/rafaelogic/writr/issues)
- Look for similar upgrade problems

### 3. Ask for Help
- [GitHub Discussions](https://github.com/rafaelogic/writr/discussions)
- Create a new issue with upgrade details

### 4. Include Information
When asking for help, include:
- Current Writr version
- Target Writr version
- PHP version
- Laravel version
- Error messages
- Steps you've tried

## 📞 Support

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and community support
- **Email**: For private inquiries

---

**Last Updated**: August 14, 2025  
**Guide Version**: 1.0
