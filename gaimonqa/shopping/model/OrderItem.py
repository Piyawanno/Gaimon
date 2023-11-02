from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn

class OrderItem (Record):
    date = DateTimeColumn() # Timestamp 
    quantity = IntegerColumn()
    product = IntegerColumn(foreignKey="Product.id")
    customer = IntegerColumn(foreignKey="Customer.id")