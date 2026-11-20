"""Thread-safe bounded LRU dictionary to prevent memory leakage under high load."""

from collections import OrderedDict
import threading
from typing import TypeVar, Generic, Optional, Any, List, Tuple

K = TypeVar("K")
V = TypeVar("V")


class BoundedLRUDict(Generic[K, V]):
    """Thread-safe bounded in-memory store with LRU eviction."""

    def __init__(self, maxsize: int = 2000):
        self._maxsize = maxsize
        self._data: OrderedDict[K, V] = OrderedDict()
        self._lock = threading.Lock()

    def __setitem__(self, key: K, value: V) -> None:
        with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
            self._data[key] = value
            if len(self._data) > self._maxsize:
                self._data.popitem(last=False)

    def __getitem__(self, key: K) -> V:
        with self._lock:
            val = self._data[key]
            self._data.move_to_end(key)
            return val

    def get(self, key: K, default: Optional[V] = None) -> Optional[V]:
        with self._lock:
            if key in self._data:
                self._data.move_to_end(key)
                return self._data[key]
            return default

    def __contains__(self, key: K) -> bool:
        with self._lock:
            return key in self._data

    def __len__(self) -> int:
        with self._lock:
            return len(self._data)

    def clear(self) -> None:
        with self._lock:
            self._data.clear()

    def keys(self) -> List[K]:
        with self._lock:
            return list(self._data.keys())

    def values(self) -> List[V]:
        with self._lock:
            return list(self._data.values())

    def items(self) -> List[Tuple[K, V]]:
        with self._lock:
            return list(self._data.items())
