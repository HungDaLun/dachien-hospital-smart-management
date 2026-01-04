import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface TemplateCardProps {
    template: any;
    selected: boolean;
    onSelect: (template: any) => void;
}

export default function TemplateCard({ template, selected, onSelect }: TemplateCardProps) {
    return (
        <div
            onClick={() => onSelect(template)}
            className={`
        relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
        ${selected
                    ? 'border-blue-500 bg-blue-50 ring-4 ring-blue-100'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }
      `}
        >
            <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-lg ${selected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                    {/* Fallback icon if no category icon mapped */}
                    <DocumentTextIcon className="w-6 h-6" />
                </div>
                {selected && (
                    <CheckCircleIcon className="w-6 h-6 text-blue-500" />
                )}
            </div>

            <h3 className="font-bold text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-500 line-clamp-2 h-10 mb-3">
                {template.description}
            </p>

            <div className="flex flex-wrap gap-1">
                <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {template.category}
                </span>
                {template.is_official && (
                    <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                        Official
                    </span>
                )}
            </div>
        </div>
    );
}
