package gameObjectsBase

type InventoryObj struct {
	Items map[int64] *Item
}

func (inv *InventoryObj) FindEmptyCell() (cell int64) {
    cell = 0
    empty := false
    for !empty {
        empty = true
        for _, i  := range inv.Items {
            if cell == i.cell{
                empty = false
                cell = cell + 1
                break
            }
        }
    }
    return cell
}

func NewInventoryObj() *InventoryObj {
	return &InventoryObj{make(map[int64]*Item)}
}
