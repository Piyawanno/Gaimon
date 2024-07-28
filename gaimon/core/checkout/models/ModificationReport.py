from typing import List

from gaimon.core.checkout.models.AnalyzedModification import AnalyzedModification


class ModificationReport:
    def __init__(self, version: str, analyzed: List[AnalyzedModification]) -> None:
        self.version = version
        self.analyzed = analyzed
