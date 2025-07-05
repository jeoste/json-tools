# 🚀 JSONnymous - JSON Data Generator & Anonymizer

> A modern desktop application for generating realistic test data and anonymizing sensitive information in JSON format.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-16.0+-green.svg)](https://nodejs.org)
[![Python](https://img.shields.io/badge/Python-3.7+-blue.svg)](https://python.org)
[![Electron](https://img.shields.io/badge/Electron-Desktop-lightgrey.svg)](https://electronjs.org)

## 📸 Screenshots

### Main Interface - Data Generation
![Main Interface](screenshots/main-interface.png)
*Modern dark theme interface with sidebar navigation and real-time preview*

### Data Generation in Action
![Data Generation](screenshots/data-generation.png)
*Generate realistic test data from JSON skeleton with Swagger/OpenAPI constraints*

### Data Anonymization
![Data Anonymization](screenshots/data-anonymization.png)
*Anonymize sensitive data while preserving structure and relationships*

### Configuration Panel
![Configuration](screenshots/configuration.png)
*Intuitive configuration with file upload and direct content editing*

### Generated Data Preview
![Preview](screenshots/preview.png)
*Real-time preview with syntax highlighting and formatting options*

## ✨ Features

### 🎯 Core Functionality
- **Smart Data Generation**: Create realistic test data using Faker.js
- **JSON Skeleton Support**: Define data structure with JSON templates
- **Swagger/OpenAPI Integration**: Apply API constraints and validation rules
- **Data Anonymization**: Protect sensitive information while preserving data utility
- **Real-time Preview**: See generated data instantly with syntax highlighting

### 🎨 User Experience
- **Modern Interface**: Clean, dark theme with intuitive navigation
- **Dual Input Methods**: File upload or direct content editing
- **Export Options**: Save to file or copy to clipboard
- **Format & Validate**: Automatic JSON formatting and validation
- **Status Indicators**: Real-time feedback on operations

### 🔧 Technical Features
- **Cross-platform**: Works on Windows, macOS, and Linux
- **Offline Capable**: No internet connection required
- **Fast Processing**: Efficient data generation and anonymization
- **Extensible**: Modular architecture for easy customization

## 🛠️ Installation

### Prerequisites
- **Node.js 16.0+** - [Download here](https://nodejs.org)
- **Python 3.7+** - [Download here](https://python.org)

### Quick Start
1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/jsonnymous.git
   cd jsonnymous
   ```

2. **Install dependencies**
   ```bash
   npm run install
   ```

3. **Launch the application**
   ```bash
   npm start
   ```

## 📖 Usage Guide

### 1. Data Generation
1. **Select Input Method**: Choose between file upload or direct content editing
2. **Provide JSON Skeleton**: Define your data structure template
3. **Add Swagger (Optional)**: Include API constraints for validation
4. **Generate Data**: Click "Generate Data" to create realistic test data
5. **Export Results**: Save to file or copy to clipboard

### 2. Data Anonymization
1. **Load Source Data**: Upload JSON file or paste content directly
2. **Configure Anonymization**: Select fields and anonymization methods
3. **Preview Changes**: Review anonymized data before saving
4. **Export Anonymized Data**: Save secure version of your data

### 3. Advanced Features
- **Batch Processing**: Generate multiple datasets at once
- **Custom Patterns**: Define custom data generation patterns
- **Validation Rules**: Apply complex validation constraints
- **Data Relationships**: Maintain referential integrity

## 📁 Project Structure

```
jsonnymous/
├── electron/                 # Electron app files
│   ├── main.js              # Main process
│   ├── renderer/            # Renderer process
│   │   ├── index.html       # UI structure
│   │   ├── renderer.js      # UI logic
│   │   └── styles.css       # Styling
│   └── package.json         # Electron dependencies
├── src/                     # Python backend
│   ├── data_generator.py    # Data generation logic
│   ├── data_anonymizer.py   # Anonymization engine
│   ├── json_processor.py    # JSON processing utilities
│   └── cli_generate.py      # CLI interface
├── examples/                # Sample files
├── docs/                    # Documentation
└── screenshots/             # Application screenshots
```

## 🚀 Development

### Available Scripts
```bash
npm start          # Launch the application
npm run dev        # Development mode with hot reload
npm run build      # Build for production
npm run build-win  # Build for Windows
npm run dist       # Create distribution package
```

### Development Setup
1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Run tests** (if available)
5. **Submit a pull request**

## 🎨 Examples

### Basic JSON Skeleton
```json
{
  "users": [
    {
      "id": "{{faker.random.uuid}}",
      "name": "{{faker.name.fullName}}",
      "email": "{{faker.internet.email}}",
      "age": "{{faker.random.number(18, 80)}}",
      "address": {
        "street": "{{faker.address.streetAddress}}",
        "city": "{{faker.address.city}}",
        "country": "{{faker.address.country}}"
      }
    }
  ]
}
```

### Swagger Integration
```yaml
openapi: 3.0.0
info:
  title: User API
  version: 1.0.0
paths:
  /users:
    get:
      responses:
        '200':
          description: List of users
          content:
            application/json:
              schema:
                type: object
                properties:
                  users:
                    type: array
                    items:
                      $ref: '#/components/schemas/User'
```

## 🔧 Troubleshooting

### Common Issues

**"Python not found"**
- Install Python from https://python.org
- Ensure "Add Python to PATH" is checked during installation
- Restart your computer after installation

**"npm command not found"**
- Install Node.js from https://nodejs.org
- Restart your terminal/command prompt
- Verify installation with `node --version`

**Application won't start**
- Check that all dependencies are installed: `npm run install`
- Verify Python and Node.js versions meet requirements
- Check the console for error messages

### Performance Tips
- Use smaller datasets for initial testing
- Enable hardware acceleration in settings
- Close other resource-intensive applications

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines
- Follow existing code style and conventions
- Add tests for new features
- Update documentation as needed
- Ensure cross-platform compatibility

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Faker.js** for realistic data generation
- **Electron** for cross-platform desktop capabilities
- **OpenAPI** specification for API constraints
- **Acreom** for design inspiration

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/your-username/jsonnymous/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/jsonnymous/discussions)
- **Email**: support@jsonnymous.com

---

**Made with ❤️ by the JSONnymous Team**

*Transform your data workflow with intelligent generation and anonymization* 