# Security Policy

## 🔒 Supported Versions

We actively maintain and provide security updates for the following versions of Writr:

| Version | Supported          | PHP Requirement | Laravel Support |
| ------- | ------------------ | --------------- | --------------- |
| 1.1.x   | ✅ Yes             | 8.1+           | 10.x, 11.x, 12.x |
| 1.0.x   | ✅ Yes             | 8.1+           | 10.x, 11.x, 12.x |
| < 1.0   | ❌ No              | -              | -               |

## 🚨 Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in Writr, please follow responsible disclosure:

### 🔐 Private Reporting (Preferred)

**For security vulnerabilities, please DO NOT open a public GitHub issue.**

Instead, please report security vulnerabilities via:

1. **GitHub Security Advisories** (Preferred)
   - Go to: https://github.com/rafaelogic/writr/security/advisories
   - Click "Report a vulnerability"
   - Provide detailed information about the vulnerability

2. **Email** (Alternative)
   - Send to: security@writr.dev
   - Include "SECURITY" in the subject line
   - Provide detailed information about the vulnerability

### 📋 What to Include

When reporting a vulnerability, please include:

- **Description**: Clear description of the vulnerability
- **Impact**: Potential impact and severity
- **Steps to Reproduce**: Detailed steps to reproduce the issue
- **Affected Versions**: Which versions are affected
- **Environment**: PHP version, Laravel version, etc.
- **Proof of Concept**: Code or screenshots demonstrating the issue
- **Suggested Fix**: If you have ideas for fixing the issue

### 📝 Vulnerability Report Template

```markdown
**Vulnerability Type**: [e.g., XSS, SQL Injection, File Upload, etc.]

**Affected Component**: [e.g., File Upload, Content Processing, etc.]

**Severity**: [Critical/High/Medium/Low]

**Description**:
[Clear description of the vulnerability]

**Impact**:
[What could an attacker accomplish with this vulnerability?]

**Steps to Reproduce**:
1. [First Step]
2. [Second Step]
3. [Third Step]

**Affected Versions**:
[Which versions are vulnerable?]

**Environment**:
- PHP Version: [e.g., 8.1.0]
- Laravel Version: [e.g., 10.48.0]
- Writr Version: [e.g., 1.1.0]

**Proof of Concept**:
[Code, screenshots, or other evidence]

**Suggested Fix**:
[Your suggestions for fixing the issue]
```

## ⏱️ Response Timeline

We are committed to addressing security vulnerabilities promptly:

- **Initial Response**: Within 48 hours
- **Severity Assessment**: Within 1 week
- **Fix Development**: 1-4 weeks (depending on complexity)
- **Release**: As soon as fix is ready and tested
- **Public Disclosure**: After fix is released

## 🛡️ Security Measures

Writr implements several security measures:

### 🔒 Content Security

- **Input Sanitization**: All user content is sanitized
- **XSS Prevention**: HTML content is properly escaped
- **Content Validation**: Strict validation of Editor.js content structure
- **Safe HTML**: Only safe HTML tags and attributes allowed

### 📁 File Upload Security

- **File Type Validation**: Strict file type checking
- **File Size Limits**: Configurable upload size limits
- **Malware Scanning**: Integration points for malware detection
- **Safe Storage**: Files stored outside web root when possible
- **Content-Type Validation**: MIME type verification

### 🌐 Web Security

- **CSRF Protection**: Laravel CSRF token validation
- **Rate Limiting**: Built-in rate limiting for uploads and API calls
- **Authentication**: Integration with Laravel auth system
- **Authorization**: Permission-based access controls

### 🔧 Application Security

- **Dependency Scanning**: Regular dependency vulnerability checks
- **Code Analysis**: Static code analysis for security issues
- **Secure Defaults**: Secure configuration by default
- **Environment Isolation**: Separate dev/test/prod configurations

## 🔍 Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **Secure Configuration**: Review and harden configuration
3. **Access Controls**: Implement proper user permissions
4. **Regular Audits**: Perform regular security audits
5. **Backup Strategy**: Maintain secure backups

### For Developers

1. **Input Validation**: Always validate and sanitize user input
2. **Output Encoding**: Properly encode output for context
3. **Authentication**: Verify user authentication for protected actions
4. **Authorization**: Check user permissions before allowing access
5. **Error Handling**: Don't expose sensitive information in errors

## 🛠️ Secure Configuration

### Recommended Settings

```php
// config/writr.php
return [
    // Restrict file uploads
    'uploads' => [
        'enabled' => true,
        'max_file_size' => 10 * 1024 * 1024, // 10MB
        'allowed_extensions' => [
            'images' => ['jpg', 'jpeg', 'png', 'gif', 'webp'],
            // Remove potentially dangerous types
        ],
        'virus_scan' => true, // If available
        'quarantine_uploads' => true,
    ],
    
    // Content security
    'content' => [
        'allow_raw_html' => false,
        'sanitize_content' => true,
        'allowed_html_tags' => [
            'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'strong', 'em', 'u', 'a', 'ul', 'ol', 'li',
            'blockquote', 'code', 'pre'
        ],
    ],
    
    // Rate limiting
    'rate_limiting' => [
        'uploads' => '10,1', // 10 uploads per minute
        'api_calls' => '60,1', // 60 API calls per minute
    ],
];
```

### Environment Variables

```env
# Secure session configuration
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=strict

# CSRF protection
CSRF_PROTECTION=true

# File upload security
WRITR_VIRUS_SCAN=true
WRITR_QUARANTINE_UPLOADS=true
WRITR_MAX_UPLOAD_SIZE=10485760
```

## 🔄 Security Updates

### Notification Channels

Stay informed about security updates:

- **GitHub Security Advisories**: Automatic notifications for repository watchers
- **GitHub Releases**: Security releases are clearly marked
- **Packagist**: Security releases show up in dependency checkers
- **Email**: Security mailing list (if you've signed up)

### Applying Updates

```bash
# Check for updates
composer outdated rafaelogic/writr

# Update to latest version
composer update rafaelogic/writr

# Verify update
composer show rafaelogic/writr
```

## 🎖️ Security Hall of Fame

We recognize security researchers who help improve Writr's security:

### 2025

- *No reports yet - be the first!*

### How to be Listed

- Report a valid security vulnerability
- Follow responsible disclosure
- Allow public acknowledgment (optional)

## 📚 Additional Resources

### Security Tools

- **Composer Audit**: `composer audit`
- **NPM Audit**: `npm audit`
- **Laravel Security**: [Laravel Security Guidelines](https://laravel.com/docs/security)
- **OWASP**: [Web Application Security](https://owasp.org/)

### Related Documentation

- [Contributing Guidelines](CONTRIBUTING.md)
- [Changelog](CHANGELOG.md)
- [License](LICENSE)

## 🤝 Acknowledgments

We thank the security community for their efforts in making Writr safer:

- **Laravel Security Team**: For framework-level security guidance
- **Editor.js Team**: For secure editor foundation
- **Security Researchers**: For responsible disclosure practices
- **Open Source Community**: For security tools and best practices

---

**Last Updated**: August 14, 2025  
**Security Policy Version**: 1.0
