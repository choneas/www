import { estimatePageReadTime } from "notion-utils"
import type { Block, ExtendedRecordMap, NotionMapBox } from "notion-types"
import { formatReadingTime } from "@/utils/date-format"

/**
 * Get formatted reading time for a Notion page
 * @param recordMap - The Notion page record map
 * @param locale - Current locale for translation
 * @returns Formatted reading time string (e.g., "5 min" or its locale equivalent)
 */
export function getReadingTime(recordMap: ExtendedRecordMap, locale: string): string {
    const minutes = getReadingTimeMinutes(recordMap)
    return formatReadingTime(minutes, locale)
}

/**
 * Get raw reading time in minutes
 * @param recordMap - The Notion page record map
 * @returns Reading time in minutes
 */
export function getReadingTimeMinutes(recordMap: ExtendedRecordMap): number {
    const pageId = Object.keys(recordMap.block)[0]

    const blockBox = recordMap.block[pageId]
    if (!blockBox) return 1

    let block = blockBox.value as Block | NotionMapBox<Block>;
    if (block && 'value' in block && typeof (block as NotionMapBox<Block>).value === 'object') {
        block = (block as NotionMapBox<Block>).value as Block;
    }

    if (!block) {
        return 1
    }

    const estimate = estimatePageReadTime(block as Block, recordMap)

    return Math.ceil(estimate.totalReadTimeInMinutes)
}
