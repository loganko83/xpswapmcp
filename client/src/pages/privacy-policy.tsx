import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-muted-foreground">
            Effective Date: January 3, 2025
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl">
          <CardHeader>
            <CardTitle>Your Privacy Matters</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto max-h-[600px]">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                  <div className="space-y-3">
                    <h4 className="font-medium">1.1 Information You Provide</h4>
                    <p className="text-muted-foreground">
                      We collect information you voluntarily provide when using XpSwap, including:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Wallet addresses and transaction data</li>
                      <li>Communication preferences</li>
                      <li>Feedback and support inquiries</li>
                    </ul>
                    
                    <h4 className="font-medium mt-4">1.2 Automatically Collected Information</h4>
                    <p className="text-muted-foreground">
                      When you use our platform, we automatically collect:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Device information and browser type</li>
                      <li>IP address and general location data</li>
                      <li>Usage patterns and platform interactions</li>
                      <li>Blockchain transaction data (publicly available)</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                  <p className="text-muted-foreground mb-3">
                    We use the collected information for the following purposes:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Providing and improving our decentralized exchange services</li>
                    <li>Processing transactions and maintaining platform security</li>
                    <li>Communicating with you about platform updates and features</li>
                    <li>Complying with legal and regulatory requirements</li>
                    <li>Analyzing usage patterns to enhance user experience</li>
                    <li>Preventing fraud and unauthorized access</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. Information Sharing and Disclosure</h3>
                  <div className="space-y-3">
                    <h4 className="font-medium">3.1 We Do Not Sell Personal Information</h4>
                    <p className="text-muted-foreground">
                      XpSwap does not sell, rent, or trade your personal information to third parties.
                    </p>
                    
                    <h4 className="font-medium">3.2 Limited Sharing</h4>
                    <p className="text-muted-foreground">
                      We may share information in limited circumstances:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>With service providers who assist in platform operations</li>
                      <li>When required by law or legal process</li>
                      <li>To protect the rights and safety of our users</li>
                      <li>In connection with business transfers or mergers</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                  <p className="text-muted-foreground mb-3">
                    We implement appropriate security measures to protect your information:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Encryption of sensitive data in transit and at rest</li>
                    <li>Regular security audits and vulnerability assessments</li>
                    <li>Access controls and authentication mechanisms</li>
                    <li>Incident response procedures for security breaches</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">5. Cookies and Tracking Technologies</h3>
                  <p className="text-muted-foreground mb-3">
                    We use cookies and similar technologies to:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Remember your preferences and settings</li>
                    <li>Analyze platform usage and performance</li>
                    <li>Provide personalized user experience</li>
                    <li>Ensure platform security and prevent fraud</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    You can control cookie settings through your browser preferences.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. Your Rights and Choices</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      Depending on your jurisdiction, you may have the following rights:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Access to your personal information</li>
                      <li>Correction of inaccurate data</li>
                      <li>Deletion of your personal information</li>
                      <li>Restriction of processing</li>
                      <li>Data portability</li>
                      <li>Objection to processing</li>
                    </ul>
                    <p className="text-muted-foreground mt-3">
                      To exercise these rights, please contact us at privacy@xpswap.io
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Third-Party Services</h3>
                  <p className="text-muted-foreground mb-3">
                    Our platform may integrate with third-party services such as:
                  </p>
                  <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                    <li>Wallet providers (MetaMask, WalletConnect)</li>
                    <li>Blockchain networks and protocols</li>
                    <li>Analytics and monitoring services</li>
                    <li>Bridge and aggregator services (LI.FI)</li>
                  </ul>
                  <p className="text-muted-foreground mt-3">
                    These services have their own privacy policies, which we encourage you to review.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">8. International Data Transfers</h3>
                  <p className="text-muted-foreground">
                    Your information may be transferred to and processed in countries other than your own. 
                    We ensure appropriate safeguards are in place to protect your data during international transfers.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">9. Children's Privacy</h3>
                  <p className="text-muted-foreground">
                    XpSwap is not intended for use by individuals under the age of 18. 
                    We do not knowingly collect personal information from children under 18.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">10. Changes to This Privacy Policy</h3>
                  <p className="text-muted-foreground">
                    We may update this Privacy Policy from time to time. We will notify you of any material changes 
                    by posting the new Privacy Policy on this page and updating the effective date.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">11. Contact Us</h3>
                  <p className="text-muted-foreground mb-3">
                    If you have any questions about this Privacy Policy, please contact us:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Email:</strong> privacy@xpswap.io<br />
                      <strong>Website:</strong> https://xpswap.io<br />
                      <strong>Address:</strong> XpSwap Development Team
                    </p>
                  </div>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}