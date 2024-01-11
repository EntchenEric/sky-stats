import { Text } from "@mantine/core";

// This function converts a string with Minecraft color codes to a Mantine Text component
// Example:
//Input: §l§5Hello§6World!
//Output: <Text bold color="purple">Hello<Text bold color="orange">World!</Text></Text>
//Input: §l§2Hello §r§eWorld!
//Output: <Text bold color="green">Hello <Text color="yellow">World!</Text></Text>
export function minecraftColoredStringToText(text: string) {
    const colorCodes: any = {
        "0": "black",
        "1": "darkBlue",
        "2": "green",
        "3": "darkAqua",
        "4": "darkRed",
        "5": "darkPurple",
        "6": "gold",
        "7": "gray",
        "8": "darkGray",
        "9": "blue",
        "a": "lime",
        "b": "aqua",
        "c": "red",
        "d": "lightPurple",
        "e": "yellow",
        "f": "white",
        "k": "black",
        "l": "bold",
        "m": "strikethrough",
        "n": "underline",
        "o": "italic",
        "r": "reset",
    }
    const texts = text.split("§");
    texts.shift()
    if (texts.length === 0) return <Text>{text}</Text>
    return texts.map((text: string, index: number) => {
        const color = colorCodes[text[0]]
        const bold = text[0] === "l"
        const strikethrough = text[0] === "m"
        const underline = text[0] === "n"
        const italic = text[0] === "o"
        const reset = text[0] === "r"
        const textWithoutCurrentText = text.slice(1)

        return <Text key={index} c={color} fw={bold ? 700 : 500} td={strikethrough ? "line-through" : ""} fs={italic ? "italic" : ""} p={0} m={0}>{minecraftColoredStringToText(textWithoutCurrentText)}</Text>
    })
}