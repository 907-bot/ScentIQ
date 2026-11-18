"""Molecular Graph Neural Network (MPNN/GNN) for multi-label odor prediction."""

from typing import List, Dict, Optional, Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F
from rdkit import Chem

from scentiq_ml.chemistry.featurizer import mol_to_graph_data
from scentiq_ml.data.ontology import ODORNET_12_CATEGORIES


class GraphConvLayer(nn.Module):
    """Message passing graph convolutional layer with residual connections and layer norm."""

    def __init__(self, in_dim: int, out_dim: int):
        super().__init__()
        self.msg_linear = nn.Linear(in_dim, out_dim)
        self.update_linear = nn.Linear(in_dim + out_dim, out_dim)
        self.norm = nn.LayerNorm(out_dim)
        self.residual = nn.Linear(in_dim, out_dim) if in_dim != out_dim else nn.Identity()

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> torch.Tensor:
        num_nodes = x.size(0)
        res = self.residual(x)

        if edge_index.size(1) == 0:
            # Graph with no edges (e.g. single atom)
            out = F.relu(self.update_linear(torch.cat([x, torch.zeros_like(res)], dim=-1)))
            return self.norm(out + res)

        src, dst = edge_index[0], edge_index[1]
        msg = self.msg_linear(x[src])

        # Aggregate messages at destination nodes
        agg = torch.zeros(num_nodes, msg.size(1), device=x.device)
        agg.index_add_(0, dst, msg)

        # Update node representation
        update_input = torch.cat([x, agg], dim=-1)
        out = F.relu(self.update_linear(update_input))
        return self.norm(out + res)


class MolecularGNN(nn.Module):
    """
    Graph Neural Network for molecular odor prediction.
    Featurizes molecules into 2D/3D-aware atom & bond graphs, performs
    message passing, global pooling, and multi-label classification.
    """

    def __init__(
        self,
        node_in_dim: int = 29,
        hidden_dim: int = 128,
        num_layers: int = 3,
        num_labels: int = 12,
        labels: Optional[List[str]] = None
    ):
        super().__init__()
        self.labels = labels or ODORNET_12_CATEGORIES
        self.model_id = "scentiq-odornet-gnn"
        self.model_version = "0.1.0"
        self.task = "single_molecule_odor_multilabel"
        self.dataset_name = "OdorNet"

        self.input_proj = nn.Linear(node_in_dim, hidden_dim)
        self.conv_layers = nn.ModuleList([
            GraphConvLayer(hidden_dim, hidden_dim) for _ in range(num_layers)
        ])

        # Readout: Mean + Max pooling -> hidden_dim * 2
        self.classifier = nn.Sequential(
            nn.Linear(hidden_dim * 2, hidden_dim),
            nn.ReLU(),
            nn.Dropout(0.15),
            nn.Linear(hidden_dim, num_labels)
        )

    def forward(self, x: torch.Tensor, edge_index: torch.Tensor) -> Tuple[torch.Tensor, torch.Tensor]:
        """
        Forward pass.
        Returns:
            logits: [1, num_labels]
            molecular_embedding: [1, hidden_dim * 2] (for similarity search and odor maps)
        """
        h = F.relu(self.input_proj(x))
        for layer in self.conv_layers:
            h = layer(h, edge_index)

        # Global pooling
        mean_pool = h.mean(dim=0, keepdim=True)
        max_pool = h.max(dim=0, keepdim=True)[0]
        mol_embedding = torch.cat([mean_pool, max_pool], dim=-1)

        logits = self.classifier(mol_embedding)
        return logits, mol_embedding

    def predict_scores(self, mol: Chem.Mol) -> Tuple[Dict[str, float], List[float]]:
        """Predict scores and return molecular embedding."""
        self.eval()
        with torch.no_grad():
            x, edge_index, _ = mol_to_graph_data(mol)
            logits, embedding = self.forward(x, edge_index)
            probs = torch.sigmoid(logits).squeeze(0).cpu().numpy()
            emb_list = embedding.squeeze(0).cpu().numpy().tolist()

        scores = {label: round(float(probs[i]), 4) for i, label in enumerate(self.labels)}
        return scores, emb_list


def compute_masked_bce_loss(logits: torch.Tensor, targets: torch.Tensor, mask: torch.Tensor) -> torch.Tensor:
    """
    Masked binary cross-entropy loss that strictly evaluates observed labels
    and skips unobserved/NaN annotations per OdorNet data dictionary.
    """
    if not mask.any():
        return torch.tensor(0.0, requires_grad=True, device=logits.device)
    loss = F.binary_cross_entropy_with_logits(logits[mask], targets[mask])
    return loss
