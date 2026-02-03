# ARGO Ocean Data Assistant 🌊

A modern, AI-powered web application for exploring oceanographic data through natural language queries and interactive visualizations. Built for researchers, students, and ocean data enthusiasts.

![ARGO Ocean Assistant](https://img.shields.io/badge/Status-Active-brightgreen) ![License](https://img.shields.io/badge/License-MIT-blue) ![Version](https://img.shields.io/badge/Version-1.0-orange)

## ✨ Features

### 🤖 AI-Powered Chat Interface
- Natural language queries about ocean data
- Context-aware responses with scientific insights
- Conversation history tracking for report generation
- Suggestion buttons for common oceanographic queries

### 🗺️ Interactive Ocean Mapping
- Real-time ARGO float locations across the Indian Ocean
- 50+ simulated floats with realistic positioning (ocean-only)
- Detailed float information popups with all parameters
- Temperature heatmap visualization

### 📊 Advanced Data Visualizations
- **Temperature Profiles**: Depth vs temperature with thermocline analysis
- **Salinity Trends**: Time series with seasonal variations
- **Dissolved Oxygen**: Oxygen minimum zone profiles
- **Chlorophyll-a**: Primary productivity indicators
- **Nitrate & pH**: Biogeochemical parameters (BGC-ARGO floats)
- **Pressure Data**: Depth-pressure relationships
- **Interactive Heatmaps**: Geographic temperature distribution

### 📋 Comprehensive Report Generation
- **Full-Page Reports**: Professional, print-ready documents
- **PDF Export**: High-quality PDF generation with charts
- **Conversation Analysis**: Complete chat history with insights
- **Data Insights**: AI-generated scientific interpretations
- **Float Network Statistics**: Active/inactive status, regional coverage

### 🎨 Modern Design
- Clean, minimal interface inspired by scientific applications
- Ocean-themed color palette (blues, teals, whites)
- Fully responsive design (desktop, tablet, mobile)
- Smooth animations and professional typography

## 🚀 Quick Start

### Prerequisites
- Modern web browser (Chrome 80+, Firefox 75+, Safari 13+, Edge 80+)
- Local web server (recommended for full functionality)

### Installation & Setup

1. **Clone the repository**
```bash
git clone https://github.com/Darshan-aiml/SIH-FLOATCHAT
cd argo-ocean-assistant
```

2. **Start a local server**
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js
npx serve . -p 8000

# Using PHP
php -S localhost:8000
```

3. **Open in browser**
Navigate to `http://localhost:8000`

### Alternative: Direct File Access
Simply open `index.html` in your browser (some features may be limited)

## 🎯 Usage Guide

### Chat with the AI Assistant
Ask natural language questions about oceanographic data:
- *"Show me temperature heatmap of the Indian Ocean"*
- *"What are the chlorophyll levels in the Arabian Sea?"*
- *"Display dissolved oxygen profiles"*
- *"Where are the BGC-ARGO floats located?"*

### Explore Interactive Maps
- **Click** float markers for detailed information
- **Hover** for quick stats preview
- **Switch** to heatmap view for temperature distribution

### Analyze Data Visualizations
- **Tab Navigation**: Switch between different parameters
- **Interactive Charts**: Zoom, pan, and hover for details
- **Float Selection**: Click map markers to view specific float data

### Generate Professional Reports
1. Have a conversation with the AI about ocean data
2. Click **"Generate Report"** button
3. View full-page report with analysis and insights
4. **Print** or **Download PDF** for sharing

## 🛠️ Technical Architecture

### Frontend Stack
- **HTML5** with semantic structure
- **CSS3** with Tailwind CSS framework
- **Vanilla JavaScript** (ES6+)
- **Leaflet.js** for interactive mapping
- **Plotly.js** for data visualization
- **jsPDF & html2canvas** for report generation

### Project Structure
```
argo-ocean-assistant/
├── index.html              # Main application
├── report.html             # Full-page report interface
├── app.js                  # Core application logic
├── styles.css              # Custom styling
├── README.md               # Documentation
├── .gitignore              # Git ignore rules
└── assets/                 # Static assets (if any)
```

### Data Architecture
- **Mock ARGO Data**: 50 realistic floats with oceanographic parameters
- **Ocean-Only Positioning**: Advanced land avoidance algorithms
- **Regional Coverage**: Arabian Sea, Bay of Bengal, Central/Southern/Western/Eastern Indian Ocean
- **Parameter Simulation**: Temperature, salinity, chlorophyll, oxygen, nitrate, pH

## 📊 Oceanographic Parameters

### Core Parameters (All Floats)
- **Temperature**: Surface to 2000m depth profiles
- **Salinity**: Practical Salinity Units (PSU)
- **Pressure**: Depth-pressure relationships

### Biogeochemical Parameters (BGC-ARGO Floats)
- **Chlorophyll-a**: Primary productivity indicator
- **Dissolved Oxygen**: Ocean biogeochemistry
- **Nitrate**: Nutrient availability
- **pH**: Ocean acidification monitoring

### Data Availability Simulation
- Realistic sensor limitations (not all floats have all sensors)
- BGC-ARGO floats (30% of network) have enhanced capabilities
- "No data available" responses for missing sensors

## 🌍 Geographic Coverage

### Indian Ocean Regions
- **Arabian Sea**: Monsoon-influenced waters
- **Bay of Bengal**: River discharge effects
- **Central Indian Ocean**: Open ocean dynamics
- **Southern Indian Ocean**: Subtropical waters
- **Western Indian Ocean**: Agulhas Current region
- **Eastern Indian Ocean**: Indonesian Throughflow

## 📈 Report Features

### Comprehensive Analysis
- **Executive Summary**: Key findings and statistics
- **Conversation Analysis**: Complete chat history with timestamps
- **Parameter Grid**: Visual overview of analyzed parameters
- **Float Network Status**: Active/inactive statistics
- **Regional Breakdown**: Geographic analysis
- **Data Insights**: AI-generated scientific interpretations
- **Technical Details**: Methodology and data sources

### Export Options
- **Print-Optimized**: Clean printing without navigation elements
- **PDF Generation**: High-quality PDF with embedded charts
- **Professional Layout**: Multi-page document with proper sections

## 🔬 Scientific Applications

### Research Use Cases
- **Oceanographic Education**: Interactive learning tool
- **Data Exploration**: Quick hypothesis testing
- **Presentation Preparation**: Generate reports for meetings
- **Collaborative Analysis**: Share findings with colleagues

### Educational Benefits
- **Visual Learning**: Interactive charts and maps
- **Real-World Data**: Based on actual ARGO float operations
- **Scientific Methodology**: Proper data presentation and analysis

## 🚀 Future Enhancements

### Planned Features
- **Real ARGO Data Integration**: Connect to live GDAC feeds
- **Advanced ML Models**: Predictive oceanographic modeling
- **3D Visualizations**: Ocean depth modeling
- **Mobile App**: Native iOS/Android applications
- **User Accounts**: Save conversations and custom reports
- **Data Export**: CSV/NetCDF download capabilities

### Technical Improvements
- **Backend API**: Node.js/Python server integration
- **Database Storage**: PostgreSQL for historical data
- **Real-time Updates**: WebSocket connections for live data
- **Performance Optimization**: Lazy loading and caching

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Setup
```bash
# Clone your fork
git clone https://github.com/yourusername/argo-ocean-assistant.git

# Create feature branch
git checkout -b feature/your-feature

# Make changes and test locally
python3 -m http.server 8000

# Commit and push
git add .
git commit -m "Your descriptive commit message"
git push origin feature/your-feature
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **ARGO Program**: For providing the inspiration and data structure
- **Global Data Assembly Centers (GDACs)**: For oceanographic data standards
- **Open Source Community**: For the amazing libraries and tools used

## 📞 Support & Contact

- **Issues**: [GitHub Issues](https://github.com/yourusername/argo-ocean-assistant/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/argo-ocean-assistant/discussions)
- **Documentation**: [Wiki](https://github.com/yourusername/argo-ocean-assistant/wiki)

---

**Built with ❤️ for ocean science and data exploration**

*Advancing oceanographic research through interactive data visualization and AI-powered analysis*
