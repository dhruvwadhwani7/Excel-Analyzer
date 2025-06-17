// src/pages/data/pages.js
const CmsPages = [
    {
        path: "about",
        title: "About Us",
        content: `
  <p>
  Excel Analyzer is an advanced, user-friendly web application that empowers users to gain deep insights from their Excel data without needing complex software or technical skills. With just a few clicks, users can upload their Excel files (.xlsx or .csv formats) directly into the platform and instantly begin exploring rich visualizations generated from their data. Our intuitive dashboard turns raw spreadsheets into beautiful, interactive charts — including bar charts, line graphs, pie charts, scatter plots, and more — enabling faster and more informed decision-making across industries.
  </p><br>
  <p>
  Whether you're a small business owner tracking sales performance, a student managing research data, or a corporate analyst exploring financial metrics, Excel Analyzer makes it easier than ever to uncover patterns, trends, and outliers within your datasets. No coding or formulas required. Simply drag and drop your file, and the platform automatically parses the data, recognizes headers, and builds insightful visual representations based on the structure and type of information detected.
  </p><br>
  <p>
  In addition to visualization, Excel Analyzer includes tools for filtering, sorting, and segmenting data, allowing users to drill down into specific dimensions or time periods. The platform supports multi-sheet files, automatic data type detection, and dynamic chart updates when users interact with filters or legends. All analytics are performed securely in the cloud — we never store your files permanently, and data is deleted immediately after use, ensuring complete privacy and compliance with modern data protection standards.
  </p><br>
  <p>
  Excel Analyzer is perfect for professionals in finance, marketing, operations, education, logistics, and any other field that relies on spreadsheet data. From visualizing monthly budgets and customer behavior to comparing KPIs across departments or tracking inventory performance, our platform transforms traditional Excel analysis into a smart, automated, and visually appealing experience. Spend less time formatting, and more time understanding your data — with Excel Analyzer.
  </p><br>
  `
    },
    {
        path: "features",
        title: "Features",
        content: `
  <p>
  Excel Analyzer offers a comprehensive suite of features designed to help users transform static spreadsheets into meaningful insights in seconds. Whether you're analyzing sales figures, survey results, or financial reports, our platform equips you with the tools to visualize, explore, and understand your data more effectively — all without writing a single formula.
  </p><br>
  <ul>
    <li><strong>Easy Excel Upload:</strong> Upload .xlsx or .csv files with a simple drag-and-drop interface. The system automatically detects headers, data types, and table structures.</li><br>
    <li><strong>Instant Visualizations:</strong> Generate bar charts, line graphs, pie charts, area plots, scatter graphs, and other visual formats with one click — no setup required.</li><br>
    <li><strong>Smart Data Parsing:</strong> Our parser identifies and handles numeric, categorical, and date-based columns intelligently, allowing for accurate analysis and filtering.</li><br>
    <li><strong>Interactive Dashboards:</strong> Hover to view values, apply filters, switch chart types, and explore your data dynamically in a responsive layout.</li><br>
    <li><strong>Multi-Sheet Support:</strong> Upload Excel files with multiple sheets and easily switch between them to analyze separate datasets.</li><br>
    <li><strong>Data Filtering & Sorting:</strong> Focus on relevant segments of your data by filtering by date, category, or value range. Sorting is available directly from the UI.</li><br>
    <li><strong>Chart Customization:</strong> Change labels, colors, groupings, and chart types with just a few clicks to tailor each view to your needs.</li><br>
    <li><strong>Secure & Private:</strong> Uploaded files are processed securely and deleted immediately after your session — we never store your data.</li><br>
    <li><strong>Mobile Friendly:</strong> Built with responsive design so you can view and interact with your data on tablets and smartphones just as easily as on desktop.</li><br>
    <li><strong>No Installation Needed:</strong> 100% web-based — use it from anywhere, on any device, without downloading or installing software.</li><br>
  </ul>

  <p>
  These features make Excel Analyzer ideal for professionals, educators, students, and teams that depend on data to make decisions. Whether you're running weekly reports, academic research, or operational reviews, Excel Analyzer turns raw spreadsheet data into valuable insights — quickly, securely, and beautifully.
  </p>
  `
    },
    {
        path: "pricing",
        title: "Pricing",
        content: `
  <p>
  Excel Analyzer is currently <strong>100% free</strong> for all users.
  </p><br>
  <p>
  We believe in making data analysis accessible to everyone — students, professionals, small businesses, and researchers alike. During this initial launch phase, you can upload your Excel files, explore charts, and use all platform features without any subscription or payment required.
  </p><br>
  <p>
  In the future, we may introduce premium features or team plans, but we are committed to keeping the core functionality available for free. If we do introduce pricing, you'll be notified well in advance with transparent and affordable options.
  </p><br>
  <p>
  Thank you for using Excel Analyzer. Enjoy unlimited insights — on us!
  </p>
  `
    },
    {
        path: "privacy",
        title: "Privacy Policy",
        content: `
  <p>
  At Excel Analyzer, your privacy is a top priority. We are committed to protecting your personal information and ensuring transparency about how your data is handled.
  </p><br>
  <h3>1. Information We Collect</h3>
  <p>
  We may collect basic information such as your name, email address, and login details when you register. When you upload Excel files, the data is processed temporarily for generating charts and insights, and is not stored permanently on our servers.
  </p><br>
  <h3>2. How Your Data Is Used</h3>
  <ul>
    <li>To provide you with analytical charts and insights from your Excel files.</li>
    <li>To improve platform performance and user experience.</li>
    <li>To communicate important updates or support responses.</li>
  </ul><br>

  <h3>3. File Security</h3>
  <p>
  All uploaded files are processed in-memory or temporarily stored for processing only. We do not retain or share your file contents beyond your session. Files are deleted automatically after analysis.
  </p><br>

  <h3>4. Third-Party Services</h3>
  <p>
  We may use third-party tools (such as analytics or email systems) that handle minimal data (e.g., email for notifications). These services comply with data protection standards.
  </p><br>

  <h3>5. Your Control</h3>
  <p>
  You can update or delete your account information at any time. If you'd like to remove your data from our system, simply contact us at <a href="mailto:support@excelanalyzer.com">support@excelanalyzer.com</a>.
  </p><br>

  <h3>6. Updates to This Policy</h3>
  <p>
  We may update this Privacy Policy to reflect improvements or legal changes. We'll notify users of any major updates via email or platform notices.
  </p><br>
  <p>
  By using Excel Analyzer, you agree to this Privacy Policy. If you have any questions, feel free to contact us.
  </p>
  `
    },
    {
        path: "terms",
        title: "Terms of Service",
        content: `
  <p>
  These Terms of Service ("Terms") govern your access to and use of Excel Analyzer ("Service"), operated by our team. By using the Service, you agree to comply with these Terms.
  </p><br>
  <h3>1. Use of the Service</h3>
  <p>
  You agree to use Excel Analyzer only for lawful purposes. You must not upload or analyze content that violates laws, contains sensitive personal information, or infringes on intellectual property rights.
  </p><br>

  <h3>2. User Accounts</h3>
  <p>
  To access certain features, you may need to create an account. You are responsible for maintaining the confidentiality of your login information and for all activity that occurs under your account.
  </p><br>

  <h3>3. Uploaded Files</h3>
  <p>
  Uploaded Excel files are used solely for the purpose of generating charts and insights. We do not retain your files after processing and do not share your data with third parties.
  </p><br>

  <h3>4. Intellectual Property</h3>
  <p>
  All content, branding, and tools provided by Excel Analyzer are owned by us and protected under applicable copyright and intellectual property laws. You may not copy, modify, or redistribute any part of the platform without permission.
  </p><br>

  <h3>5. Availability</h3>
  <p>
  While we strive to keep the Service running smoothly, we may occasionally suspend access for maintenance or updates. We are not responsible for any interruptions or data loss.
  </p><br>

  <h3>6. Termination</h3>
  <p>
  We reserve the right to suspend or terminate your access to the Service at our discretion, especially in the event of misuse, abuse, or violation of these Terms.
  </p><br>

  <h3>7. Limitation of Liability</h3>
  <p>
  Excel Analyzer is provided "as is" without warranties of any kind. We are not liable for any direct or indirect damages arising from your use of the platform.
  </p><br>

  <h3>8. Changes to the Terms</h3>
  <p>
  We may update these Terms from time to time. Continued use of the Service after changes have been posted constitutes your acceptance of the updated Terms.
  </p><br>

  <h3>9. Contact</h3>
  <p>
  For any questions about these Terms, please contact us at <a href="mailto:support@excelanalyzer.com">support@excelanalyzer.com</a>.
  </p><br>
  `
    },
    {
     path: "docs",
  title: "Documentation",
  content: `
    <h2>Getting Started with Excel Analyzer</h2>
    <p>
      Excel Analyzer lets you upload Excel files and automatically generates charts and visual insights. It's designed to help you understand your data quickly and easily — without writing a single line of code.
    </p><br>

    <h3>1. Uploading Your Excel File</h3>
    <ul>
      <li>Go to the <strong>Upload</strong> page after logging in.</li>
      <li>Click on the "Choose File" button and select a valid Excel (.xlsx or .xls) file.</li>
      <li>Click "Upload & Analyze" to generate charts from your file.</li>
    </ul><br>

    <h3>2. Supported Excel Formats</h3>
    <p>
      Excel Analyzer currently supports:
    </p>
    <ul>
      <li>.xlsx and .xls files</li>
      <li>Files under 10MB</li>
      <li>Tabular data with headers in the first row</li>
    </ul><br>

    <h3>3. Interpreting the Charts</h3>
    <p>
      Once uploaded, the system automatically detects numeric columns and creates bar charts, line graphs, and pie charts to help you interpret trends, summaries, and comparisons.
    </p><br>

    <h3>4. Troubleshooting</h3>
    <ul>
      <li>Make sure your Excel file has clear headers in the first row.</li>
      <li>Ensure data is organized in a consistent table format.</li>
      <li>Large files may take a few seconds to process.</li>
    </ul><br>

    <h3>5. FAQs</h3>
    <p>
      <strong>Q: Is my data saved?</strong><br>
      A: No. Uploaded files are processed temporarily and deleted after analysis.
    </p>
    <p>
      <strong>Q: Can I download the charts?</strong><br>
      A: Export features will be added soon — stay tuned!
    </p><br>

    <h3>Need Help?</h3>
    <p>
      Contact us anytime at <a href="mailto:support@excelanalyzer.com">support@excelanalyzer.com</a> for technical assistance or feature suggestions.
    </p>
  `},
  {
  path: "tutorials",
  title: "Tutorials",
  content: `
    <h2>Excel Analyzer Tutorials</h2>
    <p>
      These step-by-step tutorials will help you get started with Excel Analyzer and make the most of its features. Whether you're a first-time user or a data enthusiast, these guides will show you how to explore your Excel files like a pro.
    </p><br>

    <h3>Tutorial 1: Upload Your First Excel File</h3>
    <ol>
      <li>Log in to your Excel Analyzer account.</li>
      <li>Go to the <strong>Upload</strong> page using the navigation bar.</li>
      <li>Click the <em>"Choose File"</em> button and select a valid Excel file (.xlsx or .xls).</li>
      <li>Click <strong>"Upload & Analyze"</strong>. Wait for a few seconds while the file is processed.</li>
      <li>Charts and summaries will be generated automatically based on your data.</li>
    </ol><br>

    <h3>Tutorial 2: Understanding the Charts</h3>
    <ul>
      <li><strong>Bar Charts</strong>: Compare values across different categories.</li>
      <li><strong>Line Charts</strong>: Visualize trends over time.</li>
      <li><strong>Pie Charts</strong>: Show proportional distribution of values.</li>
    </ul>
    <p>
      Hover over the chart elements to see data details. You can also switch between chart types for better clarity.
    </p><br>

    <h3>Tutorial 3: Preparing Excel for Upload</h3>
    <p>
      Make sure your Excel sheet:
    </p>
    <ul>
      <li>Has column headers in the first row (e.g., "Date", "Sales", "Category").</li>
      <li>Does not include merged cells or empty header rows.</li>
      <li>Is under 10MB in size and saved as .xls or .xlsx.</li>
    </ul><br>

    <h3>Tips</h3>
    <ul>
      <li>Use consistent data types in each column (e.g., all numbers or all dates).</li>
      <li>Remove empty rows and columns before uploading.</li>
      <li>Split complex data into separate sheets for better clarity.</li>
    </ul><br>

    <h3>Coming Soon</h3>
    <p>
      We're working on video tutorials and advanced chart customization options. Stay tuned!
    </p><br>

    <p>
      For more help, reach out to <a href="mailto:support@excelanalyzer.com">support@excelanalyzer.com</a>.
    </p>
  `
},
{
  path: "api",
  title: "API Reference",
  content: `
    <h2>API Reference</h2>
    <p>
      Excel Analyzer provides a secure REST API for uploading Excel files and retrieving analysis results. All API requests require a valid authentication token.
    </p><br>

    <h3>Upload File</h3>
    <p><strong>POST /api/upload</strong> — Upload an Excel (.xlsx/.xls) file for analysis.</p>

    <h3>Get User Analytics</h3>
    <p><strong>GET /api/user/analytics</strong> — Retrieve past file analysis results.</p>

    <h3>User Profile</h3>
    <p><strong>GET /api/user/profile</strong> — Get the current user’s details.</p><br>

    <p>
      Include your JWT token in the <code>Authorization</code> header. Need help? Email <a href="mailto:support@excelanalyzer.com">support@excelanalyzer.com</a>.
    </p>
  `
}

];

export default CmsPages;
