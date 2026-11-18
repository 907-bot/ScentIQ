"""Report service generating exportable research documentation with scientific provenance."""

import datetime
import uuid
from typing import Dict, Any, Optional
from scentiq_api.schemas.reports import CreateReportRequest, ReportResponse
from scentiq_api.schemas.molecules import MoleculeResponse
from scentiq_api.schemas.predictions import SinglePredictionResponse
from scentiq_api.core.errors import ScentIQException


class ReportService:
    """Manages report compilation, citation assembly, and export formatting."""

    def __init__(self):
        self.reports_store: Dict[str, ReportResponse] = {}

    def create_report(
        self,
        request: CreateReportRequest,
        molecule: MoleculeResponse,
        prediction: SinglePredictionResponse
    ) -> ReportResponse:
        report_id = f"rep_{uuid.uuid4().hex[:12]}"
        now_iso = datetime.datetime.now(datetime.timezone.utc).isoformat()

        citations = [
            {
                "title": "OdorNet: A benchmark dataset and chemical platform for computational olfaction",
                "authors": "NKU-DOIE",
                "doi": "10.5281/zenodo.19838455",
                "license": "CC BY 4.0",
                "url": "https://zenodo.org/records/19838455"
            },
            {
                "title": "A Principal Odor Map Unifies Diverse Tasks in Human Olfactory Perception",
                "authors": "Lee et al.",
                "doi": "10.1126/science.ade4401",
                "year": "2023",
                "url": "https://doi.org/10.1126/science.ade4401"
            },
            {
                "title": "PubChem PUG REST: API for Chemical Information Access",
                "authors": "NCBI",
                "url": "https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest"
            }
        ]

        disclaimer = (
            "SCIENTIFIC USE DISCLAIMER: ScentIQ is a computational olfaction research environment. "
            "All predicted odor categories and scores are derived in silico from trained machine-learning models "
            "evaluated on historical scientific datasets. ScentIQ does not physically smell or chemically test "
            "physical samples, and must not be used as a substitute for sensory evaluation, medical assessment, "
            "toxicology profiling, or regulatory compliance."
        )

        response = ReportResponse(
            report_id=report_id,
            title=request.report_title or "ScentIQ Molecular Olfaction Research Report",
            created_at=now_iso,
            molecule=molecule.model_dump(),
            prediction=prediction.model_dump(),
            uncertainty=prediction.uncertainty.model_dump(),
            citations=citations,
            scientific_disclaimer=disclaimer,
            format_urls={
                "json": f"/api/v1/reports/{report_id}?format=json",
                "markdown": f"/api/v1/reports/{report_id}?format=markdown"
            }
        )

        self.reports_store[report_id] = response
        return response

    def get_report(self, report_id: str) -> Optional[ReportResponse]:
        return self.reports_store.get(report_id)
