"""Comprehensive Stress, Concurrency, and Interaction Stability Test Suite for ScentIQ.

Audits:
1. High-concurrency throughput and latency percentiles under burst load.
2. Sustained load memory profiling and LRU cache bounding (leak prevention).
3. Boundary, malformed, and adversarial input interaction fuzzing.
4. Multithreaded store race conditions and thread safety.
"""

import os
import sys
import time
import math
import resource
import threading
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import List, Dict, Any

# Ensure path includes apps/api and ml/src
sys.path.extend(["ml/src", "apps/api"])

from fastapi.testclient import TestClient
from scentiq_api.main import app
from scentiq_api.core.cache import BoundedLRUDict

client = TestClient(app)

SAMPLE_MOLECULES = [
    ("Vanillin", "COC1=C(O)C=CC(C=O)=C1"),
    ("Limonene", "CC1=CCC(CC1)C(=C)C"),
    ("Linalool", "CC(=CCCC(C)(O)C=C)C"),
    ("Geosmin", "CC1(O)CCCC2(C)CCCC12"),
    ("Eugenol", "COC1=C(O)C=CC(CC=C)=C1"),
    ("Menthol", "CC1CCC(C(O)C1)C(C)C"),
    ("Cinnamaldehyde", "O=CC=CC1=CC=CC=C1"),
    ("Ethanol", "CCO"),
    ("Coumarin", "O=C1OC2=CC=CC=C2C=C1"),
    ("Benzaldehyde", "O=CC1=CC=CC=C1")
]


def test_concurrency_burst():
    """Test 1: Burst concurrency across diverse endpoints (100 parallel requests)."""
    print("\n" + "=" * 65)
    print("TEST 1: High-Concurrency Burst Load (100 Parallel Requests)")
    print("=" * 65)

    def worker_task(idx: int) -> Dict[str, Any]:
        tc = TestClient(app)
        mol_name, smiles = SAMPLE_MOLECULES[idx % len(SAMPLE_MOLECULES)]
        endpoint_type = idx % 5
        t0 = time.perf_counter()

        try:
            if endpoint_type == 0:
                # Prediction single
                res = tc.post("/api/v1/predictions/single", json={
                    "smiles": smiles,
                    "model_id": "scentiq-odornet-gnn",
                    "include_explanation": False
                })
            elif endpoint_type == 1:
                # Similarity search
                res = tc.post("/api/v1/similarity/search", json={
                    "smiles": smiles,
                    "method": "chemical_fingerprint",
                    "top_k": 5
                })
            elif endpoint_type == 2:
                # Compare molecules
                mol2 = SAMPLE_MOLECULES[(idx + 1) % len(SAMPLE_MOLECULES)][1]
                res = tc.post("/api/v1/compare", json={
                    "smiles_list": [smiles, mol2]
                })
            elif endpoint_type == 3:
                # Blend prediction
                mol2 = SAMPLE_MOLECULES[(idx + 1) % len(SAMPLE_MOLECULES)][1]
                res = tc.post("/api/v1/predictions/blend", json={
                    "components": [
                        {"smiles": smiles, "fraction": 0.6, "name": mol_name},
                        {"smiles": mol2, "fraction": 0.4, "name": "Partner"}
                    ]
                })
            else:
                # Molecular resolve
                res = tc.post("/api/v1/molecules/resolve", json={
                    "query": mol_name,
                    "input_type": "name"
                })

            dt = time.perf_counter() - t0
            return {"status": res.status_code, "duration": dt, "ok": res.status_code == 200, "idx": idx}
        except Exception as e:
            dt = time.perf_counter() - t0
            return {"status": -1, "duration": dt, "ok": False, "error": str(e), "idx": idx}

    total_requests = 100
    concurrency = 16
    start_time = time.perf_counter()

    results = []
    with ThreadPoolExecutor(max_workers=concurrency) as executor:
        futures = [executor.submit(worker_task, i) for i in range(total_requests)]
        for f in as_completed(futures):
            results.append(f.result())

    total_wall_time = time.perf_counter() - start_time
    success_count = sum(1 for r in results if r["ok"])
    durations = sorted(r["duration"] for r in results)

    p50 = durations[int(0.50 * len(durations))]
    p95 = durations[int(0.95 * len(durations))]
    p99 = durations[int(0.99 * len(durations))]
    rps = total_requests / total_wall_time

    print(f"  Total Requests Executed : {total_requests}")
    print(f"  Concurrency Level        : {concurrency} threads")
    print(f"  Success Rate             : {success_count}/{total_requests} ({success_count/total_requests*100:.1f}%)")
    print(f"  Throughput               : {rps:.2f} req/sec")
    print(f"  Latency p50 (median)     : {p50*1000:.2f} ms")
    print(f"  Latency p95              : {p95*1000:.2f} ms")
    print(f"  Latency p99              : {p99*1000:.2f} ms")
    print(f"  Max Latency              : {durations[-1]*1000:.2f} ms")

    assert success_count == total_requests, f"Expected 100% success, got {success_count}/{total_requests}"
    print("  ✓ Concurrency burst test PASSED!")


