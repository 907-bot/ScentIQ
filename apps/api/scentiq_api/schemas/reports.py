"""Pydantic schemas for research report exports."""

from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field


class CreateReportRequest(BaseModel):
    molecule_id: str
    prediction_id: str
    report_title: Optional[str] = "ScentIQ Molecular Olfaction Research Report"
    notes: Optional[str] = None


class ReportResponse(BaseModel):
    report_id: str
    title: str
    created_at: str
    molecule: Dict[str, Any]
    prediction: Dict[str, Any]
    uncertainty: Dict[str, Any]
    citations: List[Dict[str, str]]
    scientific_disclaimer: str
    format_urls: Dict[str, str]
