/**
 * TableHeader 元件
 * 統一表格標題樣式
 */
'use client';

import { ThHTMLAttributes, forwardRef } from 'react';

export interface TableHeaderProps extends ThHTMLAttributes<HTMLTableCellElement> {
    /** 是否可排序 (預留功能) */
    sortable?: boolean;
}

export const TableHeader = forwardRef<HTMLTableCellElement, TableHeaderProps>(
    ({ className = '', children, ...props }, ref) => {
        return (
            <th
                ref={ref}
                className={`
          py-4 px-6 
          text-left 
          text-[10px] md:text-xs 
          font-bold 
          text-text-tertiary 
          uppercase 
          tracking-widest 
          ${className}
        `}
                {...props}
            >
                {children}
            </th>
        );
    }
);

TableHeader.displayName = 'TableHeader';

export default TableHeader;
