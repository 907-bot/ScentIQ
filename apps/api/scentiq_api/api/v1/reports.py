"""Report generation and export endpoints."""

from fastapi import APIRouter
from scentiq_api.schemas.reports import CreateReportRequest, ReportResponse
from scentiq_api.services.chemistry_service import ChemistryService
from scentiq_api.services.prediction_service import PredictionService
from scentiq_api.services.report_service import ReportService
from scentiq_ml.models import ModelRegistry
from scentiq_api.core.errors import ScentIQException

router = APIRouter(prefix="/reports", tags=["Reports"])

chem_service = ChemistryService()
pred_service = PredictionService(ModelRegistry.get_instance())
report_service = ReportService()


@router.post("", response_model=ReportResponse)
async def create_report(request: CreateReportRequest):
    mol = chem_service.get_molecule_by_id(request.molecule_id)
    if not mol:
        raise ScentIQException(code="MOLECULE_NOT_FOUND", message=f"Molecule '{request.molecule_id}' not found.", status_code=404)

    pred = pred_service.get_prediction_by_id(request.prediction_id)
    if not pred:
        raise ScentIQException(code="PREDICTION_NOT_FOUND", message=f"Prediction '{request.prediction_id}' not found.", status_code=404)

    return report_service.create_report(request=request, molecule=mol, prediction=pred)


@router.get("/{report_id}", response_model=ReportResponse)
async def get_report(report_id: str):
    rep = report_service.get_report(report_id)
    if not rep:
        raise ScentIQException(code="REPORT_NOT_FOUND", message=f"Report '{report_id}' not found.", status_code=404)
    return rep
