package gameObjectsBase

type InventoryObj struct {
	Items map[int64] *Item
}

func (inv *InventoryObj) CellIsEmpty(cell int64) bool {
    empty := true
    for _, i  := range inv.Items {
        if cell == i.cell{
            empty = false
            break
        }
    }
    return empty
}

func (inv *InventoryObj) FindEmptyCell() (cell int64) {
    cell = 0
    for !inv.CellIsEmpty(cell) {
        cell = cell + 1
    }
    return cell
}

func NewInventoryObj() *InventoryObj {
	return &InventoryObj{make(map[int64]*Item)}
}
