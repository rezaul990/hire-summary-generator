import React from 'react';
import './LegalPages.css';

function TermsOfService() {
  return (
    <div className="legal-page">
      <section className="legal-hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="legal-date">Last Updated: June 2, 2026</p>
        </div>
      </section>

      <section className="legal-content">
        <div className="container">
          <div className="legal-section">
            <h2>1. Acceptance of Terms</h2>
            <p>
              Welcome to Smart Collection Analytics Platform. By accessing or using our platform, you agree to be 
              bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use 
              our platform. We reserve the right to modify these Terms at any time, and your continued use 
              constitutes acceptance of any changes.
            </p>
          </div>

          <div className="legal-section">
            <h2>2. Description of Service</h2>
            <p>
              Smart Collection Analytics Platform is a data analytics and reporting tool that processes Excel 
              collection reports to generate comprehensive summaries, statistics, and insights. Our services include:
            </p>
            <ul>
              <li>Excel file processing and data analysis</li>
              <li>Division, area, and plaza-level reporting</li>
              <li>Collection target tracking and achievement metrics</li>
              <li>Overdue statistics and trend analysis</li>
              <li>Automated Telegram notifications</li>
              <li>Report sharing and export capabilities</li>
              <li>Personalized area-based dashboards</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>3. User Registration and Accounts</h2>
            <h3>3.1 Account Creation</h3>
            <p>
              To use our platform, you must create an account using Google OAuth authentication. By creating 
              an account, you represent that:
            </p>
            <ul>
              <li>You are at least 18 years of age</li>
              <li>You have the authority to enter into this agreement</li>
              <li>All information you provide is accurate and current</li>
              <li>You will maintain the security of your account credentials</li>
            </ul>

            <h3>3.2 Area Selection</h3>
            <p>
              During registration, you must select your assigned area. This selection determines your data access 
              permissions. You are responsible for selecting the correct area and may not access data outside 
              your authorized scope.
            </p>

            <h3>3.3 Account Security</h3>
            <p>
              You are responsible for maintaining the confidentiality of your account. You agree to notify us 
              immediately of any unauthorized access or security breach.
            </p>
          </div>

          <div className="legal-section">
            <h2>4. Acceptable Use Policy</h2>
            <p>You agree to use the platform only for lawful purposes. You must not:</p>
            <ul>
              <li>Upload malicious files or code that could harm the platform</li>
              <li>Attempt to access data or areas you are not authorized to view</li>
              <li>Reverse engineer, decompile, or disassemble any part of the platform</li>
              <li>Use automated systems to scrape or extract data without permission</li>
              <li>Share your account credentials with unauthorized individuals</li>
              <li>Upload files containing false, misleading, or fraudulent information</li>
              <li>Interfere with or disrupt the platform's operation or servers</li>
              <li>Use the platform for any commercial purpose without authorization</li>
              <li>Violate any applicable local, national, or international law</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>5. Data Upload and Processing</h2>
            <h3>5.1 File Requirements</h3>
            <p>Uploaded Excel files must:</p>
            <ul>
              <li>Be in .xls or .xlsx format</li>
              <li>Not exceed 10MB in size</li>
              <li>Contain properly formatted collection report data</li>
              <li>Include required columns (Division, Area, Plaza, Collection metrics)</li>
            </ul>

            <h3>5.2 Data Ownership</h3>
            <p>
              You retain ownership of all data you upload to the platform. By uploading data, you grant us a 
              license to process, store, and display the data as necessary to provide our services.
            </p>

            <h3>5.3 Data Accuracy</h3>
            <p>
              You are responsible for the accuracy of uploaded data. We provide analytics based on the data 
              you provide but do not verify its accuracy or completeness.
            </p>
          </div>

          <div className="legal-section">
            <h2>6. Intellectual Property Rights</h2>
            <h3>6.1 Platform Ownership</h3>
            <p>
              The platform, including its code, design, graphics, functionality, and all related intellectual 
              property, is owned by Md. Rezaul Karim RCM and is protected by copyright, trademark, and other laws.
            </p>

            <h3>6.2 Limited License</h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable license to access and use the platform 
              for your personal or internal business purposes. This license does not include the right to:
            </p>
            <ul>
              <li>Modify, copy, or create derivative works of the platform</li>
              <li>Redistribute or resell the platform or its features</li>
              <li>Remove or alter any copyright or proprietary notices</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>7. Privacy and Data Protection</h2>
            <p>
              Your use of the platform is also governed by our Privacy Policy, which explains how we collect, 
              use, and protect your personal information. By using the platform, you consent to our data 
              practices as described in the Privacy Policy.
            </p>
          </div>

          <div className="legal-section">
            <h2>8. Service Availability</h2>
            <p>
              We strive to provide continuous service availability but do not guarantee that the platform will 
              be available 100% of the time. We may:
            </p>
            <ul>
              <li>Perform scheduled maintenance with or without notice</li>
              <li>Experience unplanned downtime due to technical issues</li>
              <li>Modify, suspend, or discontinue features at our discretion</li>
            </ul>
            <p>
              We are not liable for any loss or damage resulting from service interruptions or unavailability.
            </p>
          </div>

          <div className="legal-section">
            <h2>9. Disclaimer of Warranties</h2>
            <p>
              THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
              EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Warranties of merchantability or fitness for a particular purpose</li>
              <li>Warranties that the platform will be error-free or uninterrupted</li>
              <li>Warranties regarding the accuracy or reliability of analytics</li>
              <li>Warranties that the platform will meet your specific requirements</li>
            </ul>
            <p>
              You acknowledge that you use the platform at your own risk.
            </p>
          </div>

          <div className="legal-section">
            <h2>10. Limitation of Liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, 
              SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
            </p>
            <ul>
              <li>Loss of profits, data, or business opportunities</li>
              <li>Service interruptions or security breaches</li>
              <li>Errors in analytics or reports generated by the platform</li>
              <li>Actions taken based on information provided by the platform</li>
            </ul>
            <p>
              Our total liability for any claim arising from your use of the platform shall not exceed the 
              amount you paid to us in the 12 months preceding the claim (if any).
            </p>
          </div>

          <div className="legal-section">
            <h2>11. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless Md. Rezaul Karim RCM and the platform from 
              any claims, damages, losses, liabilities, and expenses (including legal fees) arising from:
            </p>
            <ul>
              <li>Your violation of these Terms</li>
              <li>Your violation of any third-party rights</li>
              <li>Your use or misuse of the platform</li>
              <li>Data you upload to the platform</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>12. Termination</h2>
            <h3>12.1 Termination by You</h3>
            <p>
              You may terminate your account at any time by contacting us. Upon termination, your access 
              to the platform will be disabled, and your data will be deleted within 30 days.
            </p>

            <h3>12.2 Termination by Us</h3>
            <p>
              We reserve the right to suspend or terminate your account immediately if you:
            </p>
            <ul>
              <li>Violate these Terms or our Acceptable Use Policy</li>
              <li>Engage in fraudulent or illegal activities</li>
              <li>Pose a security risk to the platform or other users</li>
              <li>Use the platform in a manner that could harm our business</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>13. Changes to the Platform</h2>
            <p>
              We reserve the right to modify, update, or discontinue any aspect of the platform at any time 
              without prior notice. We may add new features, remove existing features, or change how the 
              platform operates. Your continued use after such changes constitutes acceptance.
            </p>
          </div>

          <div className="legal-section">
            <h2>14. Governing Law and Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of Bangladesh. 
              Any disputes arising from these Terms or your use of the platform shall be resolved through:
            </p>
            <ul>
              <li>First, good faith negotiation between the parties</li>
              <li>If negotiation fails, mediation or arbitration</li>
              <li>As a last resort, litigation in the courts of Bangladesh</li>
            </ul>
          </div>

          <div className="legal-section">
            <h2>15. Severability</h2>
            <p>
              If any provision of these Terms is found to be invalid or unenforceable, the remaining 
              provisions shall continue in full force and effect. The invalid provision shall be replaced 
              with a valid provision that most closely matches the intent of the original.
            </p>
          </div>

          <div className="legal-section">
            <h2>16. Entire Agreement</h2>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement between you 
              and us regarding the use of the platform and supersede all prior agreements and understandings.
            </p>
          </div>

          <div className="legal-section">
            <h2>17. Contact Information</h2>
            <p>
              If you have questions, concerns, or disputes regarding these Terms:
            </p>
            <div className="contact-info">
              <p><strong>Developer:</strong> Md. Rezaul Karim RCM</p>
              <p><strong>WhatsApp:</strong> <a href="https://wa.me/8801712394851">+880 1712-394851</a></p>
              <p><strong>Facebook:</strong> <a href="https://www.facebook.com/rezaul2000">facebook.com/rezaul2000</a></p>
              <p><strong>Website:</strong> <a href="https://rezaulkarim.shop">rezaulkarim.shop</a></p>
            </div>
          </div>

          <div className="legal-section acknowledgment">
            <h2>Acknowledgment</h2>
            <p>
              BY USING THE PLATFORM, YOU ACKNOWLEDGE THAT YOU HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND 
              BY THESE TERMS OF SERVICE.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfService;
