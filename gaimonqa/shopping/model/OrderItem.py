from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn

class Order (Record):
    date = DateTimeColumn() # Timestamp 
    customer = IntegerColumn(foreignKey="Customer.id")