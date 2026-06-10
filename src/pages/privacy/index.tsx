import './style.css';

export const PrivacyPage = () => {
    return (
        <div className="privacy-layout">
            <div className="privacy-container">
                <header className="privacy-header">
                    <div className="privacy-header__top-row">
                        <div>
                            <h1>Privacy Policy</h1>
                            <p className="privacy-header__subtitle">
                                Your data belongs to you. Here's how we keep it that way.
                            </p>
                        </div>
                    </div>
                </header>

                <hr className="privacy-divider" />

                <main className="privacy-content">
                    <section className="privacy-section">
                        <h2>1. Introduction</h2>
                        <p>Welcome to MoveMates. We respect your privacy and are committed to protecting it. This Privacy Policy explains our practices regarding the collection, use, and disclosure of information when you use our application. MoveMates is designed with a "local-first" architecture, meaning we prioritize keeping your data on your own device.</p>
                        <p><strong>Last Updated:</strong> June 2026</p>
                    </section>

                    <section className="privacy-section">
                        <h2>2. Information We Do Not Collect</h2>
                        <p>Unlike many applications, MoveMates operates entirely within your web browser. <strong>We do not track, collect, upload, or monetize any personal data, usage statistics, or telemetry.</strong> Specifically:</p>
                        <ul>
                            <li><strong>Camera Feeds:</strong> Your video and camera streams are never sent to external servers.</li>
                            <li><strong>Pose Data:</strong> The coordinates and analysis of your movements are processed entirely on your device.</li>
                            <li><strong>Personal Profiles:</strong> Your name, therapist details, and notes remain strictly local.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>3. How Your Data is Stored</h2>
                        <p>All of your movement recordings, video frames, configuration settings, and progress logs are stored exclusively on your device using browser technologies such as Local Storage and IndexedDB.</p>
                        <p>Because this data is stored locally:</p>
                        <ul>
                            <li>You are in full control of your data.</li>
                            <li>You can delete your data at any time by clearing your browser's site data or using the "Reset to Defaults" option in the settings.</li>
                            <li>We have no ability to access, recover, or read your data if it is lost or deleted.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>4. Client-Side Processing</h2>
                        <p>Our pose estimation and movement analysis engines operate purely within your web browser using modern Web APIs. This guarantees that complex machine learning processing happens locally on your machine, ensuring your camera feed and biometric data are never transmitted over the internet.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>5. Third-Party Services and Analytics</h2>
                        <p>We do not embed third-party trackers, analytics scripts (such as Google Analytics), or advertisement networks in this application. Your interactions with the app remain entirely private and unmonitored by external marketing or tracking entities.</p>
                        <p><em>Note on Hosting:</em> The application itself is hosted on a standard web server which may collect basic, anonymous server logs (such as IP addresses and browser types) necessary for delivering the website securely. This is standard for all websites and is not used to identify individual users or track activity within the MoveMates application.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>6. Your Privacy Rights</h2>
                        <p>Depending on your location, you may have rights under privacy laws such as the General Data Protection Regulation (GDPR) or the California Consumer Privacy Act (CCPA). Because MoveMates does not collect or store your data on our servers, we already comply with the strictest interpretations of these rights:</p>
                        <ul>
                            <li><strong>Right to Access & Portability:</strong> You can export your data directly from the Settings page.</li>
                            <li><strong>Right to Deletion:</strong> You can permanently delete your data via your browser settings or within the app.</li>
                        </ul>
                    </section>

                    <section className="privacy-section">
                        <h2>7. Children's Privacy</h2>
                        <p>MoveMates does not knowingly collect any personal information from children under the age of 13. Given our local-first architecture, no data is collected from any user regardless of age. If you are a parent or guardian and believe your child has stored sensitive information within the app, you may delete it by clearing the browser data on the device.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>8. Changes to This Policy</h2>
                        <p>We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any significant changes by updating the "Last Updated" date at the top of this policy.</p>
                    </section>

                    <section className="privacy-section">
                        <h2>9. Contact Information</h2>
                        <p>If you have any questions, concerns, or requests regarding this Privacy Policy or the security of your data, please contact the development team through our official repository or support channels.</p>
                    </section>
                </main>
            </div>
        </div>
    );
};
