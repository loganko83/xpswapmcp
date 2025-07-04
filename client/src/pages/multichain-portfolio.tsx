import { Layout } from '@/components/Layout';
import { MultiChainPortfolio } from '@/components/MultiChainPortfolio';

export default function MultiChainPortfolioPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <MultiChainPortfolio />
      </div>
    </Layout>
  );
}