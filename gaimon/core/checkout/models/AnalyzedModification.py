from typing import List
from xerial.Exception.ModificationException import ModificationException


class AnalyzedModification:
    def __init__(self, description: str, exceptions: List[ModificationException]) -> None:
        self.description = description
        self.exceptions = exceptions
