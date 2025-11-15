import React, { useMemo } from 'react';
import { ShoppingListItem } from '../types';

const TrashIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" /></svg>);
const ClipboardIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 2a2 2 0 00-2 2v12a2 2 0 002 2h6a2 2 0 002-2V4a2 2 0 00-2-2H7zm0 2h6v12H7V4zm3 1a1 1 0 011 1v1a1 1 0 11-2 0V6a1 1 0 011-1z" /></svg>);
const PrintIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v6a2 2 0 002 2h1v-4a1 1 0 011-1h10a1 1 0 011 1v4h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" /></svg>);

interface ShoppingListPageProps {
  list: ShoppingListItem[];
  onToggleItem: (id: string) => void;
  onRemoveItem: (id: string) => void;
  onClearList: () => void;
}

export const ShoppingListPage: React.FC<ShoppingListPageProps> = ({ list, onToggleItem, onRemoveItem, onClearList }) => {
    
    const groupedList = useMemo(() => {
        // Fix: Explicitly type the initial value for the reduce function to ensure TypeScript's type inference is correct.
        return list.reduce((acc, item) => {
            (acc[item.recipeName] = acc[item.recipeName] || []).push(item);
            return acc;
        }, {} as Record<string, ShoppingListItem[]>);
    }, [list]);

    const handleCopyToClipboard = () => {
        const text = Object.entries(groupedList).map(([recipeName, items]) => {
            const ingredientsText = items.map(item => `- ${item.ingredient}`).join('\n');
            return `${recipeName}:\n${ingredientsText}`;
        }).join('\n\n');
        navigator.clipboard.writeText(text).then(() => {
            alert('Shopping list copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Could not copy to clipboard.');
        });
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="animate-fade-in print-area">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4 no-print">
                <h2 className="text-3xl font-bold text-gray-300 text-center sm:text-left">My Shopping List</h2>
                <div className="flex items-center gap-4">
                    <button onClick={handleCopyToClipboard} disabled={list.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-600 transition-colors"><ClipboardIcon /> Copy</button>
                    <button onClick={handlePrint} disabled={list.length === 0} className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 disabled:bg-gray-600 transition-colors"><PrintIcon /> Print</button>
                    <button onClick={onClearList} disabled={list.length === 0} className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition-colors">Clear All</button>
                </div>
            </div>

            {list.length === 0 ? (
                <div className="text-center py-12 px-6 bg-gray-800 rounded-lg">
                    <p className="text-xl text-gray-400">Your shopping list is empty.</p>
                    <p className="text-gray-500 mt-2">Add ingredients from a recipe to get started.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedList).map(([recipeName, items]) => (
                        <div key={recipeName} className="bg-gray-800 p-4 rounded-lg shadow-md">
                            <h3 className="text-xl font-semibold text-orange-400 mb-3 border-b border-gray-700 pb-2">{recipeName}</h3>
                            <ul className="space-y-2">
                                {items.map(item => (
                                    <li key={item.id} className="flex items-center justify-between group">
                                        <label className="flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox"
                                                checked={item.isChecked}
                                                onChange={() => onToggleItem(item.id)}
                                                className="h-5 w-5 rounded bg-gray-700 border-gray-600 text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className={`ml-3 text-gray-300 ${item.isChecked ? 'line-through text-gray-500' : ''}`}>
                                                {item.ingredient}
                                            </span>
                                        </label>
                                        <button 
                                            onClick={() => onRemoveItem(item.id)}
                                            className="p-1 text-gray-500 hover:text-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity no-print"
                                            title="Remove item"
                                        >
                                            <TrashIcon />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};