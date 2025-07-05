# Contributing to JSONnymous

Thank you for your interest in contributing to JSONnymous! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 16.0+
- Python 3.7+
- Git

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/jsonnymous.git
   cd jsonnymous
   ```

2. **Install dependencies**
   ```bash
   npm run install
   ```

3. **Run in development mode**
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style
- **Python**: Follow PEP 8 guidelines
- **JavaScript**: Use ES6+ features and modern syntax
- **HTML/CSS**: Use semantic HTML and consistent CSS naming
- **Comments**: Write clear, concise comments in English

### File Organization
- **Frontend**: `electron/renderer/` for UI components
- **Backend**: `src/` for Python logic
- **Examples**: `examples/` for sample files
- **Documentation**: `docs/` for project documentation

### Commit Messages
Use conventional commit format:
```
type(scope): description

Examples:
feat(generator): add new data type support
fix(ui): resolve layout issue on small screens
docs(readme): update installation instructions
```

## 🐛 Bug Reports

When reporting bugs, please include:
- **Environment**: OS, Node.js version, Python version
- **Steps to reproduce**: Clear, step-by-step instructions
- **Expected behavior**: What you expected to happen
- **Actual behavior**: What actually happened
- **Screenshots**: If applicable, add screenshots
- **Error messages**: Include full error messages and stack traces

## ✨ Feature Requests

For new features:
- **Use case**: Describe the problem this feature solves
- **Proposed solution**: How you envision the feature working
- **Alternatives**: Other solutions you've considered
- **Implementation**: If you have ideas about implementation

## 🔧 Pull Request Process

### Before Submitting
1. **Test your changes**: Ensure all functionality works
2. **Update documentation**: Update README, comments, etc.
3. **Check code style**: Follow project conventions
4. **Run existing tests**: Ensure no regressions

### PR Guidelines
- **Clear title**: Summarize the changes
- **Detailed description**: Explain what and why
- **Link issues**: Reference related issues
- **Screenshots**: Include before/after screenshots for UI changes
- **Testing**: Describe how you tested the changes

### Review Process
1. **Automated checks**: CI/CD pipeline must pass
2. **Code review**: At least one maintainer review
3. **Testing**: Manual testing by reviewers
4. **Merge**: Squash and merge after approval

## 🧪 Testing

### Manual Testing
- Test on multiple operating systems
- Verify both file input and direct content input
- Test data generation with various skeleton formats
- Verify anonymization functionality
- Check error handling and edge cases

### Test Cases
Create test cases for:
- Valid and invalid JSON skeletons
- Swagger/OpenAPI integration
- Data anonymization scenarios
- File operations (save, load, copy)
- Error conditions

## 📚 Documentation

### Code Documentation
- **Functions**: Document purpose, parameters, return values
- **Classes**: Describe responsibility and usage
- **Modules**: Explain module purpose and exports
- **Complex logic**: Add inline comments for clarity

### User Documentation
- **README**: Keep installation and usage instructions current
- **Examples**: Provide realistic, working examples
- **Screenshots**: Update screenshots when UI changes
- **Troubleshooting**: Add common issues and solutions

## 🎨 UI/UX Guidelines

### Design Principles
- **Consistency**: Follow existing design patterns
- **Accessibility**: Ensure keyboard navigation and screen reader support
- **Responsiveness**: Support different window sizes
- **Dark theme**: Maintain dark theme compatibility

### Component Guidelines
- **Reusability**: Create reusable components
- **Semantic HTML**: Use appropriate HTML elements
- **CSS organization**: Follow BEM or similar methodology
- **Performance**: Optimize for smooth interactions

## 🔒 Security

### Security Considerations
- **Input validation**: Validate all user inputs
- **File operations**: Secure file handling
- **Data privacy**: Protect sensitive information
- **Dependencies**: Keep dependencies updated

### Reporting Security Issues
Please report security vulnerabilities privately to:
- Email: security@jsonnymous.com
- Do not create public issues for security vulnerabilities

## 🌍 Internationalization

### Language Support
- **Primary language**: English
- **Code comments**: English only
- **User interface**: English (future i18n support planned)
- **Documentation**: English

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: Questions and general discussion
- **Email**: contribute@jsonnymous.com

### Before Asking for Help
1. **Search existing issues**: Check if your question was already answered
2. **Read documentation**: Review README and other docs
3. **Try debugging**: Attempt to solve the issue yourself
4. **Provide context**: Include relevant information when asking

## 🏆 Recognition

Contributors are recognized in:
- **README**: Contributors section
- **Release notes**: Major contributions highlighted
- **GitHub**: Contributor statistics and badges

## 📄 License

By contributing to JSONnymous, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to JSONnymous! Your help makes this project better for everyone. 🙏 