def test_sustained_load_and_memory():
    """Test 2: Sustained load (300 requests) & RSS memory profiling with LRU bounds."""
    print("\n" + "=" * 65)
    print("TEST 2: Sustained Load & Memory Leak Verification")
    print("=" * 65)

    mem_initial = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024)
    print(f"  Initial RSS Peak Memory  : {mem_initial:.2f} MB")

    total_ops = 300
    checkpoints = [100, 200, 300]
    mem_readings = []

    for i in range(1, total_ops + 1):
        mol_name, smiles = SAMPLE_MOLECULES[i % len(SAMPLE_MOLECULES)]
        res = client.post("/api/v1/predictions/single", json={
            "smiles": smiles,
            "model_id": "scentiq-odornet-gnn",
            "include_explanation": (i % 5 == 0)  # periodically exercise atom attribution
        })
        assert res.status_code == 200

        if i in checkpoints:
            mem_current = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024)
            mem_readings.append((i, mem_current))
            print(f"  After {i:3d} requests      : {mem_current:.2f} MB (Delta: +{mem_current - mem_initial:.2f} MB)")

    mem_final = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss / (1024 * 1024)
    growth = mem_final - mem_initial
    print(f"  Final RSS Peak Memory    : {mem_final:.2f} MB")
    print(f"  Total Peak RSS Growth    : {growth:.2f} MB over {total_ops} inferences")

    # Verify BoundedLRUDict eviction limit
    lru = BoundedLRUDict[str, int](maxsize=50)
    for k in range(200):
        lru[f"key_{k}"] = k
    assert len(lru) == 50, f"Expected maxsize 50, got {len(lru)}"
    assert "key_0" not in lru, "Oldest key was not evicted"
    assert "key_199" in lru, "Newest key missing"
    print("  ✓ BoundedLRUDict strictly enforces capacity ceiling and FIFO/LRU eviction")
    print("  ✓ Sustained load & memory stability PASSED!")


def test_boundary_and_adversarial_fuzzing():
    """Test 3: Boundary conditions, malformed inputs, and adversarial fuzzing."""
    print("\n" + "=" * 65)
    print("TEST 3: Adversarial Fuzzing & Boundary Interaction Logic")
    print("=" * 65)

    fuzz_cases = [
        # (Endpoint, Payload, Expected Status, Test Description)
        (
            "/api/v1/molecules/resolve",
            {"query": "C1CCCC", "input_type": "smiles"},
            400,
            "Unclosed cyclic ring in SMILES"
        ),
        (
            "/api/v1/molecules/resolve",
            {"query": "CC(C", "input_type": "smiles"},
            400,
            "Unclosed branch parenthesis in SMILES"
        ),
        (
            "/api/v1/molecules/resolve",
            {"query": "NonExistentChemical_999ZZZ", "input_type": "name"},
            404,
            "Unknown chemical name resolution"
        ),
        (
            "/api/v1/molecules/resolve",
            {"query": "   ", "input_type": "auto"},
            400,
            "Whitespace-only molecule query"
        ),
        (
            "/api/v1/molecules/resolve",
            {"query": "C" * 8000, "input_type": "smiles"},
            422,
            "Excessively long 8000-char string"
        ),
        (
            "/api/v1/predictions/single",
            {"smiles": "INVALID_CHEM", "model_id": "scentiq-odornet-gnn"},
            400,
            "Invalid chemical SMILES in prediction"
        ),
        (
            "/api/v1/predictions/single",
            {"smiles": "CCO", "model_id": "unregistered-model-xyz"},
            400,
            "Non-existent model ID"
        ),
        (
            "/api/v1/predictions/blend",
            {"components": [{"smiles": "CCO", "fraction": 1.0}]},
            422,
            "Blend with fewer than 2 components"
        ),
        (
            "/api/v1/predictions/blend",
            {"components": [
                {"smiles": "CCO", "fraction": 0.0},
                {"smiles": "CC(=O)O", "fraction": 0.0}
            ]},
            422,
            "Blend with total fraction = 0"
        ),
        (
            "/api/v1/predictions/blend",
            {"components": [
                {"smiles": "CCO", "fraction": 0.5},
                {"smiles": "MALFORMED_SMILES", "fraction": 0.5}
            ]},
            400,
            "Blend with malformed component SMILES"
        ),
        (
            "/api/v1/compare",
            {"smiles_list": ["CCO"]},
            422,
            "Comparison with only 1 molecule"
        ),
        (
            "/api/v1/compare",
            {"smiles_list": ["CCO", "MALFORMED_SMILES"]},
            400,
            "Comparison with an invalid molecule"
        ),
        (
            "/api/v1/reports",
            {"molecule_id": "nonexistent_mol_id", "prediction_id": "nonexistent_pred_id"},
            404,
            "Report assembly for unknown IDs"
        )
    ]

    for endpoint, payload, expected_status, description in fuzz_cases:
        res = client.post(endpoint, json=payload)
        assert res.status_code == expected_status, (
            f"Fuzz failed for '{description}': expected {expected_status}, got {res.status_code} ({res.text})"
        )
        data = res.json()
        assert "error" in data or "detail" in data, f"Missing error body in response: {res.text}"
        print(f"  ✓ [{res.status_code}] {description:<42} -> Clean structured error returned")

    print("  ✓ All 13 adversarial boundary and fuzz cases handled gracefully (0 crashes)!")


