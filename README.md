# Excel Analyzer

## Project Overview
Excel Analyzer is a web application that allows users to upload, analyze, and visualize Excel data efficiently. The project consists of a React frontend and provides interactive data visualization and analysis capabilities.

## Features
- Excel file upload and parsing
- Data visualization with charts and graphs
- Interactive data analysis tools
- Real-time data processing
- Responsive user interface

## Tech Stack
- Frontend: React + Vite
- Styling: TailwindCSS
- Charts: Chart.js/React-ChartJS-2
- File Processing: xlsx.js

## Prerequisites
Before running this project, make sure you have the following installed:
- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)
- Git

## Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/excel-analyzer.git
cd excel-analyzer
```

2. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Required Modules
Frontend:
- @vitejs/plugin-react
- react
- react-dom
- chart.js
- react-chartjs-2
- xlsx
- tailwindcss
- @heroicons/react
- axios

## Running the Project

1. Start the Frontend Development Server
```bash
cd frontend
npm run dev
```
The application will be available at `http://localhost:5173`

## Project Structure
```
excel-analyzer/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── assets/
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## Usage
1. Open the application in your web browser
2. Upload an Excel file using the upload button
3. View the analyzed data and visualizations
4. Use the interactive tools to explore your data

## Development
- Use `npm run dev` for development with hot reload
- Use `npm run build` to create production build
- Use `npm run preview` to preview production build locally

## Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Troubleshooting
- If you encounter CORS issues, make sure your browser allows local file access
- For installation issues, try deleting node_modules and package-lock.json, then run npm install again

## License
This project is licensed under the MIT License - see the LICENSE file for details

## Contact
Your Name - dhruvwadhwani77277@gmail.com
Project Link: [https://github.com/yourusername/excel-analyzer](https://github.com/yourusername/excel-analyzer)
