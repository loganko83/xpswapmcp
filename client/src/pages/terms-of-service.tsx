import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Terms of Service
          </h1>
          <p className="text-lg text-muted-foreground">
            Effective Date: January 3, 2025
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl">
          <CardHeader>
            <CardTitle>Agreement to Terms</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-auto max-h-[600px]">
              <div className="space-y-6 text-sm leading-relaxed">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Acceptance of Terms</h3>
                  <p className="text-muted-foreground mb-3">
                    By accessing or using XpSwap ("Platform", "Service", "we", "us", or "our"), you agree to be bound by these Terms of Service ("Terms"). 
                    If you disagree with any part of these terms, then you may not access the Service.
                  </p>
                  <p className="text-muted-foreground">
                    These Terms apply to all visitors, users, and others who access or use the Service.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. Description of Service</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      XpSwap is a decentralized exchange (DEX) protocol that enables users to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Swap tokens on the Xphere blockchain and other supported networks</li>
                      <li>Provide liquidity to automated market maker (AMM) pools</li>
                      <li>Participate in yield farming and staking programs</li>
                      <li>Bridge assets across multiple blockchain networks</li>
                      <li>Access governance features and voting mechanisms</li>
                    </ul>
                    <p className="text-muted-foreground mt-3">
                      The Service is provided on an "as is" and "as available" basis.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. Eligibility</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      To use our Service, you must:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Be at least 18 years old</li>
                      <li>Have legal capacity to enter into contracts</li>
                      <li>Not be prohibited from using the Service under applicable laws</li>
                      <li>Comply with all local laws and regulations</li>
                    </ul>
                    <p className="text-muted-foreground mt-3">
                      You represent and warrant that all information you provide is accurate and complete.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. Prohibited Activities</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground mb-3">
                      You agree not to engage in any of the following prohibited activities:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Using the Service for any illegal or unauthorized purpose</li>
                      <li>Attempting to interfere with or disrupt the Service</li>
                      <li>Using automated systems to access the Service without permission</li>
                      <li>Circumventing any security measures or access controls</li>
                      <li>Impersonating any person or entity</li>
                      <li>Transmitting malicious code or harmful content</li>
                      <li>Violating any applicable laws or regulations</li>
                      <li>Money laundering or terrorist financing</li>
                      <li>Market manipulation or fraudulent trading</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">5. Financial Risks and Disclaimers</h3>
                  <div className="space-y-3">
                    <h4 className="font-medium">5.1 Investment Risks</h4>
                    <p className="text-muted-foreground">
                      Trading cryptocurrencies and DeFi protocols involves substantial risk. You acknowledge and accept:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Digital assets are highly volatile and speculative</li>
                      <li>You may lose some or all of your invested funds</li>
                      <li>Past performance does not guarantee future results</li>
                      <li>Regulatory changes may affect the value of digital assets</li>
                    </ul>

                    <h4 className="font-medium mt-4">5.2 Smart Contract Risks</h4>
                    <p className="text-muted-foreground">
                      Our platform relies on smart contracts which may contain bugs or vulnerabilities. 
                      We conduct security audits but cannot guarantee complete security.
                    </p>

                    <h4 className="font-medium mt-4">5.3 No Financial Advice</h4>
                    <p className="text-muted-foreground">
                      The information provided on our platform is for informational purposes only and 
                      does not constitute financial, investment, or trading advice.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. User Responsibilities</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground mb-3">
                      As a user of the Service, you are responsible for:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Maintaining the security of your wallet and private keys</li>
                      <li>Verifying all transaction details before confirmation</li>
                      <li>Understanding the risks associated with DeFi protocols</li>
                      <li>Complying with applicable tax obligations</li>
                      <li>Keeping your contact information up to date</li>
                      <li>Reporting any security vulnerabilities or issues</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Intellectual Property Rights</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      The Service and its original content, features, and functionality are and will remain 
                      the exclusive property of XpSwap and its licensors.
                    </p>
                    <p className="text-muted-foreground">
                      You may not reproduce, distribute, modify, or create derivative works of our content 
                      without explicit written permission.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">8. Privacy and Data Protection</h3>
                  <p className="text-muted-foreground">
                    Your privacy is important to us. Please review our Privacy Policy, which also governs 
                    your use of the Service, to understand our practices regarding the collection and use of your information.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">9. Limitation of Liability</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      To the maximum extent permitted by applicable law, XpSwap shall not be liable for any indirect, 
                      incidental, special, consequential, or punitive damages, including but not limited to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
                      <li>Loss of profits, data, or other intangible losses</li>
                      <li>Unauthorized access to or alteration of your transmissions or data</li>
                      <li>Statements or conduct of any third party on the Service</li>
                      <li>Any bugs, viruses, or similar harmful components</li>
                    </ul>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">10. Indemnification</h3>
                  <p className="text-muted-foreground">
                    You agree to indemnify, defend, and hold harmless XpSwap and its officers, directors, employees, 
                    agents, and affiliates from and against any claims, damages, obligations, losses, liabilities, 
                    costs, or debt arising from your use of the Service or violation of these Terms.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">11. Termination</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      We may terminate or suspend your access immediately, without prior notice or liability, 
                      for any reason whatsoever, including without limitation if you breach the Terms.
                    </p>
                    <p className="text-muted-foreground">
                      Upon termination, your right to use the Service will cease immediately. 
                      However, the decentralized nature of blockchain means you may still interact with smart contracts directly.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">12. Governing Law and Dispute Resolution</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      These Terms shall be interpreted and governed by applicable international laws regarding 
                      decentralized protocols and digital assets.
                    </p>
                    <p className="text-muted-foreground">
                      Any disputes arising from these Terms or your use of the Service shall be resolved through 
                      binding arbitration in accordance with international arbitration rules.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">13. Compliance and Regulatory Considerations</h3>
                  <div className="space-y-3">
                    <p className="text-muted-foreground">
                      You acknowledge that cryptocurrency regulations vary by jurisdiction and are evolving. 
                      You are responsible for ensuring compliance with all applicable laws in your jurisdiction.
                    </p>
                    <p className="text-muted-foreground">
                      We reserve the right to restrict access to the Service in certain jurisdictions 
                      where regulatory requirements make it impractical to operate.
                    </p>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">14. Changes to Terms</h3>
                  <p className="text-muted-foreground">
                    We reserve the right to modify or replace these Terms at any time. If a revision is material, 
                    we will try to provide at least 30 days' notice prior to any new terms taking effect.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">15. Severability</h3>
                  <p className="text-muted-foreground">
                    If any provision of these Terms is held to be unenforceable or invalid, such provision 
                    will be changed and interpreted to accomplish the objectives of such provision to the greatest 
                    extent possible under applicable law.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">16. Contact Information</h3>
                  <p className="text-muted-foreground mb-3">
                    If you have any questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-sm">
                      <strong>Email:</strong> legal@xpswap.io<br />
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