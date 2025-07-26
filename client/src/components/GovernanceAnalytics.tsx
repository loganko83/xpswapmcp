import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, BarChart, PieChart, Activity, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useWeb3Context } from "@/contexts/Web3Context";

export function GovernanceAnalytics() {
  const { wallet } = useWeb3Context();

  const { data: analytics } = useQuery({
    queryKey: ["/api/governance/analytics"],
    enabled: !!wallet.address,
    refetchInterval: 10000,
  });

  const { data: participationData } = useQuery({
    queryKey: ["/api/governance/participation"],
    enabled: !!wallet.address,
  });

  const { data: votingTrends } = useQuery({
    queryKey: ["/api/governance/voting-trends"],
    enabled: !!wallet.address,
  });

  return (
    <div className="space-y-6">
      {/* Participation Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-blue-500" />
              <span>Voter Participation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Current Period</span>
                <span className="font-medium">{participationData?.currentPeriod || "78%"}</span>
              </div>
              <Progress value={participationData?.currentPeriod || 78} className="h-2" />
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span>+5.2% from last period</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <BarChart className="w-5 h-5 text-green-500" />
              <span>Proposal Success Rate</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Last 30 Days</span>
                <span className="font-medium">{analytics?.successRate || "85%"}</span>
              </div>
              <Progress value={analytics?.successRate || 85} className="h-2" />
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span>Above average</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-purple-500" />
              <span>Voting Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold">{analytics?.dailyVotes || "1,247"}</div>
              <div className="text-sm text-muted-foreground">Votes today</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <TrendingUp className="w-3 h-3 text-green-500" />
                <span>+12% from yesterday</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Voting Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Voting Trends by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {votingTrends?.categories?.map((category: any, index: number) => (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{category.type}</Badge>
                    <span className="text-sm font-medium">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">{category.votes}</span>
                    {category.trend === "up" ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                <Progress value={category.percentage} className="h-2" />
              </div>
            )) || (
              // Default data if API not available
              <>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">parameter</Badge>
                      <span className="text-sm font-medium">Parameter Changes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">2,847</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={45} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">treasury</Badge>
                      <span className="text-sm font-medium">Treasury Proposals</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">1,923</span>
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    </div>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">upgrade</Badge>
                      <span className="text-sm font-medium">Protocol Upgrades</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">856</span>
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    </div>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Governance Health Score */}
      <Card>
        <CardHeader>
          <CardTitle>Governance Health Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Decentralization</span>
                <span className="text-2xl font-bold text-green-500">92</span>
              </div>
              <Progress value={92} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Voting power well distributed across holders
              </p>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Engagement</span>
                <span className="text-2xl font-bold text-blue-500">87</span>
              </div>
              <Progress value={87} className="h-2" />
              <p className="text-xs text-muted-foreground">
                High community participation in voting
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}