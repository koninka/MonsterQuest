package gameObjectsBase

type InventoryObj struct {
	Items map[int64] *Item
}

func (inv *InventoryObj) CellIsEmpty(cell int64) bool {
    for _, i  := range inv.Items {
        if cell == i.cell {
            return false
        }
    }
    return true
}

func (inv *InventoryObj) FindEmptyCell() (cell int64) {
    cell = 0
    for !inv.CellIsEmpty(cell) {
        cell++
    }
    return cell
}

func NewInventoryObj() *InventoryObj {
	return &InventoryObj{make(map[int64]*Item)}
}
