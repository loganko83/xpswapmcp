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
import { Vote, Users, Clock, CheckCircle, XCircle, AlertCircle, Plus, Eye } from "lucide-react";
import { useWeb3 } from "@/hooks/useWeb3";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { QuickShareButton } from "./SocialSharing";

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
      const response = await fetch("/api/governance/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          proposalId: proposal.id,
          vote: selectedVote,
          reason: voteReason,
          userAddress: wallet.address
        })
      });
      
      if (!response.ok) throw new Error("Failed to submit vote");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Vote Submitted",
        description: `Your ${selectedVote} vote has been recorded successfully.`,
      });
      onClose();
      queryClient.invalidateQueries({ queryKey: ["/api/governance/proposals"] });
    },
    onError: (error) => {
      toast({
        title: "Vote Failed",
        description: "Failed to submit your vote. Please try again.",
        variant: "destructive",
      });
    }
  });

  const getUserVotingPower = () => {
    // In real implementation, this would calculate based on user's XP token holdings
    return "1,250.50";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Vote on Proposal #{proposal.id}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Proposal Summary */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h3 className="font-semibold text-sm mb-2">{proposal.title}</h3>
            <p className="text-xs text-muted-foreground">{proposal.description}</p>
          </div>

          {/* Voting Power */}
          <div className="flex justify-between items-center p-3 border rounded-lg">
            <span className="text-sm font-medium">Your Voting Power</span>
            <Badge variant="secondary">{getUserVotingPower()} XP</Badge>
          </div>

          {/* Vote Selection */}
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

          {/* Vote Reason */}
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

          {/* Current Vote Status */}
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

          {/* Action Buttons */}
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
      const response = await fetch("/api/governance/create-proposal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
      
      if (!response.ok) throw new Error("Failed to create proposal");
      return response.json();
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

  const minXPRequired = "10000"; // Minimum XP tokens required to create proposal

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Create Governance Proposal</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Requirements */}
          <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-orange-500 mt-0.5" />
              <div className="text-sm">
                <div className="font-medium text-orange-700 dark:text-orange-300">Requirements</div>
                <div className="text-orange-600 dark:text-orange-400 mt-1">
                  Minimum {minXPRequired} XP tokens required to create proposals
                </div>
              </div>
            </div>
          </div>

          {/* Proposal Type */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Proposal Type</label>
            <RadioGroup value={proposalType} onValueChange={(value: any) => setProposalType(value)}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="parameter" id="parameter" />
                <Label htmlFor="parameter">Parameter Change</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="upgrade" id="upgrade" />
                <Label htmlFor="upgrade">Protocol Upgrade</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="treasury" id="treasury" />
                <Label htmlFor="treasury">Treasury Management</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="general" id="general" />
                <Label htmlFor="general">General Proposal</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Title</label>
            <Input
              placeholder="Brief, clear title for your proposal"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Description */}
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

          {/* Parameter Changes (if applicable) */}
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

          {/* Action Buttons */}
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
  const [selectedProposal, setSelectedProposal] = useState<GovernanceProposal | null>(null);
  const [voteDialogOpen, setVoteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'active' | 'passed' | 'rejected'>('all');

  // Fetch governance proposals
  const { data: proposals = [], isLoading } = useQuery({
    queryKey: ["/api/governance/proposals"],
    queryFn: async () => {
      const response = await fetch("/api/governance/proposals");
      if (!response.ok) throw new Error("Failed to fetch proposals");
      return response.json();
    }
  });

  // Fetch governance stats
  const { data: governanceStats } = useQuery({
    queryKey: ["/api/governance/stats"],
    queryFn: async () => {
      const response = await fetch("/api/governance/stats");
      if (!response.ok) throw new Error("Failed to fetch governance stats");
      return response.json();
    }
  });

  const handleVote = (proposal: GovernanceProposal) => {
    setSelectedProposal(proposal);
    setVoteDialogOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'passed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'executed': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parameter': return '⚙️';
      case 'upgrade': return '🔄';
      case 'treasury': return '💰';
      case 'general': return '📋';
      default: return '📄';
    }
  };

  const calculateTimeRemaining = (endTime: number) => {
    const now = Date.now();
    const remaining = endTime - now;
    if (remaining <= 0) return "Voting ended";
    
    const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    
    if (days > 0) return `${days}d ${hours}h remaining`;
    return `${hours}h remaining`;
  };

  const calculateVotePercentage = (votes: string, total: string) => {
    const voteNum = parseFloat(votes);
    const totalNum = parseFloat(total);
    if (totalNum === 0) return 0;
    return (voteNum / totalNum) * 100;
  };

  const filteredProposals = proposals.filter((proposal: GovernanceProposal) => 
    filter === 'all' || proposal.status === filter
  );

  return (
    <div className="space-y-6">
      {/* Governance Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
              <Vote className="w-4 h-4 text-purple-500" />
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
              <CheckCircle className="w-4 h-4 text-orange-500" />
            </div>
            <div className="text-2xl font-bold">{governanceStats?.successRate || 0}%</div>
            <Badge variant="outline" className="text-orange-600 border-orange-200">
              Passed
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Header Actions */}
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          {['all', 'active', 'passed', 'rejected'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as any)}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
        
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Proposal
        </Button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">Loading proposals...</div>
        ) : filteredProposals.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Vote className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No proposals found</h3>
              <p className="text-muted-foreground mb-4">
                {filter === 'all' 
                  ? "No governance proposals have been created yet."
                  : `No ${filter} proposals found.`}
              </p>
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create First Proposal
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredProposals.map((proposal: GovernanceProposal) => (
            <Card key={proposal.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-2xl">{getTypeIcon(proposal.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">#{proposal.id} {proposal.title}</h3>
                        <Badge className={getStatusColor(proposal.status)}>
                          {proposal.status}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3">{proposal.description}</p>
                      
                      {/* Vote Progress */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span>For: {proposal.votesFor} XP</span>
                          <span>Against: {proposal.votesAgainst} XP</span>
                        </div>
                        <div className="relative">
                          <Progress 
                            value={calculateVotePercentage(proposal.votesFor, proposal.totalVotes)} 
                            className="h-2"
                          />
                          <div 
                            className="absolute top-0 right-0 h-2 bg-red-500 rounded-r-sm"
                            style={{ 
                              width: `${calculateVotePercentage(proposal.votesAgainst, proposal.totalVotes)}%` 
                            }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Quorum: {proposal.quorum} XP</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {calculateTimeRemaining(proposal.endTime)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                  {proposal.status === 'active' && wallet.isConnected && (
                    <Button
                      size="sm"
                      onClick={() => handleVote(proposal)}
                      disabled={!!proposal.userVote}
                    >
                      <Vote className="w-4 h-4 mr-1" />
                      {proposal.userVote ? `Voted ${proposal.userVote}` : 'Vote'}
                    </Button>
                  )}
                  
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" />
                    Details
                  </Button>
                  
                  <QuickShareButton
                    insight={{
                      id: `proposal-${proposal.id}`,
                      type: 'analysis',
                      title: `Governance Proposal #${proposal.id}: ${proposal.title}`,
                      description: proposal.description,
                      data: {
                        change: calculateVotePercentage(proposal.votesFor, proposal.totalVotes).toFixed(1)
                      },
                      timestamp: Date.now()
                    }}
                    variant="outline"
                    size="sm"
                  />
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

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