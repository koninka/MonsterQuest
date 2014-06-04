package gameObjectsBase

type InventoryObj struct {
	Items map[int64] *Item
}

func NewInventoryObj() *InventoryObj {
	return &InventoryObj{make(map[int64]*Item)}
}
