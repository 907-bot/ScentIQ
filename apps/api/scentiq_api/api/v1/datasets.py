"""Datasets and scientific provenance endpoints."""

from fastapi import APIRouter
from scentiq_ml.data.ontology import ODORNET_12_CATEGORIES
from scentiq_api.schemas.datasets import DatasetsListResponse, DatasetMetadata

router = APIRouter(prefix="/datasets", tags=["Datasets"])


@router.get("", response_model=DatasetsListResponse)
async def list_datasets():
    datasets = [
        DatasetMetadata(
            id="odornet",
            name="OdorNet Aligned Multi-Label Benchmark",
            version="1.0.0",
            source_url="https://github.com/NKU-DOIE/OdorNet",
            doi="10.5281/zenodo.19838455",
            license="CC BY 4.0",
            molecule_count=8892,
            categories_count=12,
            description="Primary standardized single-molecule multi-label dataset with 12 broad categories and fixed stereochemistry-safe 7:2:1 partitions.",
            ontology=ODORNET_12_CATEGORIES,
            split_info={
                "train_rows": 6224,
                "validation_rows": 1778,
                "test_rows": 890,
                "missing_label_policy": "Drop / masked multi-label BCE loss"
            },
            data_card_url="/docs/data_cards/ODORNET_DATA_CARD.md"
        ),
        DatasetMetadata(
            id="openpom-curated",
            name="OpenPOM Curated Reference Dataset",
            version="2023-curated",
            source_url="https://github.com/BioMachineLearning/openpom",
            doi="10.1126/science.ade4401",
            license="MIT (Code) / CC-BY (Data)",
            molecule_count=4983,
            categories_count=51,
            description="Replication dataset for the Principal Odor Map work, used as a reference benchmark with 5-fold cross-validation.",
            ontology=["fruity", "floral", "woody", "sweet", "green", "minty", "etc. (51 descriptors)"],
            split_info={"folds": 5, "ensemble_size": 10},
            data_card_url="/docs/data_cards/OPENPOM_DATA_CARD.md"
        ),
        DatasetMetadata(
            id="pyrfume-data",
            name="Pyrfume Olfactory Psychophysics Archive",
            version="2024-archive",
            source_url="https://github.com/pyrfume/pyrfume-data",
            doi="10.1038/s41597-024-04051-z",
            license="Non-commercial / Study specific",
            molecule_count=3500,
            categories_count=146,
            description="Harmonized olfactory psychophysics archive documenting human perceptual evaluations, concentration studies, and mixture data.",
            ontology=["Bushdid 2014 mixtures", "Dravnieks 1985 atlas", "Keller 2017 DREAM"],
            split_info={"study_count": 42},
            data_card_url="/docs/data_cards/PYRFUME_DATA_CARD.md"
        ),
        DatasetMetadata(
            id="dream-mixture-2025",
            name="DREAM Olfactory Mixture Profile Reference",
            version="2025-v1",
            source_url="https://github.com/Satarifard/Olfactory-Mixtures-Prediction-2025",
            doi="10.1021/acsomega.4c10924",
            license="Research evaluation only",
            molecule_count=650,
            categories_count=51,
            description="Multi-component mixtures with 2, 3, 5, or 10 odorant components and concentration-dependent RATA ratings.",
            ontology=["51 RATA odor profile terms"],
            split_info={"mixture_count": 650, "components_pool": 145},
            data_card_url="/docs/data_cards/DREAM_MIXTURES_DATA_CARD.md"
        )
    ]
    return DatasetsListResponse(datasets=datasets)
