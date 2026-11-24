"""Main FastAPI entrypoint for ScentIQ Computational Olfaction Platform."""

import logging
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from scentiq_api.core.config import settings
from scentiq_api.core.errors import (
    ScentIQException,
    scentiq_exception_handler,
    general_http_exception_handler,
    unhandled_exception_handler
)
from scentiq_api.api.v1 import api_v1_router
from scentiq_ml.models import ModelRegistry

# Logging configuration
logging.basicConfig(level=settings.log_level, format="%(asctime)s [%(levelname)s] %(name)s: %(message)s")
logger = logging.getLogger("scentiq_api")

app = FastAPI(
    title="ScentIQ Computational Olfaction API",
    description=(
        "Software-only research platform for molecular odor prediction, stereochemistry validation, "
        "model explainability, calibrated uncertainty, and blend modeling."
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_origin_regex=r".*",
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Exception handlers
app.add_exception_handler(ScentIQException, scentiq_exception_handler)
app.add_exception_handler(HTTPException, general_http_exception_handler)
app.add_exception_handler(Exception, unhandled_exception_handler)

# Mount API v1 router
app.include_router(api_v1_router, prefix=settings.api_prefix)


@app.on_event("startup")
async def startup_event():
    logger.info("Starting ScentIQ API...")
    # Initialize Model Registry
    ModelRegistry.get_instance()
    logger.info("ModelRegistry successfully initialized with trained baselines and GNN.")


@app.get("/")
async def root():
    return {
        "project": "ScentIQ",
        "description": "Computational Olfaction and Molecular Odor Intelligence Platform",
        "version": settings.app_version,
        "cors_status": "enabled_for_all_origins",
        "docs": "/docs",
        "api_v1": f"{settings.api_prefix}/health"
    }
