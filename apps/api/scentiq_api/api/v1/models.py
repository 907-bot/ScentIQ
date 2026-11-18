"""Model registry and cards endpoint."""

from typing import List, Dict, Any
from fastapi import APIRouter
from scentiq_ml.models import ModelRegistry

router = APIRouter(prefix="/models", tags=["Models"])

registry = ModelRegistry.get_instance()


@router.get("")
async def list_models() -> List[Dict[str, Any]]:
    models = registry.list_models()
    return [
        {
            "id": m.id,
            "name": m.name,
            "version": m.version,
            "task": m.task,
            "dataset_name": m.dataset_name,
            "dataset_version": m.dataset_version,
            "status": m.status,
            "description": m.description,
            "supported_labels": m.supported_labels,
            "input_type": m.input_type,
            "metrics": m.metrics,
            "limitations": m.limitations,
            "model_card_url": f"/docs/model_cards/{m.id.upper().replace('-', '_')}_MODEL_CARD.md"
        }
        for m in models
    ]
