
import React from 'react';
import { Transaction, TransactionType, CategoryConfig } from '../types';
import { ICONS } from '../constants';

interface TransactionListProps {
  transactions: Transaction[];
  categories: CategoryConfig[];
  onDelete: (id: string) => void;
  onEdit: (transaction: Transaction) => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, categories, onDelete, onEdit }) => {
  const sortedTransactions = [...transactions].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden transition-colors">
      <div className="p-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Transações Recentes</h3>
        <span className="text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-full">
          {transactions.length} registros
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
            <tr>
              <th className="px-6 py-4">Data</th>
              <th className="px-6 py-4">Descrição</th>
              <th className="px-6 py-4">Categoria</th>
              <th className="px-6 py-4 text-right">Valor</th>
              <th className="px-6 py-4 text-center w-28">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
            {sortedTransactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-600">
                  Nenhuma transação registrada ainda.
                </td>
              </tr>
            ) : (
              sortedTransactions.map((t) => {
                const categoryConfig = categories.find(c => c.id === t.category);
                return (
                  <tr key={t.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                      {new Date(t.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-700 dark:text-slate-300">
                      {t.description}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {categoryConfig?.icon || '✨'} {categoryConfig?.label || t.category}
                      </span>
                    </td>
                    <td className={`px-6 py-4 text-sm font-bold text-right ${
                      t.type === TransactionType.INCOME ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                    }`}>
                      {t.type === TransactionType.INCOME ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => onEdit(t)}
                          className="text-slate-300 dark:text-slate-600 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors p-1"
                          title="Editar"
                        >
                          <ICONS.Edit />
                        </button>
                        <button
                          onClick={() => onDelete(t.id)}
                          className="text-slate-300 dark:text-slate-600 hover:text-rose-500 dark:hover:text-rose-400 transition-colors p-1"
                          title="Excluir"
                        >
                          <ICONS.Trash />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;
