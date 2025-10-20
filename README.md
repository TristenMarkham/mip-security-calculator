\# MIP Security Services Calculator



A professional pricing calculator for security services, built for Markham Investigation \& Protection LLC. This tool streamlines quote generation for guard services and patrol routes with advanced features including volume discounts, W-9 contractor rates, and real-time cost visualization.



!\[MIP Calculator Demo](https://img.shields.io/badge/Status-Production-success)

!\[License](https://img.shields.io/badge/License-MIT-blue)



\## 🚀 Live Demo



\[View Live Calculator](https://tristenmarkham.github.io/mip-security-calculator/)



\## 📋 Features



\### Guard Services Calculator

\- \*\*Multiple Service Types\*\*: Unarmed, Armed, Armed with Long Arm, Executive Protection

\- \*\*Flexible Staffing\*\*: W-9 contractor vs internal guard calculations

\- \*\*Cost Components\*\*: 

&nbsp; - Labor costs with configurable expense factors

&nbsp; - Travel time billing options

&nbsp; - Security vehicle add-ons

&nbsp; - Volume discounts (0.5% per 40 hours after 100 hours/week)

\- \*\*Profit Controls\*\*: Adjustable profit margins with visual warnings

\- \*\*Real-time Visualization\*\*: Interactive pie charts for cost and service breakdowns



\### Patrol Services Calculator

\- \*\*Stop-based Pricing\*\*: Calculate costs per patrol stop

\- \*\*Time Optimization\*\*: Automatic calculation of travel time, stop time, and premiums

\- \*\*Volume Discounts\*\*: Stair-stepping discounts for routes with 4+ stops

\- \*\*Premium Billing\*\*: Extra time beyond standard stops billed at 30% premium

\- \*\*Visual Analytics\*\*: Time allocation and cost breakdown charts



\## 🛠️ Technologies Used



\- \*\*Frontend\*\*: React 18 (CDN)

\- \*\*Styling\*\*: Tailwind CSS + Custom Dark Theme

\- \*\*Charts\*\*: Chart.js

\- \*\*Icons\*\*: Lucide React



\## 📦 Installation



\### Quick Start (No Build Required)



1\. Clone the repository:

```bash

git clone https://github.com/TristenMarkham/mip-security-calculator.git

cd mip-security-calculator

```



2\. Open `index.html` in your browser or use a local server:

```bash

\# Using Python

python -m http.server 8000



\# Using Node.js

npx http-server

```



3\. Navigate to `http://localhost:8000`



\### GitHub Pages Deployment



This calculator is designed to work directly from GitHub Pages with no build step required.



\## 💼 Business Use Case



Built for \*\*Markham Investigation \& Protection LLC\*\* ($5.6M annual revenue), this calculator addresses real operational needs:



\- \*\*Standardized Pricing\*\*: Consistent quote generation across sales team

\- \*\*Profit Protection\*\*: Visual warnings when margins fall below targets

\- \*\*Client Flexibility\*\*: Toggle between internal view (with costs) and client view

\- \*\*Contractor Management\*\*: Separate rate structures for W-9 contractors

\- \*\*Volume Incentives\*\*: Automatic discount calculations for large contracts



\## 🎯 Key Calculations



\### Guard Services

\- Base Rate × (1 + Expense Factor) = Loaded Labor Rate

\- Total Cost = (Labor + Vehicle + Travel) × (1 + Profit Margin)

\- Volume Discount = 0.5% per 40 hours beyond first 100 hours/week



\### Patrol Services

\- Standard Stop Time: 15 minutes (included in base rate)

\- Extra Time: Billed at 30% premium

\- Volume Discount: 1% per stop beyond 3 stops (max 10%)



\## 📊 Screenshots



\### Guard Calculator

\- Service type selection with real-time pricing

\- W-9 contractor toggle

\- Interactive profit margin slider

\- Cost breakdown visualization



\### Patrol Calculator

\- Multi-stop route pricing

\- Time allocation charts

\- Premium billing for extended stops



\## 🔒 Data Privacy



All calculations are performed client-side. No data is transmitted or stored externally.



\## 🤝 Contributing



While this is a proprietary business tool, suggestions for improvements are welcome:



1\. Fork the repository

2\. Create your feature branch (`git checkout -b feature/AmazingFeature`)

3\. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4\. Push to the branch (`git push origin feature/AmazingFeature`)

5\. Open a Pull Request



\## 📝 License



This project is licensed under the MIT License - see the \[LICENSE](LICENSE) file for details.



\## 👤 Author



\*\*Tristen Markham\*\*

\- Company: Markham Investigation \& Protection LLC

\- GitHub: \[@TristenMarkham](https://github.com/TristenMarkham)

\- Tech Company: Aetheris Technologies



\## 🎓 Portfolio Note



This calculator demonstrates:

\- React state management and component architecture

\- Complex business logic implementation

\- Real-time data visualization with Chart.js

\- Responsive design with Tailwind CSS

\- Production-ready code for actual business operations



Built to solve real business problems while generating $5.6M+ in annual revenue.



\## 📈 Future Enhancements



\- \[ ] Export quotes to PDF

\- \[ ] Save/load quote templates

\- \[ ] Email quote generation

\- \[ ] Integration with scheduling software

\- \[ ] Historical pricing analytics

\- \[ ] Mobile app version



\## 🐛 Known Issues



None currently reported. Please open an issue for any bugs found.



\## 💡 Acknowledgments



\- Built for operational use at Markham Investigation \& Protection LLC

\- Designed based on real contract pricing requirements from clients including Kiewit and Mass Electric

\- Chart.js for excellent visualization capabilities

\- Tailwind CSS for rapid UI development

