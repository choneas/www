import { estimatePageReadTime } from "notion-utils"
import type { Block, ExtendedRecordMap, NotionMapBox } from "notion-types"
import { formatReadingTime } from "@/utils/date-format"

/**
 * Get formatted reading time for a Notion page
 * @param recordMap - The Notion page record map
 * @param locale - Current locale for translation
 * @returns Formatted reading time string (e.g., "5 分钟" or "5 minutes")
 */
export function getReadingTime(recordMap: ExtendedRecordMap, locale: string): string {
    const minutes = getReadingTimeMinutes(recordMap)
    // console.log('[getReadingTime] Calculated minutes:', minutes, 'for locale:', locale)
    return formatReadingTime(minutes, locale)
}

/**
 * Format reading time from minutes
 * @param minutes - Reading time in minutes
 * @param locale - Current locale for translation
 * @returns Formatted reading time string (e.g., "5 分钟" or "5 minutes")
 */
export function formatReadingTimeFromMinutes(minutes: number, locale: string): string {
    // console.log('[formatReadingTimeFromMinutes] Formatting', minutes, 'minutes for locale:', locale)
    return formatReadingTime(minutes, locale)
}

/**
 * Get raw reading time in minutes
 * @param recordMap - The Notion page record map
 * @returns Reading time in minutes
 */
export function getReadingTimeMinutes(recordMap: ExtendedRecordMap): number {
    const pageId = Object.keys(recordMap.block)[0]
    // console.log('[getReadingTimeMinutes] Processing pageId:', pageId)

    const blockBox = recordMap.block[pageId]
    if (!blockBox) return 1

    let block = blockBox.value as Block | NotionMapBox<Block>;
    if (block && 'value' in block && typeof (block as NotionMapBox<Block>).value === 'object') {
        block = (block as NotionMapBox<Block>).value as Block;
    }

    if (!block) {
        // console.warn('[getReadingTimeMinutes] No block found for pageId:', pageId)
        return 1
    }

    // console.log('[getReadingTimeMinutes] Block type:', block.type, 'Block ID:', block.id)

    const estimate = estimatePageReadTime(block as Block, recordMap)
    // console.log('[getReadingTimeMinutes] Estimate:', {
    //     totalReadTimeInMinutes: estimate.totalReadTimeInMinutes,
    //     totalWordsReadTimeInMinutes: estimate.totalWordsReadTimeInMinutes,
    //     totalImageReadTimeInMinutes: estimate.totalImageReadTimeInMinutes,
    //     numImages: estimate.numImages,
    //     roundedMinutes: minutes
    // })

    return Math.ceil(estimate.totalReadTimeInMinutes)
}
