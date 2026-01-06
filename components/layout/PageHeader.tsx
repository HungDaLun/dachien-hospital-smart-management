import React from 'react';

import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
    title: string;
    icon?: LucideIcon | string | React.ReactNode;
    actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    icon: Icon,
    actions
}) => {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-10 w-full px-2">
            <div className="flex items-center gap-4">
                {Icon && (
                    <div className="p-2.5 bg-primary-500/10 rounded-xl text-primary-400 shadow-inner flex items-center justify-center">
                        {typeof Icon === 'string' ? (
                            <span className="text-2xl">{Icon}</span>
                        ) : React.isValidElement(Icon) ? (
                            Icon
                        ) : (
                            //@ts-ignore
                            <Icon size={28} strokeWidth={2.5} />
                        )}
                    </div>
                )}
                <h1 className="text-4xl font-black tracking-tight uppercase text-white">
                    {title}
                </h1>
            </div>

            {actions && (
                <div className="flex items-center gap-4 w-full md:w-auto">
                    {actions}
                </div>
            )}
        </div>
    );
};

export default PageHeader;
