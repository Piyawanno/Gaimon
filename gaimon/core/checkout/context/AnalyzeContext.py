from datetime import datetime

from xerial.Modification import Modification
from xerial.Record import Record

from gaimon.core.checkout.context.CheckoutContext import CheckoutContext
from gaimon.core.checkout.models.DescriptionWithException import *


class AnalyzeContext(CheckoutContext):
	def __init__(self, extension: str) -> None:
		super().__init__(extension)
		self.ANALYZE_TEMPLATE = (
			"# The following content were generated by `gaimon-checkout --analyze`\n"
			"\"\"\"\n"
			"CHANGELOG\n"
			"GENERATED AT: {datetime}\n"
			"TABLE NAME: {tableName}\n"
			"FREEZE VERSION (destination): {destination}\n"
			"\n"
			"EFFECTIVE MODIFICATION(S):\n"
			"{effectiveModifications}\n"
			"\n"
			"SKIPPED MODIFICATION(S):\n"
			"{skippedModifications}\n"
			"\"\"\"\n"
		)

	def getAnalyzedReport(self) -> dict[str, str]:
		"""
		{model: report}
		:return:
		"""
		return {
			modelName: self.getReport(modelName, modifications)
			for modelName, modifications
			in self.modificationsDict.items()
		}

	def getReport(self, modelName: str, modifications: List[Modification]) -> str:
		print(f"[analyze context] Analyzing {modelName}")
		effective: List[DescriptionWithExceptionWithVersion] = self.getEffective(modifications)
		skipped: List[DescriptionWithoutExceptionWithVersion] = self.getSkipped(modifications)

		return self.ANALYZE_TEMPLATE.format(
			datetime=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
			tableName=modelName,
			destination=self.freeze.getVersion(modelName),
			effectiveModifications=self.generateEffectiveStr(effective),
			skippedModifications=self.generateSkippedStr(skipped)
		)

	@staticmethod
	def getEffective(modifications: List[Modification]) -> List[DescriptionWithExceptionWithVersion]:
		effective: List[DescriptionWithExceptionWithVersion] = []
		for modification in modifications:
			version = modification.version
			print(f"[analyze context] \tAnalyzing effective modifications of version {version}")
			analyzed: List[DescriptionWithException] = []
			for action in modification.column:
				descriptionWithException: DescriptionWithException = DescriptionWithException(
					action.verbose(),
					[exception.message for exception in action.analyze()]
				)
				analyzed.append(descriptionWithException)
			effective.append(DescriptionWithExceptionWithVersion(version.__str__(), analyzed))

		return effective

	@staticmethod
	def getSkipped(modifications: List[Modification]) -> List[DescriptionWithoutExceptionWithVersion]:
		skipped: List[DescriptionWithoutExceptionWithVersion] = []
		for version, actions in Record.getSkippedActions(modifications).items():
			print(f"[analyze context] \tAnalyzing skipped modifications of version {version}")
			skipped.append(DescriptionWithoutExceptionWithVersion(
				version,
				[action.verbose() for action in actions]
			))

		return skipped

	@staticmethod
	def generateEffectiveStr(raw: List[DescriptionWithExceptionWithVersion]) -> str:
		if not raw:
			return "\t- No effective modifications\n"

		effectiveModifications = ""
		for version in raw:
			effectiveModifications += f"\t- modification: {version.version}\n"
			for description in version.descriptions:
				effectiveModifications += f"\t\t- {description.description}\n"
				for exception in description.exceptions:
					effectiveModifications += f"\t\t\t- {exception}\n"
		return effectiveModifications

	@staticmethod
	def generateSkippedStr(raw: List[DescriptionWithoutExceptionWithVersion]) -> str:
		if not raw:
			return "\t- No skipped modifications\n"

		skippedModifications = ""
		for version in raw:
			skippedModifications += f"\t- modification: {version.version}\n"
			for description in version.descriptions:
				skippedModifications += f"\t\t- {description}\n"
		return skippedModifications


if __name__ == "__main__":
	analyzeContext = AnalyzeContext("gaimonqa.shopping")
	print(analyzeContext.getAnalyzedReport())
