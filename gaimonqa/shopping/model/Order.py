from xerial.Record import Record
from xerial.DateTimeColumn import DateTimeColumn
from xerial.IntegerColumn import IntegerColumn
from xerial.Children import Children

class Order (Record):
    date = DateTimeColumn() # Timestamp 
    customer = IntegerColumn(foreignKey="Customer.id")
    orderItem = Children("OrderItem.id")