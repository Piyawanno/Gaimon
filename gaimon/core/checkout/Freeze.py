import json
import os


class Freeze:
    def __init__(self, extension: str) -> None:
        print(f"[Freeze] Loading freeze for {extension}")
        _split = extension.split(".")
        self.module = _split[0]
        self.extension = _split[1]
        self.content = self.get()

    def getPath(self, model: str) -> str:
        return self.content[model]['path']

    def getVersion(self, model: str) -> str:
        return self.content[model]['version']

    def appendAnalysis(self, model: str, analysis: str) -> None:
        path = self.getPath(model)

        if not os.path.exists(path):
            print(f"[Freeze] Path {path} does not exist.")
            return

        with open(path, 'a') as freezeFile:
            freezeFile.write(analysis)

        print(f"[Freeze] Analysis of {model} appended to {path}")

    def get(self) -> dict:
        with open("/var/gaimon/Freeze.json") as freezeFile:
            freeze = json.load(freezeFile)
        return freeze[self.module][self.extension]

    @staticmethod
    def getActualModelPath(freezePath: str, model: str) -> str:
        path_parts = os.path.split(freezePath)
        new_path = os.path.join(*path_parts[:-6], f"{model}.py")
        return new_path

    @staticmethod
    def getFreezeVersion() -> dict[str, str]:
        with open("/var/gaimon/Freeze.json") as versionFile:
            versions = json.load(versionFile)

        _freeze: dict[str, str] = {}

        for _, extensions in versions.items():
            for _, models in extensions.items():
                for model, value in models.items():
                    _freeze[model] = value['version']

        return _freeze


if __name__ == "__main__":
    freeze = Freeze("gaimonqa.shopping")
    print(freeze.getPath("OrderItem"))
    freeze.appendAnalysis("OrderItem", "This is an analysis")
    print(freeze.getFreezeVersion())
