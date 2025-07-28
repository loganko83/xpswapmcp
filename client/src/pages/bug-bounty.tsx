import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Shield, Bug, AlertTriangle, CheckCircle, Mail, User, FileText } from "lucide-react";

import { getApiUrl } from "@/lib/apiUrl";
interface BugReportForm {
  name: string;
  title: string;
  content: string;
}

export default function BugBounty() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<BugReportForm>({
    name: "",
    title: "",
    content: ""
  });

  const submitBugReport = useMutation({
    mutationFn: async (data: BugReportForm) => {
      const response = await fetch(getApiUrl("/api/bug-bounty/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit bug report");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Bug Report Submitted",
        description: "Your bug report has been successfully submitted. We'll review it shortly.",
      });
      setFormData({ name: "", title: "", content: "" });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Failed to submit bug report. Please try again.",
        variant: "destructive",
      });
      console.error("Bug report submission error:", error);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.title.trim() || !formData.content.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    submitBugReport.mutate(formData);
  };

  const handleInputChange = (field: keyof BugReportForm, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent mb-4">
            Bug Bounty Program
          </h1>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Help us make XpSwap more secure and earn rewards for discovering vulnerabilities. 
            We value the security research community and offer bounties for valid security findings.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Bounty Information Cards */}
          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-500" />
                <CardTitle className="text-lg">Critical Vulnerabilities</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-red-500">$5,000 - $50,000</div>
                <p className="text-sm text-muted-foreground">
                  Smart contract vulnerabilities, fund theft possibilities, 
                  authentication bypasses, and critical security flaws.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <Bug className="w-6 h-6 text-orange-500" />
                <CardTitle className="text-lg">High Priority Bugs</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-orange-500">$1,000 - $5,000</div>
                <p className="text-sm text-muted-foreground">
                  Cross-site scripting (XSS), SQL injection, privilege escalation, 
                  and significant functionality issues.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-500" />
                <CardTitle className="text-lg">General Issues</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-green-500">$100 - $1,000</div>
                <p className="text-sm text-muted-foreground">
                  UI/UX bugs, minor security issues, performance problems, 
                  and general functionality improvements.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bug Report Form */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-3">
              <Mail className="w-6 h-6" />
              <span>Submit Bug Report</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Your Name *</span>
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-2">
                    <FileText className="w-4 h-4" />
                    <span>Bug Title *</span>
                  </Label>
                  <Input
                    id="title"
                    type="text"
                    placeholder="Brief description of the bug"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    required
                    className="bg-background/50"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content" className="flex items-center space-x-2">
                  <Bug className="w-4 h-4" />
                  <span>Bug Description *</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Please provide detailed information about the bug including:
??Steps to reproduce
??Expected behavior vs actual behavior
??Screenshots or video (if applicable)
??Environment details (browser, device, etc.)
??Potential security impact
??Suggested fixes (if any)"
                  value={formData.content}
                  onChange={(e) => handleInputChange("content", e.target.value)}
                  required
                  className="min-h-[200px] bg-background/50"
                />
              </div>

              <div className="bg-muted/50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Important Guidelines:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>??Please test on testnet environments when possible</li>
                  <li>??Do not exploit vulnerabilities on mainnet</li>
                  <li>??Include proof-of-concept code or screenshots</li>
                  <li>??Reports must be original and not previously disclosed</li>
                  <li>??We review all submissions within 48-72 hours</li>
                </ul>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitBugReport.isPending}
              >
                {submitBugReport.isPending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Submit Bug Report
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Information */}
        <Card className="backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 shadow-xl">
          <CardHeader>
            <CardTitle>Program Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Scope</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>??Smart contracts and protocol logic</li>
                  <li>??Web application security</li>
                  <li>??API endpoints and backend services</li>
                  <li>??Cross-chain bridge functionality</li>
                  <li>??User data protection</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Out of Scope</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>??Social engineering attacks</li>
                  <li>??Physical security issues</li>
                  <li>??Third-party services (MetaMask, etc.)</li>
                  <li>??Known issues already reported</li>
                  <li>??Spam or automated submissions</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}