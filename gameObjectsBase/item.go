package gameObjectsBase

type Item struct {
    GameObject
    name string
    description string
func (i *Item) GetInfo() consts.JsonType {
	msg := make(consts.JsonType)
	msg["name"] = i.name
	msg["description"] = i.description
	msg["itemType"] = GetTypeByIota(i.itemType)
	msg["type"] = consts.ITEM_TYPE
	return msg
}
