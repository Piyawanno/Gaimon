import os
from typing import List

from xerial.Modification import Modification
from xerial.Record import Record

from gaimon.core.checkout.Freeze import Freeze
from gaimon.util.PathUtil import getModel


class CheckoutContext:
    def __init__(self, extension: str) -> None:
        self.extension = extension
        self.freeze = Freeze(self.extension)
        self.modificationsDict: dict[str, List[Modification]] = {}  # {model: [modifications]}

        self.setScopeModifications()

    def setScopeModifications(self) -> None:
        for modelName, value in self.freeze.get().items():
            path = os.path.join(*self.extension.split('.'), 'model', Freeze.getActualModelPath(value['path'], modelName))
            model: Record = getModel(modelName, path)()
            model.modify()
            self.modificationsDict[modelName] = model.getScopedModification(value['version'])


if __name__ == "__main__":
    checkoutContext = CheckoutContext("gaimonqa.shopping")
    print(checkoutContext.modificationsDict)
