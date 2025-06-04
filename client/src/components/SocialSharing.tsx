import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Share2, Twitter, MessageCircle, Send, Copy, TrendingUp, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useTokenPrices } from "@/hooks/useTokenPrices";

interface TradingInsight {
  id: string;
  type: 'trade' | 'pool' | 'farm' | 'analysis';
  title: string;
  description: string;
  data: {
    tokenA?: string;
    tokenB?: string;
    amount?: string;
    price?: string;
    change?: string;
    profit?: string;
    apy?: string;
    tvl?: string;
  };
  timestamp: number;
  performance?: {
    roi: string;
    timeframe: string;
  };
}

interface SocialSharingProps {
  insight: TradingInsight;
  isOpen: boolean;
  onClose: () => void;
}

export function SocialSharing({ insight, isOpen, onClose }: SocialSharingProps) {
  const { toast } = useToast();
  const [customMessage, setCustomMessage] = useState("");
  const [isSharing, setIsSharing] = useState(false);

  const { data: tokenPrices } = useTokenPrices([insight.data.tokenA || 'XP']);

  const generateInsightText = () => {
    const baseUrl = window.location.origin;
    let text = "";
    
    switch (insight.type) {
      case 'trade':
        text = `🚀 Just executed a ${insight.data.tokenA}/${insight.data.tokenB} swap on @XpSwap_DEX!\n\n`;
        text += `💰 Amount: ${insight.data.amount} ${insight.data.tokenA}\n`;
        text += `📈 Price: $${insight.data.price}\n`;
        if (insight.data.change) {
          text += `📊 24h Change: ${insight.data.change}%\n`;
        }
        break;
        
      case 'pool':
        text = `💎 Added liquidity to ${insight.data.tokenA}/${insight.data.tokenB} pool on @XpSwap_DEX!\n\n`;
        text += `🏦 TVL: $${insight.data.tvl}\n`;
        text += `🎯 APR: ${insight.data.apy}%\n`;
        text += `💰 Contributing: ${insight.data.amount} tokens\n`;
        break;
        
      case 'farm':
        text = `🌾 Staking in ${insight.data.tokenA} farm on @XpSwap_DEX!\n\n`;
        text += `🎯 APR: ${insight.data.apy}%\n`;
        text += `💰 Staked: ${insight.data.amount} ${insight.data.tokenA}\n`;
        if (insight.performance) {
          text += `📈 ROI: ${insight.performance.roi}% (${insight.performance.timeframe})\n`;
        }
        break;
        
      case 'analysis':
        text = `📊 Market Analysis: ${insight.title}\n\n`;
        text += `${insight.description}\n`;
        if (insight.data.change) {
          text += `📈 Performance: ${insight.data.change}%\n`;
        }
        break;
    }
    
    text += `\n#XpSwap #DeFi #Xphere #Trading\n`;
    text += `${baseUrl}`;
    
    if (customMessage.trim()) {
      text = `${customMessage}\n\n${text}`;
    }
    
    return text;
  };

  const generateTelegramText = () => {
    let text = "";
    
    switch (insight.type) {
      case 'trade':
        text = `🔥 <b>Successful Trade on XpSwap!</b>\n\n`;
        text += `💱 Pair: <code>${insight.data.tokenA}/${insight.data.tokenB}</code>\n`;
        text += `💰 Amount: <code>${insight.data.amount} ${insight.data.tokenA}</code>\n`;
        text += `💲 Price: <code>$${insight.data.price}</code>\n`;
        break;
        
      case 'pool':
        text = `💎 <b>Liquidity Provision Update</b>\n\n`;
        text += `🏊 Pool: <code>${insight.data.tokenA}/${insight.data.tokenB}</code>\n`;
        text += `📊 TVL: <code>$${insight.data.tvl}</code>\n`;
        text += `🎯 APR: <code>${insight.data.apy}%</code>\n`;
        break;
        
      case 'farm':
        text = `🌾 <b>Yield Farming Success</b>\n\n`;
        text += `🚜 Farm: <code>${insight.data.tokenA}</code>\n`;
        text += `💰 Staked: <code>${insight.data.amount} ${insight.data.tokenA}</code>\n`;
        text += `🎯 APR: <code>${insight.data.apy}%</code>\n`;
        break;
    }
    
    text += `\n🌐 Trade on XpSwap: ${window.location.origin}`;
    
    return text;
  };

  const shareToTwitter = () => {
    const text = generateInsightText();
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank', 'width=550,height=420');
    
    toast({
      title: "Shared to Twitter",
      description: "Your trading insight has been shared!",
    });
  };

  const shareToTelegram = () => {
    const text = generateTelegramText();
    const url = `https://t.me/share/url?url=${encodeURIComponent(window.location.origin)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    
    toast({
      title: "Shared to Telegram",
      description: "Your trading insight has been shared!",
    });
  };

  const copyToClipboard = async () => {
    try {
      const text = generateInsightText();
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to Clipboard",
        description: "Trading insight copied successfully!",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const shareToDiscord = () => {
    const text = generateInsightText();
    // Discord doesn't have a direct share URL, so we copy to clipboard with Discord formatting
    const discordText = text.replace(/\*\*(.*?)\*\*/g, '**$1**').replace(/\n/g, '\n');
    
    navigator.clipboard.writeText(discordText).then(() => {
      toast({
        title: "Copied for Discord",
        description: "Content copied! Paste it in your Discord channel.",
      });
    });
  };

  const getInsightIcon = () => {
    switch (insight.type) {
      case 'trade': return <TrendingUp className="w-5 h-5 text-green-500" />;
      case 'pool': return <DollarSign className="w-5 h-5 text-blue-500" />;
      case 'farm': return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'analysis': return <TrendingUp className="w-5 h-5 text-orange-500" />;
      default: return <Share2 className="w-5 h-5" />;
    }
  };

  const getInsightColor = () => {
    switch (insight.type) {
      case 'trade': return 'bg-green-100 dark:bg-green-900 border-green-200 dark:border-green-800';
      case 'pool': return 'bg-blue-100 dark:bg-blue-900 border-blue-200 dark:border-blue-800';
      case 'farm': return 'bg-purple-100 dark:bg-purple-900 border-purple-200 dark:border-purple-800';
      case 'analysis': return 'bg-orange-100 dark:bg-orange-900 border-orange-200 dark:border-orange-800';
      default: return 'bg-gray-100 dark:bg-gray-900 border-gray-200 dark:border-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Trading Insight
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Insight Preview */}
          <Card className={`${getInsightColor()}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                {getInsightIcon()}
                <div className="flex-1">
                  <h3 className="font-semibold text-sm">{insight.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{insight.description}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {insight.data.tokenA && (
                      <Badge variant="secondary" className="text-xs">
                        {insight.data.tokenA}
                      </Badge>
                    )}
                    {insight.data.amount && (
                      <Badge variant="outline" className="text-xs">
                        {insight.data.amount}
                      </Badge>
                    )}
                    {insight.data.apy && (
                      <Badge variant="outline" className="text-xs text-green-600">
                        {insight.data.apy}% APR
                      </Badge>
                    )}
                    {insight.performance && (
                      <Badge variant="outline" className="text-xs text-blue-600">
                        {insight.performance.roi}% ROI
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Custom Message */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Custom Message (Optional)</label>
            <Textarea
              placeholder="Add your own commentary or insights..."
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
              className="min-h-[80px]"
              maxLength={280}
            />
            <div className="text-xs text-muted-foreground text-right">
              {customMessage.length}/280 characters
            </div>
          </div>

          {/* Social Media Buttons */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Share on:</h4>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                onClick={shareToTwitter}
              >
                <Twitter className="w-4 h-4 text-blue-500" />
                Twitter
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 dark:bg-blue-950 dark:hover:bg-blue-900 border-blue-200 dark:border-blue-800"
                onClick={shareToTelegram}
              >
                <Send className="w-4 h-4 text-blue-500" />
                Telegram
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950 dark:hover:bg-indigo-900 border-indigo-200 dark:border-indigo-800"
                onClick={shareToDiscord}
              >
                <MessageCircle className="w-4 h-4 text-indigo-500" />
                Discord
              </Button>
              
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={copyToClipboard}
              >
                <Copy className="w-4 h-4" />
                Copy Link
              </Button>
            </div>
          </div>

          {/* Preview Text */}
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Preview:</h4>
            <div className="bg-muted/50 rounded-lg p-3 text-xs text-muted-foreground border">
              <pre className="whitespace-pre-wrap font-mono">
                {generateInsightText().substring(0, 200)}
                {generateInsightText().length > 200 && '...'}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Quick Share Button Component
interface QuickShareButtonProps {
  insight: TradingInsight;
  size?: 'sm' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function QuickShareButton({ insight, size = 'sm', variant = 'ghost' }: QuickShareButtonProps) {
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  return (
    <>
      <Button
        variant={variant}
        size={size}
        onClick={() => setIsShareModalOpen(true)}
        className="flex items-center gap-2"
      >
        <Share2 className="w-4 h-4" />
        Share
      </Button>
      
      <SocialSharing
        insight={insight}
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
      />
    </>
  );
}