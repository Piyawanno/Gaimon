from typing import List

from xerial.Modification import Modification

from gaimon.core.checkout.context.CheckoutContext import CheckoutContext


class ListContext(CheckoutContext):
	def __init__(self, extension: str) -> None:
		super().__init__(extension)

	def getModificationReport(self, mode: str = 'key') -> dict[str, dict]:
		"""
		All change in all models, version by version from freeze
		expected format {modelName: {version: [verbose]}}
		:return:
		"""
		return {
			modelName: self.getReport(modifications, mode)
			for modelName, modifications
			in self.modificationsDict.items()
		}

	def generateOutput(self, report: dict[str, dict]) -> str:
		"""
		Generate output for report
		:param report: dict
		:return: str
		"""
		output = (
			f"\n"
			f"###################################\n"
			f"# Modifications since last freeze #\n"
			f"###################################\n"
			f"\n"
			f"Extension: {self.extension}\n"
			f"\n"
		)

		for model, report in report.items():
			output += f"Model: {model}\n"
			for version, verbose in report.items():
				output += f"    Version: {version}\n"
				for modification in verbose:
					output += f"\t- {modification}\n"
			output += "\n"

		output += "Try `gaimon-checkout --analyze` to get the detailed report.\n"

		return output

	@staticmethod
	def getReport(modifications: List[Modification], mode: str = 'key') -> dict[str, list]:
		"""
		All change in 1 model, version by version
		:return: {version: [verbose]}
		"""
		return {
			modification.version.__str__(): [
				action.__str__() if mode == 'key' else action.verbose()
				for action
				in modification.column
			]
			for modification
			in modifications
		}


if __name__ == "__main__":
	listContext = ListContext("gaimonqa.shopping")
	print(listContext.getModificationReport())