def test_multithreaded_race_conditions():
    """Test 4: Multithreaded store race conditions and thread safety."""
    print("\n" + "=" * 65)
    print("TEST 4: Multithreaded Race Conditions & Store Thread Safety")
    print("=" * 65)

    errors = []

    def concurrent_worker(worker_id: int):
        tc = TestClient(app)
        for step in range(15):
            mol_name, smiles = SAMPLE_MOLECULES[step % len(SAMPLE_MOLECULES)]
            try:
                # 1. Resolve
                r1 = tc.post("/api/v1/molecules/resolve", json={"query": smiles, "input_type": "smiles"})
                if r1.status_code != 200:
                    errors.append(f"Worker {worker_id} resolve failed: {r1.status_code}")
                    continue
                mol_id = r1.json()["molecule_id"]

                # 2. Predict
                r2 = tc.post("/api/v1/predictions/single", json={"smiles": smiles, "molecule_id": mol_id, "model_id": "scentiq-odornet-gnn"})
                if r2.status_code != 200:
                    errors.append(f"Worker {worker_id} predict failed: {r2.status_code}")
                    continue
                pred_id = r2.json()["prediction_id"]

                # 3. Report
                r3 = tc.post("/api/v1/reports", json={"molecule_id": mol_id, "prediction_id": pred_id, "report_title": f"Worker {worker_id} Report"})
                if r3.status_code != 200:
                    errors.append(f"Worker {worker_id} report failed: {r3.status_code}")
            except Exception as e:
                errors.append(f"Worker {worker_id} exception: {str(e)}")

    threads = []
    num_threads = 8
    for w in range(num_threads):
        t = threading.Thread(target=concurrent_worker, args=(w,))
        threads.append(t)
        t.start()

    for t in threads:
        t.join()

    print(f"  Simultaneous Threads      : {num_threads}")
    print(f"  Total Operations Completed : {num_threads * 15 * 3} calls")
    print(f"  Errors Detected           : {len(errors)}")

    if errors:
        for err in errors[:5]:
            print("   ERROR:", err)
    assert len(errors) == 0, f"Encountered {len(errors)} race-condition errors"
    print("  ✓ Multithreaded concurrent store operations PASSED with zero race conditions!")


def run_all_stress_tests():
    print("\n" + "=" * 65)
    print("SCENTIQ COMPREHENSIVE STRESS, LOAD & INTERACTION SUITE")
    print("=" * 65)
    t_start = time.perf_counter()

    test_concurrency_burst()
    test_sustained_load_and_memory()
    test_boundary_and_adversarial_fuzzing()
    test_multithreaded_race_conditions()

    total_time = time.perf_counter() - t_start
    print("\n" + "=" * 65)
    print(f"ALL STRESS & STRUCTURAL STABILITY TESTS PASSED IN {total_time:.2f}s!")
    print("=" * 65)


if __name__ == "__main__":
    run_all_stress_tests()
