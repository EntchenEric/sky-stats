import { useEffect, useState } from "react";
import { decodeSkyblockData } from "../../api/decodeSkyblockData";
import { Group, HoverCard, SimpleGrid, Text, Paper, Divider, Container } from "@mantine/core";
import { SkyblockItem } from "@/types/skyblockItem";
import styled from '@emotion/styled';
import { ItemCard } from "../ItemCard/ItemCard";
import { getSkullFromSkin } from "@/helper/getSkullFromSkin";
import { getUUIDFromBase64String } from "@/helper/getUUIDFromBase64String";
import { minecraftColoredStringToText } from "./minecraftColoredStringToText";
import { getItemTexture } from "@/helper/getItemTexture";
import { getRGBtoHex } from "@/helper/getRGBtoHex";


export function PlayerInventory({ profileData, uuid }: { profileData: any, uuid: string }) {
    const [inventoryData, setInventoryData] = useState(
        decodeSkyblockData(profileData.members[uuid.replaceAll("-", "")].inventory.inv_contents.data)
    );
    const [inventory, setInventory] = useState([]);

    useEffect(() => {
        // //console.log(getHexColorfromDecimalColor(16711680))
        // //console.log(getHexColorfromDecimalColor(16719671))
        inventoryContents()
    }, []);

    const raritys = [
        "COMMON",
        "UNCOMMON",
        "RARE",
        "EPIC",
        "LEGENDARY",
        "MYTHIC",
        "DIVINE",
        "SPECIAL",
        "VERY SPECIAL"
    ]

    const inventoryContents = async () => {
        const inv = await inventoryData;
        let parsedInv = inv.parsed.value.i.value.value
        let firstNineSlots = parsedInv.slice(0, 9);

        parsedInv = parsedInv.slice(9);

        parsedInv = parsedInv.concat(firstNineSlots);

        const inventoryItems: Array<SkyblockItem> = [];

        const itemIDs = parsedInv.map((item: any) => {
            if (item.tag) {
                const itemID = item.tag.value.ExtraAttributes.value.id.value;
                inventoryItems.push(itemID);
                return itemID;
            }
        });

        const skyblockItems = await fetch("api/bulkGetSkyblockItemData",
            {
                method: "POST",
                body: JSON.stringify({ ids: itemIDs }),
            });

        const itemData = await skyblockItems.json();


        const newInventory: any = [];

        for (let i = 0; i < parsedInv.length; i++) {
            const element = parsedInv[i];
            if (!element.tag) newInventory.push({})
            else {
                // //console.log(element)
                const itemID = element.tag.value.ExtraAttributes.value.id.value;
                const correspondingItem = itemData.find((item: { itemID: any; }) => item.itemID === itemID);
                if (correspondingItem) {
                    correspondingItem["lore"] = element.tag.value.display.value.Lore.value.value;
                    if (!correspondingItem["lore"][correspondingItem["lore"].length - 1].includes(correspondingItem.tier)) {
                        const rarityIndex = raritys.indexOf(correspondingItem.tier);
                        correspondingItem.tier = raritys[rarityIndex + 1];
                    }
                    correspondingItem['color'] = element.tag.value.ExtraAttributes.value.color ? getRGBtoHex(element.tag.value.ExtraAttributes.value.color.value) : undefined;
                    if (correspondingItem) correspondingItem["texture"] = await getItemTexture(correspondingItem.itemID, correspondingItem.skin, correspondingItem["color"])
                    newInventory.push(correspondingItem);
                }
            }
        }
        console.log(newInventory)
        setInventory(newInventory)
    }

    const getItemTexture123 = async (item: any) => {
        if (item.skin) {
            if (item.skin != "idk") {
                return getSkullFromSkin(getUUIDFromBase64String(item.skin))
            } else {
                return "https://static.wikia.nocookie.net/minecraft_gamepedia/images/4/4a/Barrier_JE2_BE2.png/revision/latest/scale-to-width-down/150?cb=20200329164158"
            }
        } else {
            const response = await fetch("api/getItemTexture", {
                method: "POST",
                body: JSON.stringify({ material: item.itemID }),
            });
            const data = await response.json();
            return data.url;
        }
    }

    return (
        <>
            <SimpleGrid cols={9}>
                {
                    inventory.map((item: any) => {
                        let itemName = ""
                        let itemLore: any
                        if (item && item.itemID != undefined) {

                            // //console.log(item.lore)
                            itemName = item.name
                            itemLore = <Group>
                                {
                                    item.lore.map((lore: string) => {
                                        return <Container display="flex">
                                            {
                                                lore != "" ? <Text>{minecraftColoredStringToText(lore)}</Text>
                                                    : <Divider />

                                            }
                                        </Container>
                                    })
                                }
                            </Group>
                        }
                        if (itemName === "") return (<Paper w={{ base: 50, lg: 100, sm: 75 }} h={{ base: 50, lg: 100, sm: 75 }} shadow="xs" radius="md" withBorder></Paper>)
                        return (
                            <ItemCard
                                name={itemName}
                                description={itemLore}
                                imageurl={item.texture}
                                rarity={item.tier}
                                rarityUpgraded={false}
                            />
                        )
                    })
                }
            </SimpleGrid>
        </>
    )
}