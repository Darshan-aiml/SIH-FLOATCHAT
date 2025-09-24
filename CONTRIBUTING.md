# Contributing to ARGO Ocean Data Assistant

Thank you for your interest in contributing to the ARGO Ocean Data Assistant! This document provides guidelines and information for contributors.

## 🌊 Project Overview

The ARGO Ocean Data Assistant is an AI-powered web application for exploring oceanographic data through natural language queries and interactive visualizations. We welcome contributions that enhance the user experience, add new features, or improve the codebase.

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Basic knowledge of HTML, CSS, and JavaScript
- Familiarity with oceanographic concepts (helpful but not required)

### Development Setup

1. **Fork the repository**
   ```bash
   git clone https://github.com/yourusername/argo-ocean-assistant.git
   cd argo-ocean-assistant
   ```

2. **Start local development server**
   ```bash
   # Using Python 3
   python3 -m http.server 8000
   
   # Using Node.js
   npx serve . -p 8000
   ```

3. **Open in browser**
   Navigate to `http://localhost:8000`

## 📋 How to Contribute

### Reporting Issues
- Use the [GitHub Issues](https://github.com/yourusername/argo-ocean-assistant/issues) page
- Provide clear description of the problem
- Include steps to reproduce the issue
- Add screenshots if applicable
- Specify browser and operating system

### Suggesting Features
- Open a new issue with the "enhancement" label
- Describe the feature and its benefits
- Provide mockups or examples if possible
- Discuss implementation approach

### Code Contributions

#### Branch Naming Convention
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `refactor/description` - Code refactoring

#### Pull Request Process
1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Follow existing code style and conventions
   - Add comments for complex logic
   - Test your changes thoroughly

3. **Commit your changes**
   ```bash
   git add .
   git commit -m "Add: descriptive commit message"
   ```

4. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create Pull Request**
   - Provide clear title and description
   - Reference related issues
   - Include screenshots for UI changes

## 🎯 Areas for Contribution

### High Priority
- **Real ARGO Data Integration**: Connect to live GDAC APIs
- **Performance Optimization**: Improve loading times and responsiveness
- **Mobile Responsiveness**: Enhance mobile user experience
- **Accessibility**: Add ARIA labels and keyboard navigation
- **Testing**: Add unit tests and integration tests

### Medium Priority
- **New Visualizations**: Additional chart types and analysis tools
- **Enhanced AI Responses**: More sophisticated natural language processing
- **Data Export**: CSV, JSON, and NetCDF export capabilities
- **User Preferences**: Save settings and conversation history
- **Internationalization**: Multi-language support

### Low Priority
- **Themes**: Dark mode and custom color schemes
- **Advanced Filters**: Date ranges and parameter filtering
- **Social Features**: Share reports and visualizations
- **Documentation**: Tutorials and user guides

## 💻 Code Style Guidelines

### JavaScript
- Use ES6+ features (const/let, arrow functions, template literals)
- Follow camelCase naming convention
- Add JSDoc comments for functions
- Keep functions small and focused
- Use meaningful variable names

```javascript
/**
 * Generate realistic temperature based on latitude
 * @param {number} lat - Latitude coordinate
 * @returns {number} Temperature in Celsius
 */
getRealisticTemperature(lat) {
    const baseTemp = 28 - Math.abs(lat) * 0.4;
    return Math.max(2, baseTemp + (Math.random() - 0.5) * 4);
}
```

### CSS
- Use Tailwind CSS classes when possible
- Follow BEM methodology for custom CSS
- Use CSS custom properties for theming
- Ensure responsive design principles

```css
/* Custom component styles */
.chart-container {
    @apply bg-white rounded-xl shadow-lg border border-slate-200;
}

/* Custom properties for theming */
:root {
    --ocean-blue: #0ea5e9;
    --ocean-teal: #14b8a6;
}
```

### HTML
- Use semantic HTML5 elements
- Add proper ARIA labels for accessibility
- Include alt text for images
- Use meaningful class names

```html
<section class="report-section" aria-labelledby="insights-heading">
    <h2 id="insights-heading" class="section-title">
        <i class="fas fa-lightbulb" aria-hidden="true"></i>
        Key Insights
    </h2>
    <!-- Content -->
</section>
```

## 🧪 Testing Guidelines

### Manual Testing
- Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- Verify responsive design on different screen sizes
- Check accessibility with screen readers
- Test all interactive features

### Automated Testing (Future)
- Unit tests for utility functions
- Integration tests for API calls
- End-to-end tests for user workflows

## 📚 Documentation

### Code Documentation
- Add JSDoc comments for all functions
- Include parameter types and return values
- Provide usage examples for complex functions

### User Documentation
- Update README.md for new features
- Add inline help text for UI elements
- Create tutorials for complex workflows

## 🔍 Review Process

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Changes are well-documented
- [ ] No console errors or warnings
- [ ] Responsive design maintained
- [ ] Accessibility considerations addressed
- [ ] Performance impact assessed

### Review Timeline
- Initial review within 48 hours
- Follow-up reviews within 24 hours
- Merge after approval from maintainers

## 🌟 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes for significant contributions
- GitHub contributors page

## 📞 Getting Help

### Communication Channels
- **GitHub Issues**: Technical questions and bug reports
- **GitHub Discussions**: General questions and feature discussions
- **Code Comments**: Inline questions and suggestions

### Maintainer Response Time
- Issues: Within 48 hours
- Pull Requests: Within 24 hours
- Discussions: Within 72 hours

## 🎉 First-Time Contributors

Welcome! Here are some good first issues to get started:
- Fix typos in documentation
- Add new suggestion buttons for chat interface
- Improve error messages
- Add new oceanographic parameter descriptions
- Enhance CSS animations

Look for issues labeled `good-first-issue` or `help-wanted`.

## 📋 Commit Message Guidelines

Use conventional commit format:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation updates
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Maintenance tasks

Examples:
```
feat: add dissolved oxygen visualization
fix: resolve float positioning on land masses
docs: update installation instructions
style: improve responsive design for mobile
```

## 🚫 What Not to Contribute

- Copyrighted content without permission
- Large binary files (images, videos)
- Breaking changes without discussion
- Code that doesn't follow project standards
- Features that conflict with project goals

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to the ARGO Ocean Data Assistant! Together, we're making oceanographic data more accessible and interactive for researchers, students, and ocean enthusiasts worldwide. 🌊