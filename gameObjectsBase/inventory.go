package gameObjectsBase

type InventoryObj struct {
	Items []*Item
}

func NewInventoryObj() *InventoryObj {
	return &InventoryObj{make([]*Item, 0, 1000)}
}
