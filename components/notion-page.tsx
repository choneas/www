"use client"

import * as React from 'react'
import { Link } from '@heroui/react'
import Image from 'next/image'
import dynamic from 'next/dynamic'
import { type ExtendedRecordMap } from 'notion-types'
import { NotionRenderer } from 'react-notion-x'
import { useTheme } from '@/components/theme-provider'
import 'react-notion-x/src/styles.css'
import 'prismjs/themes/prism-tomorrow.css'
import 'katex/dist/katex.min.css'

// Optimize dynamic imports with better loading states and SSR settings
const Code = dynamic(() =>
    import('react-notion-x/build/third-party/code').then((m) => m.Code),
    {
        ssr: false,
        loading: () => <div className="bg-content2 rounded p-2 animate-pulse h-20" />
    }
)

const Collection = dynamic(() =>
    import('react-notion-x/build/third-party/collection').then(
        (m) => m.Collection
    ),
    {
        ssr: false,
    }
)

const Equation = dynamic(() =>
    import('react-notion-x/build/third-party/equation').then((m) => m.Equation),
    {
        loading: () => <div className="bg-content2 rounded p-2 animate-pulse h-8 w-24" />
    }
)

const Pdf = dynamic(
    () => import('react-notion-x/build/third-party/pdf').then((m) => m.Pdf),
    {
        ssr: false,
        loading: () => <div className="bg-content2 rounded p-4 animate-pulse h-96" />
    }
)

const Modal = dynamic(
    () => import('react-notion-x/build/third-party/modal').then((m) => m.Modal),
    {
        ssr: false
    }
)

interface NotionPageProps {
    recordMap: ExtendedRecordMap;
    type?: "tweet-preview" | "tweet-details";
}

const NotionPage = ({ recordMap, type }: NotionPageProps) => {
    const { resolvedTheme } = useTheme();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
        setMounted(true);
    }, []);

    const isPreview = type === "tweet-preview";

    return (
        <div className={isPreview ? "notion tweet-preview" : "notion main-content"}>
            <NotionRenderer
                disableHeader
                recordMap={recordMap}
                darkMode={mounted ? resolvedTheme === 'dark' : false}
                fullPage={false}
                components={{
                    Code,
                    Collection,
                    Equation,
                    Modal,
                    Pdf,
                    nextImage: Image,
                    nextLink: Link
                }}
            />
            {/* TODO: Re-enable when HeroUI 3.0 Table component is available */}
            {/* <NotionTableReplacer /> */}
        </div>
    )
}

// TODO: Verify HeroUI 3.0 Table API before re-enabling
// HeroUI 3.0 beta does not include a Table component yet.
// The Table component from v2 is not available in v3.0.0-beta.1.
// This component needs to be updated once the Table API is available in HeroUI 3.0.
// Requirements: 6.3, 6.4
// Temporarily disabled - HeroUI 3.0 Table component not available
// const NotionTableReplacer = () => {
    // React.useEffect(() => {
    //     if (typeof document === 'undefined') return;
    //     const notionTables = document.querySelectorAll('.notion-simple-table');
    //     notionTables.forEach((notionTable, tableIndex) => {
    //         if ((notionTable as HTMLElement).dataset.herouiReplaced) return;
    //         const rows = Array.from(notionTable.querySelectorAll('tr'));
    //         if (rows.length === 0) return;
    //         const headerRow = rows[0];
    //         const dataRows = rows.slice(1);
    //         const headerCells = Array.from(headerRow.querySelectorAll('td'));
    //         const columns = headerCells.map((td, index) => ({
    //             key: `col_${index}`,
    //             label: <>{Array.from(td.querySelectorAll('.notion-simple-table-cell')).map((cell, i) => <span key={i} dangerouslySetInnerHTML={{ __html: cell.innerHTML }} />)}</>
    //         }));
    //         const items = dataRows.map((row, rowIndex) => {
    //             const cells = Array.from(row.querySelectorAll('td'));
    //             const rowData: { [key: string]: React.ReactNode; id: string } = { id: `row_${rowIndex}` };
    //             columns.forEach((col, cellIndex) => {
    //                 const cell = cells[cellIndex];
    //                 if (!cell) return;
    //                 const notionCellDivs = cell.querySelectorAll('.notion-simple-table-cell');
    //                 rowData[col.key] = (
    //                     <>
    //                         {Array.from(notionCellDivs).map((div, i) => (
    //                             <span key={i} dangerouslySetInnerHTML={{ __html: div.innerHTML }} />
    //                         ))}
    //                     </>
    //                 );
    //             });
    //             return rowData;
    //         });
    //         const tableWrapper = document.createElement('div');
    //         tableWrapper.className = 'my-4 w-full outline-(--outline)';
    //         tableWrapper.setAttribute('data-heroui-table', 'true');
    //         notionTable.parentNode?.insertBefore(tableWrapper, notionTable.nextSibling);
    //         import('@heroui/react').then(({ Table, TableHeader, TableBody, TableColumn, TableRow, TableCell }) => {
    //             import('react-dom/client').then(({ createRoot }) => {
    //                 const root = createRoot(tableWrapper);
    //                 root.render(
    //                     <Table aria-label={`Notion Table ${tableIndex + 1}`}>
    //                         <TableHeader columns={columns}>
    //                             {(column) => (
    //                                 <TableColumn key={column.key} className='bg-content2'>{column.label}</TableColumn>
    //                             )}
    //                         </TableHeader>
    //                         <TableBody items={items}>
    //                             {(item) => (
    //                                 <TableRow key={item.id}>
    //                                     {columns.map((col) => (
    //                                         <TableCell key={col.key}>{item[col.key]}</TableCell>
    //                                     ))}
    //                                 </TableRow>
    //                             )}
    //                         </TableBody>
    //                     </Table>
    //                 );
    //                 (notionTable as HTMLElement).style.display = 'none';
    //                 (notionTable as HTMLElement).dataset.herouiReplaced = 'true';
    //             });
    //         });
    //     });
    // }, []);
    // return null;
// };

export default NotionPage;
