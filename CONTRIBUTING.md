# Contributing to Writr

We love your input! We want to make contributing to Writr as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## 🚀 Development Process

We use GitHub to host code, to track issues and feature requests, as well as accept pull requests.

### Pull Requests

Pull requests are the best way to propose changes to the codebase. We actively welcome your pull requests:

1. **Fork the repo** and create your branch from `main`.
2. **Add tests** if you've added code that should be tested.
3. **Update documentation** if you've changed APIs.
4. **Ensure the test suite passes**.
5. **Make sure your code lints**.
6. **Issue that pull request**!

## 🛠️ Development Setup

### Prerequisites

- **PHP**: 8.1 or higher
- **Node.js**: 16+ 
- **Composer**: Latest version
- **Git**: For version control

### Initial Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/writr.git
   cd writr
   ```

2. **Install PHP Dependencies**
   ```bash
   composer install
   ```

3. **Install Node Dependencies**
   ```bash
   npm install
   ```

4. **Set Up Testing Environment**
   ```bash
   cd tests/TestApp
   composer install
   npm install
   ```

### Development Workflow

1. **Create a Feature Branch**
   ```bash
   git checkout -b feature/amazing-new-feature
   ```

2. **Make Your Changes**
   - Write your code following our coding standards
   - Add tests for new functionality
   - Update documentation as needed

3. **Run Tests**
   ```bash
   # PHP tests
   composer test
   
   # JavaScript tests
   npm test
   
   # Full test suite
   npm run test:all
   ```

4. **Build Assets**
   ```bash
   # Development build
   npm run dev
   
   # Production build
   npm run production
   ```

5. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```

6. **Push and Create PR**
   ```bash
   git push origin feature/amazing-new-feature
   ```

## 📋 Coding Standards

### PHP Code Style

We follow **PSR-12** coding standards. Use Laravel Pint for formatting:

```bash
# Check code style
composer pint -- --test

# Fix code style
composer pint
```

### JavaScript Code Style

We use **ESLint** with a strict configuration:

```bash
# Check JavaScript code
npm run lint

# Fix JavaScript issues
npm run lint:fix
```

### Commit Messages

We use **Conventional Commits** for clear and structured commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools

**Examples:**
```
feat: add auto-save functionality
fix: resolve memory leak in editor cleanup
docs: update installation instructions
style: fix linting issues in WritrService
refactor: extract content validation to separate class
perf: optimize asset loading and bundling
test: add unit tests for content capture
chore: update dependencies to latest versions
```

## 🧪 Testing

### Running Tests

```bash
# All tests
npm run test:all

# PHP tests only
composer test

# JavaScript tests only
npm test

# Tests with coverage
composer test-coverage
npm run test:coverage
```

### Writing Tests

#### PHP Tests (PHPUnit)

```php
<?php

namespace Rafaelogic\Writr\Tests\Unit;

use Rafaelogic\Writr\Services\WritrService;
use Rafaelogic\Writr\Tests\TestCase;

class WritrServiceTest extends TestCase
{
    public function test_can_convert_content_to_html()
    {
        $service = new WritrService();
        $content = [
            'blocks' => [
                [
                    'type' => 'paragraph',
                    'data' => ['text' => 'Hello World']
                ]
            ]
        ];
        
        $html = $service->toHtml($content);
        
        $this->assertStringContainsString('Hello World', $html);
    }
}
```

#### JavaScript Tests (Vitest)

```javascript
import { describe, it, expect } from 'vitest';
import WritrEditor from '../src/js/writr.js';

describe('WritrEditor', () => {
    it('should initialize with default configuration', () => {
        const editor = new WritrEditor({
            holder: 'test-container'
        });
        
        expect(editor).toBeDefined();
        expect(editor.config.holder).toBe('test-container');
    });
});
```

## 📚 Documentation

### Updating Documentation

- **README.md**: Main package documentation
- **CHANGELOG.md**: Version history and changes
- **Code Comments**: Inline documentation for complex logic
- **PHPDoc**: Method and class documentation

