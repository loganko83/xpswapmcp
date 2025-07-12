import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Vote, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Plus, 
  Eye,
  TrendingUp,
  DollarSign,
  Settings,
  FileText,
  Calendar,
  Shield,
  Zap,
  Target
} from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { QuickShareButton } from "./SocialSharing";
import { apiRequest } from "@/lib/queryClient";
import { GovernanceAnalytics } from "./GovernanceAnalytics";
import { YieldOptimization } from "./YieldOptimization";
import { RiskManagement } from "./RiskManagement";

interface GovernanceProposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  status: 'active' | 'passed' | 'rejected' | 'pending' | 'executed';
  type: 'parameter' | 'upgrade' | 'treasury' | 'general';
  votingPower: string;
  votesFor: string;
  votesAgainst: string;
  totalVotes: string;
  quorum: string;
  startTime: number;
  endTime: number;
  executionTime?: number;
  details: {
    currentValue?: string;
    proposedValue?: string;
    impact?: string;
    implementation?: string;
  };
  userVote?: 'for' | 'against' | null;
  userVotingPower?: string;
}

interface VoteDialogProps {
  proposal: GovernanceProposal;
  isOpen: boolean;
  onClose: () => void;
}

function VoteDialog({ proposal, isOpen, onClose }: VoteDialogProps) {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedVote, setSelectedVote] = useState<'for' | 'against'>('for');
  const [voteReason, setVoteReason] = useState("");

  const voteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/governance/vote", {
        method: "POST",
        body: JSON.stringify({
          proposalId: proposal.id,
          vote: selectedVote,
          reason: voteReason,
          userAddress: wallet.address
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Vote Submitted",
        description: `Your ${selectedVote} vote has been recorded.`,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/governance/proposals"] });
    },
    onError: (error) => {
      toast({
        title: "Vote Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vote on Proposal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <h3 className="font-semibold text-lg">{proposal.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{proposal.description}</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium">Your Vote</label>
            <RadioGroup value={selectedVote} onValueChange={(value: 'for' | 'against') => setSelectedVote(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="for" id="for" />
                <Label htmlFor="for" className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Vote For
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="against" id="against" />
                <Label htmlFor="against" className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Vote Against
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reason (Optional)</label>
            <Textarea
              placeholder="Explain your voting decision..."
              value={voteReason}
              onChange={(e) => setVoteReason(e.target.value)}
              className="min-h-[80px]"
              maxLength={500}
            />
            <div className="text-xs text-muted-foreground text-right">
              {voteReason.length}/500 characters
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
              <div className="text-lg font-bold text-green-600">{proposal.votesFor}</div>
              <div className="text-xs text-green-600">For</div>
            </div>
            <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
              <div className="text-lg font-bold text-red-600">{proposal.votesAgainst}</div>
              <div className="text-xs text-red-600">Against</div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => voteMutation.mutate()}
              disabled={voteMutation.isPending}
            >
              {voteMutation.isPending ? "Submitting..." : `Vote ${selectedVote}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface CreateProposalDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

function CreateProposalDialog({ isOpen, onClose }: CreateProposalDialogProps) {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [proposalType, setProposalType] = useState<'parameter' | 'upgrade' | 'treasury' | 'general'>('general');
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [proposedValue, setProposedValue] = useState("");

  const createProposalMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("/api/governance/create-proposal", {
        method: "POST",
        body: JSON.stringify({
          type: proposalType,
          title,
          description,
          details: {
            currentValue,
            proposedValue,
          },
          proposer: wallet.address
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Proposal Created",
        description: "Your governance proposal has been submitted for community review.",
      });
      onClose();
      setTitle("");
      setDescription("");
      setCurrentValue("");
      setProposedValue("");
      queryClient.invalidateQueries({ queryKey: ["/api/governance/proposals"] });
    },
    onError: (error) => {
      toast({
        title: "Creation Failed",
        description: "Failed to create proposal. Please try again.",
        variant: "destructive",
      });
    }
  });

  const minXPRequired = "10000";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Governance Proposal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-orange-700 dark:text-orange-300">Requirements</div>
                <div className="text-orange-600 dark:text-orange-400 mt-1">
                  Minimum {minXPRequired} XP tokens required to create a proposal
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Proposal Type</label>
            <Select value={proposalType} onValueChange={(value: any) => setProposalType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="parameter">Parameter Change</SelectItem>
                <SelectItem value="upgrade">Protocol Upgrade</SelectItem>
                <SelectItem value="treasury">Treasury Proposal</SelectItem>
                <SelectItem value="general">General Proposal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Brief, clear title for your proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              placeholder="Detailed explanation of your proposal, its benefits, and implementation plan..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[120px]"
              maxLength={2000}
            />
            <div className="text-xs text-muted-foreground text-right">
              {description.length}/2000 characters
            </div>
          </div>

          {(proposalType === 'parameter' || proposalType === 'treasury') && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Current Value</label>
                <Input
                  placeholder="e.g., 0.3%"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Proposed Value</label>
                <Input
                  placeholder="e.g., 0.25%"
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              className="flex-1" 
              onClick={() => createProposalMutation.mutate()}
              disabled={!title || !description || createProposalMutation.isPending}
            >
              {createProposalMutation.isPending ? "Creating..." : "Create Proposal"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function GovernanceVoting() {
  const { wallet } = useWeb3();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null);

  // Fetch proposals data with real-time updates
  const { data: proposalsData, isLoading } = useQuery({
    queryKey: ["/api/governance/proposals"],
    enabled: !!wallet.address,
    refetchInterval: 5000, // Update every 5 seconds
  });

  // Fetch governance stats
  const { data: governanceStats } = useQuery({
    queryKey: ["/api/governance/stats"],
    enabled: !!wallet.address,
  });

  // Fetch risk analysis data
  const { data: riskData } = useQuery({
    queryKey: ["/api/governance/risk-analysis"],
    enabled: !!wallet.address,
  });

  // Fetch yield optimization data
  const { data: yieldData } = useQuery({
    queryKey: ["/api/governance/yield-optimization"],
    enabled: !!wallet.address,
  });

  // Real-time voting power calculation
  const { data: votingPower } = useQuery({
    queryKey: ["/api/governance/voting-power", wallet.address],
    enabled: !!wallet.address,
    refetchInterval: 10000, // Update every 10 seconds
  });

  const handleVote = (proposal: GovernanceProposal) => {
    setSelectedProposal(proposal);
    setVoteDialogOpen(true);
  };

  const filteredProposals = proposalsData?.filter((proposal: GovernanceProposal) => 
    selectedFilter === "all" || proposal.status === selectedFilter
  ) || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-500";
      case "passed": return "bg-blue-500";
      case "rejected": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      case "executed": return "bg-purple-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <Vote className="w-4 h-4" />;
      case "passed": return <CheckCircle className="w-4 h-4" />;
      case "rejected": return <XCircle className="w-4 h-4" />;
      case "pending": return <Clock className="w-4 h-4" />;
      case "executed": return <CheckCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "parameter": return <Settings className="w-4 h-4" />;
      case "upgrade": return <TrendingUp className="w-4 h-4" />;
      case "treasury": return <DollarSign className="w-4 h-4" />;
      case "general": return <FileText className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatTimeLeft = (endTime: number) => {
    const now = Date.now();
    const timeLeft = endTime - now;
    
    if (timeLeft <= 0) return "Ended";
    
    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const calculateVotePercentage = (votesFor: string, votesAgainst: string) => {
    const forVotes = parseFloat(votesFor);
    const againstVotes = parseFloat(votesAgainst);
    const total = forVotes + againstVotes;
    
    if (total === 0) return { forPercentage: 0, againstPercentage: 0 };
    
    return {
      forPercentage: (forVotes / total) * 100,
      againstPercentage: (againstVotes / total) * 100
    };
  };

  if (!wallet.isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="text-center py-12">
          <CardContent>
            <Vote className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-muted-foreground">Connect your wallet to participate in governance voting</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Advanced DeFi Governance</h1>
          <p className="text-muted-foreground">Real-time governance, yield optimization, and risk management</p>
        </div>
        <div className="flex space-x-2">
          <Button 
            onClick={() => setCreateDialogOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Proposal</span>
          </Button>
        </div>
      </div>

      {/* Advanced Stats Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Vote className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Total Proposals</p>
                <p className="text-2xl font-bold">{governanceStats?.totalProposals || 0}</p>
                <p className="text-xs text-green-500">+{governanceStats?.newProposals || 0} this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Your Voting Power</p>
                <p className="text-2xl font-bold">{votingPower?.totalPower || "0"}</p>
                <p className="text-xs text-blue-500">Rank #{votingPower?.rank || "N/A"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Risk Score</p>
                <p className="text-2xl font-bold">{riskData?.overallRisk || "Low"}</p>
                <p className="text-xs text-green-500">-5% from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Optimized APY</p>
                <p className="text-2xl font-bold">{yieldData?.optimizedAPY || "0%"}</p>
                <p className="text-xs text-purple-500">+{yieldData?.improvement || "0%"} boost</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Advanced Tabs */}
      <Tabs defaultValue="proposals" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="proposals">Proposals</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="yields">Yield Optimization</TabsTrigger>
          <TabsTrigger value="risks">Risk Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="proposals" className="space-y-4">
          {/* Proposal Filters */}
          <div className="flex flex-wrap gap-2">
            <Button 
              variant={selectedFilter === "all" ? "default" : "outline"}
              onClick={() => setSelectedFilter("all")}
            >
              All Proposals
            </Button>
            <Button 
              variant={selectedFilter === "active" ? "default" : "outline"}
              onClick={() => setSelectedFilter("active")}
            >
              Active ({governanceStats?.activeProposals || 0})
            </Button>
            <Button 
              variant={selectedFilter === "passed" ? "default" : "outline"}
              onClick={() => setSelectedFilter("passed")}
            >
              Passed
            </Button>
            <Button 
              variant={selectedFilter === "rejected" ? "default" : "outline"}
              onClick={() => setSelectedFilter("rejected")}
            >
              Rejected
            </Button>
          </div>

          {/* Proposals List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">Loading proposals...</div>
            ) : filteredProposals.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No proposals found</p>
                </CardContent>
              </Card>
            ) : (
              filteredProposals.map((proposal: GovernanceProposal) => (
                <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        {getTypeIcon(proposal.type)}
                        <div>
                          <CardTitle className="text-lg">{proposal.title}</CardTitle>
                          <p className="text-sm text-muted-foreground">
                            Proposed by {proposal.proposer.slice(0, 8)}...{proposal.proposer.slice(-6)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(proposal.status)}>
                          {getStatusIcon(proposal.status)}
                          <span className="ml-1 capitalize">{proposal.status}</span>
                        </Badge>
                        <Badge variant="outline">{proposal.type}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{proposal.description}</p>
                    
                    {/* Enhanced Voting Progress */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-green-600">For: {proposal.votesFor}</span>
                        <span className="text-red-600">Against: {proposal.votesAgainst}</span>
                      </div>
                      <Progress 
                        value={calculateVotePercentage(proposal.votesFor, proposal.votesAgainst).forPercentage} 
                        className="h-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Quorum: {proposal.quorum}</span>
                        <span>{formatTimeLeft(proposal.endTime)}</span>
                      </div>
                    </div>

                    {/* Enhanced Details */}
                    {proposal.details && (
                      <div className="bg-muted/50 p-3 rounded-lg mb-4 space-y-2">
                        {proposal.details.currentValue && (
                          <div className="flex justify-between text-sm">
                            <span>Current Value:</span>
                            <span className="font-medium">{proposal.details.currentValue}</span>
                          </div>
                        )}
                        {proposal.details.proposedValue && (
                          <div className="flex justify-between text-sm">
                            <span>Proposed Value:</span>
                            <span className="font-medium text-blue-600">{proposal.details.proposedValue}</span>
                          </div>
                        )}
                        {proposal.details.impact && (
                          <div className="text-sm">
                            <span className="text-muted-foreground">Impact: </span>
                            <span>{proposal.details.impact}</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Button 
                          size="sm" 
                          onClick={() => handleVote(proposal)}
                          disabled={proposal.status !== "active" || proposal.userVote !== null}
                        >
                          {proposal.userVote ? `Voted ${proposal.userVote}` : "Vote Now"}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                        <QuickShareButton 
                          content={`Reviewing governance proposal: ${proposal.title}`}
                          insightType="governance"
                        />
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Ends {new Date(proposal.endTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <GovernanceAnalytics />
        </TabsContent>

        <TabsContent value="yields" className="space-y-4">
          <YieldOptimization />
        </TabsContent>

        <TabsContent value="risks" className="space-y-4">
          <RiskManagement />
        </TabsContent>
      </Tabs>

      {/* Vote Dialog */}
      {selectedProposal && (
        <VoteDialog 
          proposal={selectedProposal} 
          isOpen={voteDialogOpen}
          onClose={() => {
            setVoteDialogOpen(false);
            setSelectedProposal(null);
          }}
        />
      )}

      {/* Create Proposal Dialog */}
      <CreateProposalDialog 
        isOpen={createDialogOpen} 
        onClose={() => setCreateDialogOpen(false)} 
      />
    </div>
  );
}