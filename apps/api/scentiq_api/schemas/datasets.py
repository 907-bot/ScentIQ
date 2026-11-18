"""Pydantic schemas for datasets and model cards."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel


class DatasetMetadata(BaseModel):
    id: str
    name: str
    version: str
    source_url: str
    doi: Optional[str] = None
    license: str
    molecule_count: int
    categories_count: int
    description: str
    ontology: List[str]
    split_info: Dict[str, Any]
    data_card_url: str


class DatasetsListResponse(BaseModel):
    datasets: List[DatasetMetadata]
