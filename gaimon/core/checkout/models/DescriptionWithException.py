from typing import List


class DescriptionWithException:
    def __init__(self, description: str, exceptions: List[str]) -> None:
        self.description = description
        self.exceptions = exceptions


class DescriptionWithExceptionWithVersion:
    def __init__(self, version: str, descriptions: List[DescriptionWithException]) -> None:
        self.version = version
        self.descriptions = descriptions


class DescriptionWithoutExceptionWithVersion:
    def __init__(self, version: str, descriptions: List[str]) -> None:
        self.version = version
        self.descriptions = descriptions
