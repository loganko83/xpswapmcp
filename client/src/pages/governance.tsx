import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Vote, Users, TrendingUp, Shield } from "lucide-react";
import { GovernanceVoting } from "@/components/GovernanceVoting";
import { useQuery } from "@tanstack/react-query";

export default function GovernancePage() {
  // Fetch governance statistics
  const { data: governanceStats } = useQuery({
    queryKey: ["/api/governance/stats"],
    queryFn: async () => {
      const response = await fetch("/api/governance/stats");
      if (!response.ok) throw new Error("Failed to fetch governance stats");
      return response.json();
    }
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Community Governance</h1>
        <p className="text-muted-foreground">
          Participate in shaping the future of XpSwap through decentralized governance
        </p>
      </div>

      {/* Governance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Total Proposals</span>
              <Vote className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{governanceStats?.totalProposals || 0}</div>
            <Badge variant="outline" className="text-blue-600 border-blue-200">
              All Time
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Active Votes</span>
              <Users className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{governanceStats?.activeProposals || 0}</div>
            <Badge variant="outline" className="text-green-600 border-green-200">
              Ongoing
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Participation</span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>
            <div className="text-2xl font-bold">{governanceStats?.participationRate || 0}%</div>
            <Badge variant="outline" className="text-purple-600 border-purple-200">
              30 Days
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-muted-foreground">Success Rate</span>
              <Shield className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{governanceStats?.successRate || 0}%</div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Passed
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Governance Features */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <Vote className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold">Token-based Voting</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Your voting power is determined by your XP token holdings. More tokens mean more influence on governance decisions.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Users className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold">Community Proposals</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              Any XP holder can create proposals for protocol changes, upgrades, and treasury management with sufficient stake.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold">Transparent Execution</h3>
            </div>
            <p className="text-sm text-muted-foreground">
              All governance decisions are executed on-chain with full transparency and immutable records.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Governance Voting Component */}
      <GovernanceVoting />
    </div>
  );
}