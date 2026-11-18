import React, { useState, useEffect } from 'react';
import { AppShell, WorkspaceId } from './components/AppShell';
import { OverviewPage } from './pages/OverviewPage';
import { MolecularLabPage } from './pages/MolecularLabPage';
import { PredictionPage } from './pages/PredictionPage';
import { ExplainabilityPage } from './pages/ExplainabilityPage';
import { SimilarityPage } from './pages/SimilarityPage';
import { BlendStudioPage } from './pages/BlendStudioPage';
import { OdorMapPage } from './pages/OdorMapPage';
import { CompareLabPage } from './pages/CompareLabPage';
import { ResearchConsolePage } from './pages/ResearchConsolePage';
import { ReportsPage } from './pages/ReportsPage';
import { Molecule, SinglePrediction } from './types';
import { api } from './services/api';

export const App: React.FC = () => {
  const [activeWorkspace, setActiveWorkspace] = useState<WorkspaceId>('overview');
  const [currentMolecule, setCurrentMolecule] = useState<Molecule | null>(null);
  const [prediction, setPrediction] = useState<SinglePrediction | null>(null);

  // Load a rich default molecule on startup (Vanillin) so all workspaces are immediately interactive
  useEffect(() => {
    const initDefault = async () => {
      try {
        const mol = await api.resolveMolecule('Vanillin', 'name');
        setCurrentMolecule(mol);
        const pred = await api.predictMolecule({
          smiles: mol.canonical_smiles,
          molecule_id: mol.molecule_id,
          model_id: 'scentiq-odornet-gnn'
        });
        setPrediction(pred);
      } catch (e) {
        console.error('Failed to load initial molecule:', e);
      }
    };
    initDefault();
  }, []);

  const handleSelectSample = async (smiles: string) => {
    try {
      const mol = await api.validateMolecule(smiles);
      setCurrentMolecule(mol);
      const pred = await api.predictMolecule({
        smiles: mol.canonical_smiles,
        molecule_id: mol.molecule_id,
        model_id: 'scentiq-odornet-gnn'
      });
      setPrediction(pred);
    } catch (e) {
      console.error('Error loading sample molecule:', e);
    }
  };

  const handleQuickSearch = async (query: string) => {
    try {
      const mol = await api.resolveMolecule(query, 'auto');
      setCurrentMolecule(mol);
      const pred = await api.predictMolecule({
        smiles: mol.canonical_smiles,
        molecule_id: mol.molecule_id,
        model_id: 'scentiq-odornet-gnn'
      });
      setPrediction(pred);
    } catch (e) {
      console.error('Search error:', e);
    }
  };

  return (
    <AppShell
      activeWorkspace={activeWorkspace}
      onSelectWorkspace={setActiveWorkspace}
      onQuickSearch={handleQuickSearch}
    >
      {activeWorkspace === 'overview' && (
        <OverviewPage
          onNavigate={setActiveWorkspace}
          onSelectSample={handleSelectSample}
        />
      )}

      {activeWorkspace === 'molecular-lab' && (
        <MolecularLabPage
          currentMolecule={currentMolecule}
          onMoleculeLoaded={(mol) => {
            setCurrentMolecule(mol);
            setPrediction(null);
          }}
          onNavigateToPrediction={() => setActiveWorkspace('prediction')}
          onNavigateToSimilarity={() => setActiveWorkspace('similarity')}
        />
      )}

      {activeWorkspace === 'prediction' && (
        <PredictionPage
          currentMolecule={currentMolecule}
          prediction={prediction}
          onPredictionComplete={setPrediction}
          onNavigateToExplainability={() => setActiveWorkspace('explainability')}
          onNavigateToReports={() => setActiveWorkspace('reports')}
        />
      )}

      {activeWorkspace === 'explainability' && (
        <ExplainabilityPage
          currentMolecule={currentMolecule}
          prediction={prediction}
          onUpdatePrediction={setPrediction}
        />
      )}

      {activeWorkspace === 'similarity' && (
        <SimilarityPage
          currentMolecule={currentMolecule}
          onSelectMolecule={(smi) => {
            handleSelectSample(smi);
            setActiveWorkspace('molecular-lab');
          }}
        />
      )}

      {activeWorkspace === 'blend-studio' && (
        <BlendStudioPage />
      )}

      {activeWorkspace === 'odor-map' && (
        <OdorMapPage
          onSelectMolecule={(smi) => {
            handleSelectSample(smi);
            setActiveWorkspace('molecular-lab');
          }}
        />
      )}

      {activeWorkspace === 'compare' && (
        <CompareLabPage />
      )}

      {activeWorkspace === 'research-console' && (
        <ResearchConsolePage />
      )}

      {activeWorkspace === 'reports' && (
        <ReportsPage
          currentMolecule={currentMolecule}
          prediction={prediction}
        />
      )}
    </AppShell>
  );
};

export default App;