### Documentation Standards

- Use clear, concise language
- Include code examples for new features
- Update the changelog for all changes
- Add inline comments for complex logic

## 🐛 Bug Reports

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](https://github.com/rafaelogic/writr/issues).

### Great Bug Reports Include:

- **Summary**: Quick summary of the issue
- **Steps to Reproduce**: Detailed steps to reproduce the bug
- **Expected Behavior**: What you expected to happen
- **Actual Behavior**: What actually happened
- **Environment**: 
  - PHP version
  - Laravel version
  - Browser (if frontend issue)
  - Operating system
- **Additional Context**: Screenshots, error messages, etc.

### Bug Report Template

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
- PHP Version: [e.g. 8.1.0]
- Laravel Version: [e.g. 10.48.0]
- Writr Version: [e.g. 1.1.0]
- Browser: [e.g. Chrome 91.0.4472.124]
- OS: [e.g. macOS 12.0]

**Additional context**
Add any other context about the problem here.
```

## 💡 Feature Requests

We use GitHub issues to track feature requests as well. Request a feature by [opening a new issue](https://github.com/rafaelogic/writr/issues) with the "enhancement" label.

### Great Feature Requests Include:

- **Clear Description**: What you want to happen
- **Use Case**: Why this feature would be useful
- **Implementation Ideas**: Suggestions for how it could work
- **Examples**: Links to similar implementations

## 🏗️ Project Structure

Understanding the project structure helps with contributions:

```
writr/
├── config/                 # Configuration files
├── docs/                   # GitHub Pages demo
├── public/                 # Compiled assets
├── resources/              # Source assets
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript source
│   │   ├── editor/        # Editor modules
│   │   ├── tools/         # Custom tools
│   │   └── utils/         # Utilities
│   ├── sass/              # Sass source
│   └── views/             # Blade templates
├── routes/                 # Package routes
├── src/                    # PHP source code
│   ├── Components/        # Blade components
│   ├── Http/             # Controllers
│   └── Services/         # Service classes
├── tests/                  # Test files
│   ├── Feature/          # Feature tests
│   ├── Unit/             # Unit tests
│   ├── frontend/         # JS tests
│   └── TestApp/          # Test Laravel app
└── vendor/                # Dependencies
```

## 🎯 Areas for Contribution

We welcome contributions in these areas:

### 🔧 Core Features
- New Editor.js tools and blocks
- Enhanced content processing
- Performance optimizations
- Security improvements

### 🎨 UI/UX Enhancements
- Theme system improvements
- Mobile experience enhancements
- Accessibility improvements
- Animation and visual polish

### 🌐 Integrations
- Third-party service integrations
- Additional export formats
- Import from other editors
- Cloud storage integrations

### 📚 Documentation
- Tutorial improvements
- Code examples
- Video guides
- Translation to other languages

### 🧪 Testing
- Test coverage improvements
- Integration test scenarios
- Performance benchmarks
- Browser compatibility testing

### 🔧 Developer Experience
- Build system improvements
- Development tooling
- IDE integrations
- Debugging tools

## 📄 License

By contributing, you agree that your contributions will be licensed under the same MIT License that covers the project.

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

**Positive behavior includes:**
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

**Unacceptable behavior includes:**
- Trolling, insulting/derogatory comments, and personal or political attacks
- Public or private harassment
- Publishing others' private information without explicit permission
- Other conduct which could reasonably be considered inappropriate

### Enforcement

Project maintainers are responsible for clarifying the standards of acceptable behavior and are expected to take appropriate and fair corrective action in response to any instances of unacceptable behavior.

## 🙏 Recognition

Contributors will be recognized in:
- GitHub contributors list
- Release notes for significant contributions
- Special mentions in the README
- Optional listing in CONTRIBUTORS.md

## 📞 Questions?

Feel free to reach out:
- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and community chat
- **Email**: For private inquiries
- **Twitter**: For announcements and updates

Thank you for contributing to Writr! 🎉
